export default function MainScreen({ onOpenRooms, onAuthAdmin, isAdmin }) {
  return (
    <div className="container">
      <div className="header">
        <h1 className="title">작전 통제 센터</h1>
        <p style={{ opacity: 0.5, marginTop: 20 }}>
          [ 픽셀 탄환 장전 완료 - 임무를 개시하십시오 ]
        </p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
        <button className="btn-pixel" style={{ fontSize: 24 }} onClick={onOpenRooms}>
          ⚔️ 퀘스트 보드 입장
        </button>
        <button
          className="btn-pixel"
          style={{
            fontSize: 16,
            opacity: isAdmin ? 1 : 0.6,
            borderStyle: isAdmin ? 'solid' : 'dashed',
            borderColor: isAdmin ? 'var(--point)' : undefined,
            color: isAdmin ? 'var(--point)' : undefined,
          }}
          onClick={onAuthAdmin}
        >
          {isAdmin ? '🔓 관리자 모드 활성화됨' : '🔒 아카이브 접속 (관리자)'}
        </button>
      </div>
    </div>
  )
}
