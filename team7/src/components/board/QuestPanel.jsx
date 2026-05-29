import { useState, useEffect, useCallback } from 'react'
import QuestItem from './QuestItem'
import { getSortedQuests } from '../../utils/questUtils'
import * as api from '../../api'

const SORT_OPTIONS = [
  { key: 'newest', label: '최신순' },
  { key: 'due', label: '마감 빠른순' },
  { key: 'alpha', label: 'ㄱㄴㄷ순' },
  { key: 'subject', label: '과목순' },
  { key: 'done', label: '미완료 먼저' },
]

export default function QuestPanel({ roomId, username, showToast }) {
  const [quests, setQuests] = useState([])
  const [sort, setSort] = useState('newest')
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [due, setDue] = useState('')
  const [desc, setDesc] = useState('')
  const [editingQuest, setEditingQuest] = useState(null)

  const loadQuests = useCallback(async () => {
    try {
      const data = await api.getQuests(roomId, username)
      setQuests(data)
    } catch (e) {
      showToast('❌ 퀘스트 로드 실패')
    }
  }, [roomId, username])

  useEffect(() => {
    loadQuests()
  }, [loadQuests])

  const handleSubmit = async () => {
    if (!title.trim()) { showToast('❌ 퀘스트 제목을 입력하세요'); return }
    try {
      const newQ = await api.createQuest(roomId, {
        title: title.trim(), subject: subject.trim(), due, description: desc.trim(),
      })
      setQuests((prev) => [newQ, ...prev])
      setTitle(''); setSubject(''); setDue(''); setDesc('')
      showToast('✅ 퀘스트가 등록되었습니다')
    } catch (e) {
      showToast('❌ ' + e.message)
    }
  }

  const handleToggleDone = async (questId) => {
    try {
      const { done } = await api.toggleQuestDone(roomId, questId, username)
      setQuests((prev) => prev.map((q) => q.id === questId ? { ...q, done: done ? 1 : 0 } : q))
    } catch (e) {
      showToast('❌ ' + e.message)
    }
  }

  const handleDelete = async (questId) => {
    if (!window.confirm('퀘스트를 삭제하시겠습니까?')) return
    try {
      await api.deleteQuest(roomId, questId)
      setQuests((prev) => prev.filter((q) => q.id !== questId))
      showToast('🗑 퀘스트가 삭제되었습니다')
    } catch (e) {
      showToast('❌ ' + e.message)
    }
  }

  const handleSaveEdit = async (updated) => {
    try {
      await api.updateQuest(roomId, updated.id, {
        title: updated.title, subject: updated.subject, due: updated.due, description: updated.description,
      })
      setQuests((prev) => prev.map((q) => q.id === updated.id ? { ...q, ...updated } : q))
      setEditingQuest(null)
      showToast('✅ 퀘스트가 수정되었습니다')
    } catch (e) {
      showToast('❌ ' + e.message)
    }
  }

  const doneSet = new Set(quests.filter((q) => q.done).map((q) => q.id))
  const sorted = getSortedQuests(quests, doneSet, sort)

  return (
    <div>
      {/* 퀘스트 등록 폼 */}
      <div style={{ background: 'var(--panel)', border: '2px dashed var(--border)', padding: 20, marginBottom: 25 }}>
        <div style={{ fontSize: 13, opacity: 0.5, marginBottom: 12 }}>[ 새 퀘스트 등록 ]</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <input type="text" placeholder="퀘스트 제목" value={title} onChange={(e) => setTitle(e.target.value)} style={{ flex: 2, fontSize: 14 }} />
          <input type="text" placeholder="과목" value={subject} onChange={(e) => setSubject(e.target.value)} style={{ flex: 1, fontSize: 14 }} />
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)}
            style={{ flex: 1, background: '#0b0c0d', border: '2px solid var(--border)', color: 'var(--point)', padding: 10, fontFamily: "'DungGeunMo',monospace", fontSize: 13, cursor: 'none' }} />
        </div>
        <textarea placeholder="해야 하는 것 (설명)" value={desc} onChange={(e) => setDesc(e.target.value)}
          style={{ width: '100%', background: '#0b0c0d', border: '2px solid var(--border)', color: 'var(--point)', padding: 12, fontFamily: "'DungGeunMo',monospace", fontSize: 13, resize: 'vertical', minHeight: 60, marginBottom: 10, textAlign: 'left' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-pixel" style={{ padding: '10px 24px', fontSize: 14 }} onClick={handleSubmit}>+ 등록</button>
        </div>
      </div>

      {/* 정렬 바 */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, alignItems: 'center' }}>
        <span style={{ fontSize: 12, opacity: 0.4, marginRight: 4 }}>정렬</span>
        {SORT_OPTIONS.map((opt) => (
          <button key={opt.key} className={`sort-btn ${sort === opt.key ? 'active-sort' : ''}`} onClick={() => setSort(opt.key)}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* 퀘스트 목록 */}
      {quests.length === 0 ? (
        <div style={{ textAlign: 'center', opacity: 0.3, padding: 60, border: '2px dashed var(--border)' }}>
          [ 등록된 퀘스트 없음 ]
        </div>
      ) : (
        sorted.map((q) => (
          <QuestItem
            key={q.id}
            quest={q}
            isDone={!!q.done}
            isEditing={editingQuest?.id === q.id}
            editData={editingQuest}
            onToggleDone={handleToggleDone}
            onEdit={(quest) => setEditingQuest({ ...quest })}
            onCancelEdit={() => setEditingQuest(null)}
            onSaveEdit={handleSaveEdit}
            onDelete={handleDelete}
            showToast={showToast}
          />
        ))
      )}
    </div>
  )
}
