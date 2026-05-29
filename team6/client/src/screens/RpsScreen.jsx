const RPS = [
  { emoji: '✊', label: '바위' },
  { emoji: '✌️', label: '가위' },
  { emoji: '🖐️', label: '보' },
];

export default function RpsScreen({ game, myId, onChoice }) {
  if (!game) return <div className="screen rps-screen"><p style={{ color: '#aaa' }}>로딩 중...</p></div>;

  const myPlayer = game.players.find(p => p.id === myId);
  if (!myPlayer) return null;

  const myChoice      = myPlayer.rpsChoice;
  const myEliminated  = myPlayer.rpsEliminated; // 이미 순서 확정
  const allChosen     = game.players
    .filter(p => !p.rpsEliminated)
    .every(p => p.rpsChoice !== null);

  // 이번 라운드에 참여하는 플레이어
  const activeRps = game.players.filter(p => !p.rpsEliminated);
  // 이미 순서 확정된 플레이어
  const fixedOrder = game.turnOrder || [];

  return (
    <div className="screen rps-screen">
      <div className="phase-header">
        <div className="phase-badge">2단계</div>
        <h2>가위바위보</h2>
        <p className="phase-desc">이긴 사람이 먼저 시작합니다!</p>
      </div>

      {/* 라운드 표시 */}
      <div className="rps-round-badge">
        {game.rpsRound}라운드
      </div>

      {/* 이전 라운드 기록 */}
      {game.rpsHistory && game.rpsHistory.length > 0 && (
        <div className="rps-history">
          {game.rpsHistory.map((r, i) => (
            <div key={i} className="rps-history-item">
              <span className="rps-round-label">{r.round}R</span>
              {r.records.map(rec => (
                <span key={rec.id} className="rps-record">
                  {rec.avatar} {rec.choice}
                </span>
              ))}
              <span className="rps-result">{r.result}</span>
            </div>
          ))}
        </div>
      )}

      {/* 참가자 현황 */}
      <div className="rps-players">
        {game.players.map(p => {
          const isFixed = p.rpsEliminated;
          const fixedPos = fixedOrder.indexOf(p.id);
          return (
            <div key={p.id} className={`rps-player-item ${p.id === myId ? 'me' : ''} ${isFixed ? 'fixed' : ''}`}>
              <span className="rps-avatar">{p.avatar}</span>
              <span className="rps-name" style={{ color: p.color }}>{p.name}</span>
              <span className="rps-status">
                {isFixed
                  ? <span className="rps-badge fixed">{fixedPos + 1}번째 확정 ✅</span>
                  : p.rpsChoice
                    ? <span className="rps-badge chosen">선택 완료 ✋</span>
                    : <span className="rps-badge waiting">선택 중...</span>
                }
              </span>
            </div>
          );
        })}
      </div>

      {/* 내 선택 영역 */}
      {myEliminated ? (
        <div className="rps-fixed-msg">
          <span>✅ 순서 확정! 다른 플레이어를 기다리는 중...</span>
        </div>
      ) : myChoice ? (
        <div className="rps-chosen-msg">
          <span className="rps-chosen-emoji">{myChoice}</span>
          <span>선택 완료! 다른 플레이어를 기다리는 중...</span>
        </div>
      ) : (
        <div className="rps-choice-area">
          <p className="rps-choose-label">선택하세요!</p>
          <div className="rps-buttons">
            {RPS.map(({ emoji, label }) => (
              <button
                key={emoji}
                className="rps-btn"
                onClick={() => onChoice(emoji)}
              >
                <span className="rps-emoji">{emoji}</span>
                <span className="rps-label">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 메시지 */}
      {game.lastMsg && (
        <div className="rps-msg">{game.lastMsg}</div>
      )}
    </div>
  );
}
