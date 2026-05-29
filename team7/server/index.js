// Node.js v22+ 내장 SQLite 사용 (네이티브 빌드 불필요)
const { DatabaseSync } = require('node:sqlite')
const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

// 팀 루트(.env)에서 포트 읽기 (의존성 없이) — 폴더별 포트 분리
const envPath = path.join(__dirname, '..', '.env')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach((line) => {
    const [key, ...rest] = line.split('=')
    const val = rest.join('=')
    if (key && val && !key.trim().startsWith('#')) process.env[key.trim()] = val.trim()
  })
}

const app = express()
const PORT = process.env.SERVER_PORT || 4007
const ADMIN_KEY = '0207'
const DB_PATH = path.join(__dirname, 'sqb.db')

app.use(cors())
app.use(express.json())

// ─────────────────────────────────────────────
// DB 초기화
// ─────────────────────────────────────────────
const db = new DatabaseSync(DB_PATH)

db.exec(`PRAGMA journal_mode = WAL;`)
db.exec(`PRAGMA foreign_keys = ON;`)

db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    school     TEXT    NOT NULL,
    grade      TEXT    NOT NULL,
    class      TEXT    NOT NULL,
    password   TEXT    NOT NULL,
    created_at TEXT    DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS quests (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id     INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    title       TEXT    NOT NULL,
    subject     TEXT    DEFAULT '',
    due         TEXT    DEFAULT '',
    description TEXT    DEFAULT '',
    created_at  TEXT    DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS quest_done (
    room_id   INTEGER NOT NULL REFERENCES rooms(id)  ON DELETE CASCADE,
    quest_id  INTEGER NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    username  TEXT    NOT NULL,
    PRIMARY KEY (quest_id, username)
  );

  CREATE TABLE IF NOT EXISTS qa (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id    INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    nickname   TEXT    NOT NULL DEFAULT '익명',
    title      TEXT    NOT NULL,
    body       TEXT    NOT NULL,
    category   TEXT    NOT NULL DEFAULT 'etc',
    created_at TEXT    DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS answers (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    qa_id      INTEGER NOT NULL REFERENCES qa(id) ON DELETE CASCADE,
    nickname   TEXT    NOT NULL DEFAULT '익명',
    body       TEXT    NOT NULL,
    created_at TEXT    DEFAULT (datetime('now','localtime'))
  );
`)

console.log('✅ DB 초기화 완료')

// ─────────────────────────────────────────────
// 미들웨어
// ─────────────────────────────────────────────
function requireAdmin(req, res, next) {
  if (req.headers['x-admin-key'] !== ADMIN_KEY) {
    return res.status(403).json({ error: '관리자 권한이 필요합니다' })
  }
  next()
}

// ─────────────────────────────────────────────
// 방 (Rooms)
// ─────────────────────────────────────────────

app.get('/api/rooms', (req, res) => {
  const rows = db.prepare(
    'SELECT id, school, grade, class, created_at FROM rooms ORDER BY id DESC'
  ).all()
  res.json(rows)
})

app.get('/api/rooms/admin', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM rooms ORDER BY id DESC').all()
  res.json(rows)
})

app.post('/api/rooms', (req, res) => {
  const { school, grade, class: cls, password } = req.body
  if (!school || !grade || !cls || !password) {
    return res.status(400).json({ error: '필수 항목이 누락되었습니다' })
  }
  // 비밀번호: 영문+숫자 조합 4자리
  if (!/^[A-Za-z0-9]{4}$/.test(password)) {
    return res.status(400).json({ error: '비밀번호는 영문/숫자 조합 4자리여야 합니다' })
  }
  const result = db.prepare(
    'INSERT INTO rooms (school, grade, class, password) VALUES (?, ?, ?, ?)'
  ).run(school, grade, cls, password)
  res.json({ id: Number(result.lastInsertRowid), school, grade, class: cls })
})

app.put('/api/rooms/:id', requireAdmin, (req, res) => {
  const { school, grade, class: cls, password } = req.body
  db.prepare(
    'UPDATE rooms SET school=?, grade=?, class=?, password=? WHERE id=?'
  ).run(school, grade, cls, password, Number(req.params.id))
  res.json({ ok: true })
})

app.delete('/api/rooms/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM rooms WHERE id=?').run(Number(req.params.id))
  res.json({ ok: true })
})

app.post('/api/rooms/:id/verify', (req, res) => {
  const { password } = req.body
  const room = db.prepare('SELECT * FROM rooms WHERE id=?').get(Number(req.params.id))
  if (!room) return res.status(404).json({ error: '방을 찾을 수 없습니다' })
  if (room.password !== password) return res.status(401).json({ error: '비밀번호가 틀렸습니다' })
  res.json({ ok: true, school: room.school, grade: room.grade, class: room.class })
})

// ─────────────────────────────────────────────
// 퀘스트 (Quests)
// ─────────────────────────────────────────────

app.get('/api/rooms/:id/quests', (req, res) => {
  const roomId = Number(req.params.id)
  const { username } = req.query
  const quests = db.prepare(
    'SELECT * FROM quests WHERE room_id=? ORDER BY id DESC'
  ).all(roomId)

  let doneIds = new Set()
  if (username) {
    const rows = db.prepare(
      'SELECT quest_id FROM quest_done WHERE room_id=? AND username=?'
    ).all(roomId, username)
    doneIds = new Set(rows.map(r => Number(r.quest_id)))
  }

  res.json(quests.map(q => ({ ...q, done: doneIds.has(Number(q.id)) ? 1 : 0 })))
})

app.post('/api/rooms/:id/quests', (req, res) => {
  const roomId = Number(req.params.id)
  const { title, subject, due, description } = req.body
  if (!title) return res.status(400).json({ error: '제목을 입력하세요' })
  const result = db.prepare(
    'INSERT INTO quests (room_id, title, subject, due, description) VALUES (?, ?, ?, ?, ?)'
  ).run(roomId, title, subject || '', due || '', description || '')
  res.json({
    id: Number(result.lastInsertRowid),
    room_id: roomId,
    title,
    subject: subject || '',
    due: due || '',
    description: description || '',
    done: 0,
  })
})

app.put('/api/rooms/:roomId/quests/:questId', (req, res) => {
  const { title, subject, due, description } = req.body
  db.prepare(
    'UPDATE quests SET title=?, subject=?, due=?, description=? WHERE id=? AND room_id=?'
  ).run(title, subject || '', due || '', description || '', Number(req.params.questId), Number(req.params.roomId))
  res.json({ ok: true })
})

app.delete('/api/rooms/:roomId/quests/:questId', (req, res) => {
  db.prepare('DELETE FROM quests WHERE id=? AND room_id=?').run(
    Number(req.params.questId), Number(req.params.roomId)
  )
  res.json({ ok: true })
})

app.post('/api/rooms/:roomId/quests/:questId/toggle', (req, res) => {
  const roomId = Number(req.params.roomId)
  const questId = Number(req.params.questId)
  const { username } = req.body
  if (!username) return res.status(400).json({ error: '이름이 필요합니다' })

  const existing = db.prepare(
    'SELECT 1 FROM quest_done WHERE quest_id=? AND username=?'
  ).get(questId, username)

  if (existing) {
    db.prepare('DELETE FROM quest_done WHERE quest_id=? AND username=?').run(questId, username)
    res.json({ done: false })
  } else {
    db.prepare(
      'INSERT INTO quest_done (room_id, quest_id, username) VALUES (?, ?, ?)'
    ).run(roomId, questId, username)
    res.json({ done: true })
  }
})

// ─────────────────────────────────────────────
// Q&A
// ─────────────────────────────────────────────

app.get('/api/rooms/:id/qa', (req, res) => {
  const roomId = Number(req.params.id)
  const questions = db.prepare(
    'SELECT * FROM qa WHERE room_id=? ORDER BY id DESC'
  ).all(roomId)

  const allAnswers = db.prepare(
    'SELECT a.* FROM answers a JOIN qa q ON a.qa_id=q.id WHERE q.room_id=? ORDER BY a.id ASC'
  ).all(roomId)

  const answerMap = {}
  allAnswers.forEach(a => {
    const key = Number(a.qa_id)
    if (!answerMap[key]) answerMap[key] = []
    answerMap[key].push(a)
  })

  res.json(questions.map(q => ({ ...q, answers: answerMap[Number(q.id)] || [], open: false })))
})

app.post('/api/rooms/:id/qa', (req, res) => {
  const roomId = Number(req.params.id)
  const { nickname, title, body, category } = req.body
  if (!title || !body) return res.status(400).json({ error: '제목과 내용을 입력하세요' })
  const result = db.prepare(
    'INSERT INTO qa (room_id, nickname, title, body, category) VALUES (?, ?, ?, ?, ?)'
  ).run(roomId, nickname || '익명', title, body, category || 'etc')
  res.json({ id: Number(result.lastInsertRowid) })
})

app.post('/api/rooms/:roomId/qa/:qaId/answers', (req, res) => {
  const { nickname, body } = req.body
  if (!body) return res.status(400).json({ error: '내용을 입력하세요' })
  const result = db.prepare(
    'INSERT INTO answers (qa_id, nickname, body) VALUES (?, ?, ?)'
  ).run(Number(req.params.qaId), nickname || '익명', body)
  res.json({ id: Number(result.lastInsertRowid) })
})

// ─────────────────────────────────────────────
// 서버 시작
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ SQB 서버 실행 중: http://localhost:${PORT}`)
})
