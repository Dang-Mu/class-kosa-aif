const MEDALS = ['🥇', '🥈', '🥉', '4️⃣'];

export default function ResultScreen({ game, myId, onRestart }) {
  if (!game) return null;

  const loser  = game.players.find(p => p.isLoser);
  const sorted = [...game.players].sort(
    (a, b) => (a.finishOrder || 99) - (b.finishOrder || 99)
  );

  return (
    <div className="screen result-screen">
      <div className="result-content">
        <div className="result-icon">{loser ? '😈' : '🎉'}</div>
        <h2 className="result-title">
          {loser ? `${loser.name}이(가) 도둑!` : '게임 종료!'}
        </h2>
        <p className="result-desc">
          {loser ? '조커를 끝까지 들고 있었군요...' : '모두 수고했습니다!'}
        </p>

        <div className="result-ranking">
          {sorted.map((p, i) => (
            <div
              key={p.id}
              className={`rank-item ${p.id === myId ? 'rank-me' : ''}`}
            >
              <span className="rank-medal">
                {p.isLoser ? '😈' : (MEDALS[i] || `${i + 1}`)}
              </span>
              <span className="rank-name" style={{ color: p.color }}>
                {p.avatar} {p.name}{p.id === myId ? ' (나)' : ''}
              </span>
              <span className="rank-label">
                {p.isLoser ? '도둑 (패배)' : `${p.finishOrder}등 탈출`}
              </span>
            </div>
          ))}
        </div>

        <button className="btn-primary" onClick={onRestart}>
          처음으로
        </button>
      </div>
    </div>
  );
}
