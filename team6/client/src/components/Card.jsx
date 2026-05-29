export default function Card({ card, faceUp, clickable, onClick }) {
  // 숨겨진 카드 (서버가 hidden:true로 보낸 경우)
  if (!faceUp || card.hidden) {
    return (
      <div
        className={`card face-down ${clickable ? '' : 'no-click'}`}
        onClick={clickable ? onClick : undefined}
        role={clickable ? 'button' : undefined}
        aria-label={clickable ? '카드 선택' : '뒤집힌 카드'}
      />
    );
  }

  // 앞면
  if (card.isJoker) {
    return (
      <div className="card face-up joker" aria-label="조커">
        <div className="card-rank">JOKER</div>
        <div className="card-suit">★</div>
      </div>
    );
  }

  return (
    <div className={`card face-up ${card.color}`} aria-label={`${card.rank}${card.suit}`}>
      <div className="card-rank">{card.rank}</div>
      <div className="card-suit">{card.suit}</div>
    </div>
  );
}
