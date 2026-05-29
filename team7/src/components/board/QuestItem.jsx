import { useState, useEffect } from 'react'
import { formatDue } from '../../utils/questUtils'

function EditForm({ quest, onSave, onCancel, showToast }) {
  const [title, setTitle] = useState(quest.title)
  const [subject, setSubject] = useState(quest.subject || '')
  const [due, setDue] = useState(quest.due || '')
  const [desc, setDesc] = useState(quest.description || '')

  const handleSave = () => {
    if (!title.trim()) { showToast('❌ 제목을 입력하세요'); return }
    onSave({ ...quest, title: title.trim(), subject: subject.trim(), due, description: desc.trim() })
  }

  return (
    <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border)', background: '#0b0c0d' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" style={{ flex: 2, fontSize: 13, padding: 8 }} />
        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="과목" style={{ flex: 1, fontSize: 13, padding: 8 }} />
        <input type="date" value={due} onChange={(e) => setDue(e.target.value)}
          style={{ flex: 1, background: '#141517', border: '2px solid var(--border)', color: 'var(--point)', padding: 8, fontFamily: "'DungGeunMo',monospace", fontSize: 12, cursor: 'none' }} />
      </div>
      <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="설명"
        style={{ width: '100%', background: '#141517', border: '2px solid var(--border)', color: 'var(--point)', padding: 10, fontFamily: "'DungGeunMo',monospace", fontSize: 12, resize: 'vertical', minHeight: 50, marginBottom: 8, textAlign: 'left' }} />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{ background: 'none', border: '1px solid var(--border)', color: '#888', padding: '6px 14px', fontFamily: "'DungGeunMo',monospace", fontSize: 12, cursor: 'none' }}>취소</button>
        <button className="btn-pixel" style={{ padding: '6px 16px', fontSize: 12 }} onClick={handleSave}>저장</button>
      </div>
    </div>
  )
}

export default function QuestItem({ quest, isDone, isEditing, onToggleDone, onEdit, onCancelEdit, onSaveEdit, onDelete, showToast }) {
  const dueInfo = formatDue(quest.due)

  return (
    <div style={{
      background: 'var(--panel)',
      border: `1px solid ${isDone ? '#4ade8033' : 'var(--border)'}`,
      marginBottom: 10,
      opacity: isDone ? 0.5 : 1,
    }}>
      <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* 완료 체크 */}
        <button onClick={() => onToggleDone(quest.id)} style={{
          width: 24, height: 24, flexShrink: 0,
          background: isDone ? '#4ade80' : 'transparent',
          border: `2px solid ${isDone ? '#4ade80' : 'var(--border)'}`,
          color: '#000', fontSize: 13, cursor: 'none', fontFamily: "'DungGeunMo',monospace",
        }}>{isDone ? '✓' : ''}</button>

        {/* 제목 */}
        <span style={{ fontSize: 16, flex: 1, textDecoration: isDone ? 'line-through' : 'none' }}>
          {quest.title}
        </span>

        {/* 과목 */}
        {quest.subject && (
          <span style={{ background: '#ffffff11', border: '1px solid #ffffff22', padding: '3px 10px', fontSize: 12, color: '#ccc', flexShrink: 0 }}>
            {quest.subject}
          </span>
        )}

        {/* 마감일 */}
        {dueInfo && (
          <span style={{ fontSize: 12, flexShrink: 0, color: dueInfo.color }}>{dueInfo.label}</span>
        )}

        {/* 수정/삭제 */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button onClick={() => isEditing ? onCancelEdit() : onEdit(quest)} style={{
            background: 'transparent', border: `1px solid ${isEditing ? 'var(--point)' : 'var(--border)'}`,
            color: isEditing ? 'var(--point)' : 'var(--text)', padding: '4px 10px',
            fontFamily: "'DungGeunMo',monospace", fontSize: 12, cursor: 'none', opacity: isEditing ? 1 : 0.6,
          }}>✏</button>
          <button onClick={() => onDelete(quest.id)} style={{
            background: 'transparent', border: '1px solid #ff444466', color: '#ff4444',
            padding: '4px 10px', fontFamily: "'DungGeunMo',monospace", fontSize: 12, cursor: 'none',
          }}>✕</button>
        </div>
      </div>

      {/* 설명 */}
      {quest.description && !isEditing && (
        <div style={{ padding: '10px 18px 14px 54px', fontSize: 13, opacity: 0.5, borderTop: '1px solid #ffffff08', whiteSpace: 'pre-wrap', lineHeight: 1.6, textAlign: 'left' }}>
          ↳ {quest.description}
        </div>
      )}

      {/* 인라인 수정 폼 */}
      {isEditing && (
        <EditForm quest={quest} onSave={onSaveEdit} onCancel={onCancelEdit} showToast={showToast} />
      )}
    </div>
  )
}
