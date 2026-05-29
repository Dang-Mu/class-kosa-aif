import { useState, useEffect, useCallback } from 'react'
import * as api from '../../api'

const CAT_LABEL = { quest: '📋 퀘스트', school: '🏫 학교생활', etc: '💡 기타' }
const CAT_COLOR = { quest: '#60a5fa', school: '#4ade80', etc: '#facc15' }

function QAItem({ item, onOpenAnswer, onToggleAnswers }) {
  const color = CAT_COLOR[item.category] || CAT_COLOR.etc
  const label = CAT_LABEL[item.category] || CAT_LABEL.etc

  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', marginBottom: 12 }}>
      <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14, textAlign: 'left' }}>
        <span style={{ background: `${color}22`, color, border: `1px solid ${color}44`, padding: '3px 8px', fontSize: 11, flexShrink: 0, marginTop: 3 }}>
          {label}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, marginBottom: 4 }}>{item.title}</div>
          <div style={{ fontSize: 12, opacity: 0.5, whiteSpace: 'pre-wrap' }}>{item.body}</div>
          <div style={{ fontSize: 11, opacity: 0.3, marginTop: 6 }}>{item.nickname} · {item.created_at}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0, alignItems: 'flex-end' }}>
          <button onClick={() => onOpenAnswer(item)} style={{
            background: 'transparent', border: '1px solid var(--point)', color: 'var(--point)',
            padding: '5px 12px', fontFamily: "'DungGeunMo',monospace", fontSize: 12, cursor: 'none',
          }}>+ 답변</button>
          {item.answers.length > 0 && (
            <button onClick={() => onToggleAnswers(item.id)} style={{
              background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)',
              padding: '5px 12px', fontFamily: "'DungGeunMo',monospace", fontSize: 12, cursor: 'none', opacity: 0.6,
            }}>
              {item.open ? '▲ 접기' : `▼ 답변 ${item.answers.length}개`}
            </button>
          )}
        </div>
      </div>

      {item.open && item.answers.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {item.answers.map((a) => (
            <div key={a.id} style={{ padding: '14px 20px 14px 48px', borderBottom: '1px solid #ffffff08', display: 'flex', gap: 12, textAlign: 'left' }}>
              <span style={{ color: 'var(--point)', flexShrink: 0 }}>↳</span>
              <div>
                <div style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{a.body}</div>
                <div style={{ fontSize: 11, opacity: 0.3, marginTop: 4 }}>{a.nickname} · {a.created_at}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AnswerForm({ question, onSubmit, onCancel, showToast }) {
  const [nickname, setNickname] = useState('')
  const [body, setBody] = useState('')

  const handleSubmit = async () => {
    if (!body.trim()) { showToast('❌ 답변 내용을 입력하세요'); return }
    await onSubmit(question.id, nickname.trim() || '익명', body.trim())
    setNickname(''); setBody('')
  }

  return (
    <div style={{ background: '#0b0c0d', border: '2px solid var(--point)', padding: 16, marginBottom: 16 }}>
      <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 8 }}>Q. {question.title}</div>
      <input type="text" placeholder="닉네임" value={nickname} onChange={(e) => setNickname(e.target.value)} style={{ marginBottom: 8, fontSize: 13 }} />
      <textarea placeholder="답변을 입력하세요..." value={body} onChange={(e) => setBody(e.target.value)}
        style={{ width: '100%', background: '#141517', border: '2px solid var(--border)', color: 'var(--point)', padding: 12, fontFamily: "'DungGeunMo',monospace", fontSize: 13, resize: 'vertical', minHeight: 70, marginBottom: 10, textAlign: 'left' }} />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{ background: 'none', border: '1px solid var(--border)', color: '#888', padding: '6px 14px', fontFamily: "'DungGeunMo',monospace", fontSize: 12, cursor: 'none' }}>취소</button>
        <button className="btn-pixel" style={{ padding: '6px 16px', fontSize: 12 }} onClick={handleSubmit}>등록</button>
      </div>
    </div>
  )
}

export default function QAPanel({ roomId, showToast }) {
  const [qaList, setQaList] = useState([])
  const [nickname, setNickname] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('quest')
  const [answeringItem, setAnsweringItem] = useState(null)

  const loadQA = useCallback(async () => {
    try {
      const data = await api.getQA(roomId)
      setQaList(data)
    } catch (e) {
      showToast('❌ Q&A 로드 실패')
    }
  }, [roomId])

  useEffect(() => { loadQA() }, [loadQA])

  const handleSubmitQuestion = async () => {
    if (!title.trim()) { showToast('❌ 질문 제목을 입력하세요'); return }
    if (!body.trim())  { showToast('❌ 질문 내용을 입력하세요'); return }
    try {
      await api.createQuestion(roomId, { nickname: nickname.trim() || '익명', title: title.trim(), body: body.trim(), category })
      setNickname(''); setTitle(''); setBody('')
      showToast('✅ 질문이 등록되었습니다')
      loadQA()
    } catch (e) {
      showToast('❌ ' + e.message)
    }
  }

  const handleSubmitAnswer = async (qaId, nick, answerBody) => {
    try {
      await api.createAnswer(roomId, qaId, { nickname: nick, body: answerBody })
      showToast('✅ 답변이 등록되었습니다')
      setAnsweringItem(null)
      loadQA()
    } catch (e) {
      showToast('❌ ' + e.message)
    }
  }

  const handleToggleAnswers = (qaId) => {
    setQaList((prev) => prev.map((q) => q.id === qaId ? { ...q, open: !q.open } : q))
  }

  return (
    <div>
      {/* 질문 작성 폼 */}
      <div style={{ background: 'var(--panel)', border: '2px dashed var(--border)', padding: 20, marginBottom: 25 }}>
        <div style={{ fontSize: 13, opacity: 0.5, marginBottom: 12 }}>[ 새 질문 등록 ]</div>
        <input type="text" placeholder="닉네임" value={nickname} onChange={(e) => setNickname(e.target.value)} style={{ marginBottom: 10, fontSize: 14 }} />
        <input type="text" placeholder="질문 제목" value={title} onChange={(e) => setTitle(e.target.value)} style={{ marginBottom: 10, fontSize: 14 }} />
        <textarea placeholder="질문 내용을 입력하세요..." value={body} onChange={(e) => setBody(e.target.value)}
          style={{ width: '100%', background: '#0b0c0d', border: '2px solid var(--border)', color: 'var(--point)', padding: 14, fontFamily: "'DungGeunMo',monospace", fontSize: 14, resize: 'vertical', minHeight: 80, marginBottom: 10, textAlign: 'left' }} />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            style={{ background: '#0b0c0d', border: '2px solid var(--border)', color: 'var(--point)', padding: 10, fontFamily: "'DungGeunMo',monospace", fontSize: 13, cursor: 'none', width: 'auto' }}>
            <option value="quest">📋 퀘스트 관련</option>
            <option value="school">🏫 학교 생활</option>
            <option value="etc">💡 기타</option>
          </select>
          <button className="btn-pixel" style={{ padding: '10px 20px', fontSize: 14 }} onClick={handleSubmitQuestion}>질문 올리기</button>
        </div>
      </div>

      {/* 답변 작성 폼 */}
      {answeringItem && (
        <AnswerForm question={answeringItem} onSubmit={handleSubmitAnswer} onCancel={() => setAnsweringItem(null)} showToast={showToast} />
      )}

      {/* 질문 목록 */}
      {qaList.length === 0 ? (
        <div style={{ textAlign: 'center', opacity: 0.3, padding: 60, border: '2px dashed var(--border)' }}>
          [ 등록된 질문 없음 ]
        </div>
      ) : (
        qaList.map((q) => (
          <QAItem key={q.id} item={q} onOpenAnswer={setAnsweringItem} onToggleAnswers={handleToggleAnswers} />
        ))
      )}
    </div>
  )
}
