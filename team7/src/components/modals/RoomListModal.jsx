import { useState, useEffect } from 'react'
import { getRooms, verifyRoom, createRoom, updateRoom, deleteRoom } from '../../api'

// ── 방 추가/수정 폼 ──────────────────────────────
function RoomForm({ initial, adminKey, onSave, onCancel, showToast }) {
  const [school, setSchool] = useState(initial?.school || '')
  const [grade, setGrade] = useState(initial?.grade || '')
  const [cls, setCls] = useState(initial?.class || '')
  const [password, setPassword] = useState(initial?.password || '')

  const handleSave = async () => {
    if (!school || !grade || !cls || !password) {
      showToast('❌ 모든 항목을 입력하세요')
      return
    }
    if (!/^[A-Za-z0-9]{4}$/.test(password)) {
      showToast('❌ 비밀번호는 영문/숫자 조합 4자리여야 합니다')
      return
    }
    try {
      await onSave({ school, grade, class: cls, password })
    } catch (e) {
      showToast('❌ ' + e.message)
    }
  }

  return (
    <div style={{ background: 'var(--input-bg)', border: '2px solid var(--point)', padding: 20, marginBottom: 16 }}>
      <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 12 }}>
        {initial ? '[ 방 수정 ]' : '[ 새 방 개설 ]'}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input type="text" placeholder="학교명" value={school} onChange={(e) => setSchool(e.target.value)} style={{ flex: 3, fontSize: 13, padding: 10 }} />
        <input type="text" placeholder="학년" maxLength={2} value={grade} onChange={(e) => setGrade(e.target.value)} style={{ flex: 1, fontSize: 13, padding: 10 }} />
        <input type="text" placeholder="반" maxLength={2} value={cls} onChange={(e) => setCls(e.target.value)} style={{ flex: 1, fontSize: 13, padding: 10 }} />
      </div>
      <input
        type="text"
        placeholder="비밀번호 (영문+숫자 4자리, 예: AB12)"
        value={password}
        onChange={(e) => setPassword(e.target.value.toUpperCase().replace(/[^A-Za-z0-9]/g, '').slice(0, 4))}
        style={{ fontSize: 16, padding: 10, marginBottom: 6, letterSpacing: 6, textTransform: 'uppercase' }}
      />
      <div style={{ fontSize: 11, opacity: 0.4, marginBottom: 10 }}>
        ※ 영문 대소문자 + 숫자 조합 4자리 (입장 시 필요)
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{ background: 'none', border: '1px solid var(--border)', color: '#888', padding: '8px 16px', fontFamily: 'var(--font-ui)', fontSize: 12, cursor: 'none' }}>
          취소
        </button>
        <button className="btn-pixel" style={{ padding: '8px 20px', fontSize: 13 }} onClick={handleSave}>
          개설
        </button>
      </div>
    </div>
  )
}

// ── 비밀번호 + 이름 입력 ─────────────────────────
function EnterRoomForm({ room, onEnter, onCancel, showToast }) {
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  const handleEnter = async () => {
    if (!password) { setError('비밀번호를 입력하세요'); return }
    if (!username.trim()) { setError('이름을 입력하세요'); return }
    try {
      await verifyRoom(room.id, password)
      onEnter(room.id, username.trim())
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div style={{ background: 'var(--input-bg)', border: '2px solid var(--point)', padding: 20, marginBottom: 16 }}>
      <div style={{ fontSize: 13, color: 'var(--point)', marginBottom: 12 }}>
        ▶ {room.school} {room.grade}학년 {room.class}반
      </div>
      <input
        type="text"
        placeholder="비밀번호 입력"
        value={password}
        onChange={(e) => { setPassword(e.target.value); setError('') }}
        style={{ fontSize: 16, letterSpacing: 4, marginBottom: 8 }}
        onKeyDown={(e) => e.key === 'Enter' && handleEnter()}
      />
      <input
        type="text"
        placeholder="이름 입력"
        value={username}
        onChange={(e) => { setUsername(e.target.value); setError('') }}
        style={{ fontSize: 14, marginBottom: 8 }}
        onKeyDown={(e) => e.key === 'Enter' && handleEnter()}
      />
      {error && (
        <div style={{ color: '#ff4444', fontSize: 12, marginBottom: 8 }}>[ {error} ]</div>
      )}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{ background: 'none', border: '1px solid var(--border)', color: '#888', padding: '8px 16px', fontFamily: 'var(--font-ui)', fontSize: 12, cursor: 'none' }}>
          취소
        </button>
        <button className="btn-pixel" style={{ padding: '8px 20px', fontSize: 13 }} onClick={handleEnter}>
          입장
        </button>
      </div>
    </div>
  )
}

// ── 메인 방 목록 모달 ────────────────────────────
export default function RoomListModal({ isAdmin, adminKey, onClose, onEnterRoom, showToast }) {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [enteringRoom, setEnteringRoom] = useState(null)

  const loadRooms = async () => {
    setLoading(true)
    try {
      const data = await getRooms()
      setRooms(data)
    } catch (e) {
      showToast('❌ 방 목록 로드 실패')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRooms() }, [])

  const handleCreate = async (body) => {
    await createRoom(body, adminKey)
    showToast('✅ 방이 개설되었습니다')
    setShowAddForm(false)
    loadRooms()
  }

  const handleUpdate = async (body) => {
    await updateRoom(editingRoom.id, body, adminKey)
    showToast('✅ 방이 수정되었습니다')
    setEditingRoom(null)
    loadRooms()
  }

  const handleDelete = async (room) => {
    if (!window.confirm(`"${room.school} ${room.grade}학년 ${room.class}반" 방을 삭제하시겠습니까?\n퀘스트와 Q&A가 모두 삭제됩니다.`)) return
    try {
      await deleteRoom(room.id, adminKey)
      showToast('🗑 방이 삭제되었습니다')
      loadRooms()
    } catch (e) {
      showToast('❌ ' + e.message)
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 560, maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}
      >
        {/* 헤더 */}
        <div style={{ padding: '24px 28px 16px', borderBottom: '2px solid var(--border)', flexShrink: 0 }}>
          <div style={{ fontSize: 12, opacity: 0.4, marginBottom: 4 }}>
            {isAdmin ? '[ 관리자 모드 ]' : '[ 방 목록 ]'}
          </div>
          <h3 style={{ margin: 0, color: 'var(--point)', fontSize: 20, fontFamily: 'var(--font-ui)' }}>
            ⚔️ 퀘스트 보드 입장
          </h3>
        </div>

        {/* 스크롤 영역 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 28px' }}>
          {showAddForm && (
            <RoomForm adminKey={adminKey} onSave={handleCreate} onCancel={() => setShowAddForm(false)} showToast={showToast} />
          )}
          {isAdmin && editingRoom && (
            <RoomForm initial={editingRoom} adminKey={adminKey} onSave={handleUpdate} onCancel={() => setEditingRoom(null)} showToast={showToast} />
          )}
          {enteringRoom && (
            <EnterRoomForm room={enteringRoom} onEnter={(roomId, username) => onEnterRoom(roomId, username)} onCancel={() => setEnteringRoom(null)} showToast={showToast} />
          )}

          {loading ? (
            <div style={{ textAlign: 'center', opacity: 0.4, padding: 40 }}>[ 로딩 중... ]</div>
          ) : rooms.length === 0 ? (
            <div style={{ textAlign: 'center', opacity: 0.3, padding: 40, border: '2px dashed var(--border)' }}>
              [ 등록된 방 없음 ]
              {isAdmin && <div style={{ marginTop: 8, fontSize: 12 }}>아래 버튼으로 방을 추가하세요</div>}
            </div>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                style={{
                  background: enteringRoom?.id === room.id ? 'var(--input-bg)' : 'var(--panel)',
                  border: `1px solid ${enteringRoom?.id === room.id ? 'var(--point)' : 'var(--border)'}`,
                  padding: '14px 18px', marginBottom: 8,
                  display: 'flex', alignItems: 'center', gap: 12,
                  transition: 'border-color 0.15s',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, color: 'var(--text)' }}>
                    {room.school} <span style={{ color: 'var(--point)' }}>{room.grade}학년 {room.class}반</span>
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.3, marginTop: 3 }}>{room.created_at}</div>
                </div>

                <button
                  onClick={() => setEnteringRoom(enteringRoom?.id === room.id ? null : room)}
                  style={{ background: 'transparent', border: '1px solid var(--point)', color: 'var(--point)', padding: '5px 14px', fontFamily: 'var(--font-ui)', fontSize: 12, cursor: 'none' }}
                >
                  입장
                </button>

                {isAdmin && (
                  <>
                    <button
                      onClick={() => setEditingRoom(editingRoom?.id === room.id ? null : room)}
                      style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', padding: '5px 10px', fontFamily: 'var(--font-ui)', fontSize: 12, cursor: 'none', opacity: 0.6 }}
                    >✏</button>
                    <button
                      onClick={() => handleDelete(room)}
                      style={{ background: 'transparent', border: '1px solid #ff444466', color: '#ff4444', padding: '5px 10px', fontFamily: 'var(--font-ui)', fontSize: 12, cursor: 'none' }}
                    >✕</button>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* 하단 버튼 */}
        <div style={{ padding: '14px 28px', borderTop: '2px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <button
            className="btn-pixel"
            style={{ padding: '8px 20px', fontSize: 13 }}
            onClick={() => { setShowAddForm((v) => !v); setEditingRoom(null) }}
          >
            {showAddForm ? '▲ 닫기' : '+ 방 개설'}
          </button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'none', fontFamily: 'var(--font-ui)' }}>
            [ 닫기 ]
          </button>
        </div>
      </div>
    </div>
  )
}
