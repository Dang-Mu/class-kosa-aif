import { useState, useEffect } from 'react'
import Cursor from './components/Cursor'
import Toast from './components/Toast'
import SettingsTab from './components/SettingsTab'
import MainScreen from './components/MainScreen'
import RoomListModal from './components/modals/RoomListModal'
import QuestBoard from './components/board/QuestBoard'
import { useParticles } from './hooks/useParticles'
import { useToast } from './hooks/useToast'

const ADMIN_KEY = '0207'

export default function App() {
  const [fireEnabled, setFireEnabled] = useState(true)
  const [nightMode, setNightMode] = useState(false)
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('sqb_admin') === '1')
  const [showRoomList, setShowRoomList] = useState(false)

  // 현재 입장한 방 정보
  const [currentRoom, setCurrentRoom] = useState(() => {
    try {
      const saved = sessionStorage.getItem('sqb_room')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })

  const { toast, showToast } = useToast()
  const createParticles = useParticles(fireEnabled)

  // body overflow 제어
  useEffect(() => {
    document.body.style.overflow = currentRoom ? 'auto' : 'hidden'
  }, [currentRoom])

  // 관리자 인증
  const handleAuthAdmin = () => {
    if (isAdmin) {
      // 이미 관리자면 해제
      setIsAdmin(false)
      sessionStorage.removeItem('sqb_admin')
      showToast('🔒 관리자 모드 해제')
      return
    }
    const key = window.prompt('관리자 키:')
    if (key === ADMIN_KEY) {
      setIsAdmin(true)
      sessionStorage.setItem('sqb_admin', '1')
      showToast('🔓 관리자 인증 성공')
      setShowRoomList(true) // 인증 성공 시 바로 방 목록 열기
    } else if (key !== null) {
      showToast('❌ 인증 실패')
    }
  }

  // 방 입장
  const handleEnterRoom = (roomId, username) => {
    // 방 정보는 verifyRoom에서 이미 검증됨 — roomId와 username만 저장
    // roomInfo는 RoomListModal에서 rooms 배열로 알고 있으므로 별도 fetch
    fetchRoomInfo(roomId, username)
  }

  const fetchRoomInfo = async (roomId, username) => {
    try {
      const res = await fetch(`/api/rooms`)
      const rooms = await res.json()
      const room = rooms.find((r) => r.id === roomId)
      if (!room) { showToast('❌ 방 정보를 찾을 수 없습니다'); return }
      const roomData = { roomId, username, roomInfo: room }
      setCurrentRoom(roomData)
      sessionStorage.setItem('sqb_room', JSON.stringify(roomData))
      setShowRoomList(false)
    } catch (e) {
      showToast('❌ 방 입장 실패')
    }
  }

  const handleExitRoom = () => {
    setCurrentRoom(null)
    sessionStorage.removeItem('sqb_room')
  }

  return (
    <div onMouseDown={createParticles}>
      <Cursor nightMode={nightMode} />
      {toast.visible && <Toast message={toast.message} />}

      <SettingsTab
        fireEnabled={fireEnabled}
        nightMode={nightMode}
        onToggleFire={() => setFireEnabled((v) => !v)}
        onToggleNight={() => setNightMode((v) => !v)}
      />

      {/* 메인 화면 */}
      {!currentRoom && (
        <MainScreen
          isAdmin={isAdmin}
          onOpenRooms={() => setShowRoomList(true)}
          onAuthAdmin={handleAuthAdmin}
        />
      )}

      {/* 퀘스트 보드 */}
      {currentRoom && (
        <QuestBoard
          roomId={currentRoom.roomId}
          roomInfo={currentRoom.roomInfo}
          username={currentRoom.username}
          onExit={handleExitRoom}
          showToast={showToast}
        />
      )}

      {/* 방 목록 모달 */}
      {showRoomList && (
        <RoomListModal
          isAdmin={isAdmin}
          adminKey={ADMIN_KEY}
          onClose={() => setShowRoomList(false)}
          onEnterRoom={handleEnterRoom}
          showToast={showToast}
        />
      )}
    </div>
  )
}
