import { useState } from 'react';
import Card from '../components/Card';

export default function DiscardScreen({ game, myId, onDiscardPair, onFinish }) {
  const [selected, setSelected] = useState([]); // 선택된 카드 인덱스 최대 2개

  if (!game) return <div className="screen discard-screen"><p style={{ color: '#aaa' }}>로딩 중...</p></div>;

  const myPlayer = game.players.find(p => p.id === myId);
  if (!myPlayer) return null;

  const isDone = myPlayer.discardDone;

  // 손패에서 버릴 짝이 있는지 확인
  function hasPair(hand) {
    for (let i = 0; i < hand.length; i++) {
      if (hand[i].isJoker) continue;
      for (let j = i + 1; j < hand.length; j++) {
        if (hand[j].isJoker) continue;
        if (hand[i].rank === hand[j].rank) return true;
      }
    }
    return false;
  }

  function isPair(c1, c2) {
    if (!c1 || !c2 || c1.isJoker || c2.isJoker) return false;
    return c1.rank === c2.rank;
  }

  function toggleSelect(i) {
    if (isDone) return;
    if (selected.includes(i)) {
      setSelected(selected.filter(s => s !== i));
    } else if (selected.length < 2) {
      const next = [...selected, i];
      setSelected(next);
      // 두 장 선택 완료 시 자동 버리기 시도
      if (next.length === 2) {
        const c1 = myPlayer.hand[next[0]];
        const c2 = myPlayer.hand[next[1]];
        if (isPair(c1, c2)) {
          onDiscardPair(next[0], next[1]);
          setSelected([]);
        } else {
          // 짝 아님 → 잠깐 빨간 표시 후 초기화
          setTimeout(() => setSelected([]), 700);
        }
      }
    }
  }

  const canFinish = !isDone && !hasPair(myPlayer.hand);
  const allDone   = game.players.every(p => p.discardDone);

  return (
    <div className="screen discard-screen">
      <div className="phase-header">
        <div className="phase-badge">1단계</div>
        <h2>카드 버리기</h2>
        <p className="phase-desc">같은 숫자의 카드 두 장을 선택해 버리세요</p>
      </div>

      {/* 진행 현황 */}
      <div className="discard-progress">
        {game.players.map(p => (
          <div key={p.id} className={`discard-player-status ${p.id === myId ? 'me' : ''}`}>
            <span className="dp-avatar">{p.avatar}</span>
            <span className="dp-name" style={{ color: p.color }}>{p.name}</span>
            <span className={`dp-badge ${p.discardDone ? 'done' : 'pending'}`}>
              {p.discardDone ? '✅ 완료' : '⏳ 진행 중'}
            </span>
          </div>
        ))}
      </div>

      {/* 내 손패 */}
      <div className="my-hand-area">
        <div className="my-hand-label">
          내 손패 ({myPlayer.hand.length}장)
          {isDone && <span className="done-label"> — 버리기 완료!</span>}
        </div>

        <div className="cards-container discard-cards">
          {myPlayer.hand.map((card, i) => {
            const isSelected = selected.includes(i);
            const isBadPair  = selected.length === 2 && isSelected &&
              !isPair(myPlayer.hand[selected[0]], myPlayer.hand[selected[1]]);
            return (
              <div
                key={i}
                className={`card-wrapper ${isSelected ? 'selected' : ''} ${isBadPair ? 'bad-pair' : ''}`}
                onClick={() => toggleSelect(i)}
              >
                <Card card={card} faceUp={true} clickable={!isDone} onClick={() => {}} />
              </div>
            );
          })}
        </div>

        {selected.length === 2 && (() => {
          const c1 = myPlayer.hand[selected[0]];
          const c2 = myPlayer.hand[selected[1]];
          return !isPair(c1, c2) ? (
            <p className="pair-hint bad">❌ 짝이 아닙니다 (같은 숫자여야 해요)</p>
          ) : (
            <p className="pair-hint good">✅ 짝! 버리는 중...</p>
          );
        })()}

        {!isDone && selected.length === 0 && (
          <p className="pair-hint">카드를 두 장 선택하세요</p>
        )}
      </div>

      {/* 완료 버튼 */}
      {!isDone && (
        <button
          className={`btn-primary ${canFinish ? '' : 'disabled-btn'}`}
          onClick={canFinish ? onFinish : undefined}
          disabled={!canFinish}
          style={{ maxWidth: 320, opacity: canFinish ? 1 : 0.4 }}
        >
          {canFinish ? '버리기 완료 →' : '아직 버릴 짝이 있습니다'}
        </button>
      )}

      {isDone && !allDone && (
        <div className="waiting-others">
          <div className="spinner" />
          다른 플레이어를 기다리는 중...
        </div>
      )}

      {allDone && (
        <div className="all-done-msg">🎉 모두 완료! 가위바위보로 이동합니다...</div>
      )}
    </div>
  );
}
