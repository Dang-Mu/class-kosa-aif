import Card from '../components/Card';

export default function GameScreen({ game, myId, onPickCard }) {
  if (!game) {
    return (
      <div className="screen game-screen">
        <p style={{ color: '#aaa' }}>게임 로딩 중...</p>
      </div>
    );
  }

  const { players, currentTurn, targetPlayer, waitingConfirm, lastMsg } = game;

  // id로 플레이어 찾기 (배열 인덱스 != id 혼동 방지)
  const findById = (id) => players.find(p => p.id === id);

  const picker   = findById(currentTurn);
  const target   = findById(targetPlayer);
  const myPlayer = findById(myId);

  // 내 차례: currentTurn이 내 id이고 아직 waitingConfirm 아닐 때
  const isMyTurn = currentTurn === myId && !waitingConfirm;

  const activeCount = players.filter(p => !p.eliminated).length;

  return (
    <div className="screen game-screen">
      {/* 단계 표시 */}
      <div className="phase-header" style={{ marginBottom: 0 }}>
        <div className="phase-badge">3단계</div>
        <h2 style={{ fontSize: 20, marginBottom: 0 }}>도둑잡기</h2>
      </div>

      {/* 순서 표시 */}
      {game.turnOrder && game.turnOrder.length > 0 && (
        <div className="turn-order-bar">
          <span className="turn-order-label">순서</span>
          {game.turnOrder.map((id, i) => {
            const p = players.find(pl => pl.id === id);
            if (!p) return null;
            return (
              <span key={id} className={`turn-order-item ${p.eliminated ? 'elim' : ''} ${id === currentTurn ? 'active' : ''}`}>
                {i + 1}. {p.avatar} {p.name}
              </span>
            );
          })}
        </div>
      )}

      {/* 상태바 */}
      <div className="status-bar">
        <div className="turn-info">
          <span className="current-player-name">{picker?.name}</span>의 차례
        </div>
        <div className="my-role-badge">
          나: {myPlayer?.name} {myPlayer?.avatar}
        </div>
        <div className="game-message">{lastMsg}</div>
      </div>

      {/* 플레이어 존 */}
      <div className="players-area">
        {players.map(player => {
          const isMe        = player.id === myId;
          // 내 차례이고 이 플레이어가 뽑힐 대상일 때만 클릭 가능
          const canPickFrom = isMyTurn && player.id === targetPlayer;

          let zoneClass = 'player-zone';
          if (isMe)                              zoneClass += ' is-me';
          if (player.eliminated)                 zoneClass += ' eliminated';
          else if (player.isLoser)               zoneClass += ' loser';
          else if (player.id === currentTurn)    zoneClass += ' current-turn';
          else if (canPickFrom)                  zoneClass += ' can-pick';

          return (
            <div key={player.id} className={zoneClass}>
              {/* 헤더 */}
              <div className="player-header">
                <div
                  className="player-avatar"
                  style={{ background: player.color + '33', border: `2px solid ${player.color}` }}
                >
                  {player.avatar}
                </div>
                <div className="player-name" style={{ color: player.color }}>
                  {player.name}{isMe ? ' 👈나' : ''}
                </div>
                <div className="player-card-count">카드 {player.hand.length}장</div>
                <StatusBadge player={player} currentTurn={currentTurn} />
              </div>

              {/* 카드 */}
              <div className="cards-container">
                {player.hand.map((card, i) => (
                  <Card
                    key={i}
                    card={card}
                    faceUp={isMe || player.eliminated}
                    clickable={canPickFrom}
                    onClick={() => onPickCard(i)}
                  />
                ))}
                {player.hand.length === 0 && !player.eliminated && (
                  <span style={{ color: '#888', fontSize: 14 }}>카드 없음</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 액션 안내 */}
      <div className="action-area">
        {isMyTurn && activeCount > 1 && (
          <p className="pick-prompt">
            👆 {target?.name}의 카드 중 하나를 선택하세요!
          </p>
        )}
        {!isMyTurn && !waitingConfirm && activeCount > 1 && (
          <p className="pick-prompt waiting">
            ⏳ {picker?.name}의 차례입니다...
          </p>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ player, currentTurn }) {
  if (player.eliminated) {
    return <span className="player-status-badge badge-out">{player.finishOrder}등 탈출 ✅</span>;
  }
  if (player.isLoser) {
    return <span className="player-status-badge badge-loser">도둑 😈</span>;
  }
  if (player.id === currentTurn) {
    return <span className="player-status-badge badge-turn">뽑는 중 🖐️</span>;
  }
  return <span className="player-status-badge badge-safe">대기 중</span>;
}
