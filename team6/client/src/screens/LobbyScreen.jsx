import { useState } from 'react';

export default function LobbyScreen({ lobby, myId, onStart, onLeave }) {
  const [copied, setCopied] = useState(false);

  if (!lobby) {
    return (
      <div className="screen lobby-screen">
        <p style={{ color: '#aaa' }}>대기실 연결 중...</p>
      </div>
    );
  }

  const isHost = myId === 0;
  const canStart = lobby.players.length >= 3;

  function copyCode() {
    navigator.clipboard.writeText(lobby.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="screen lobby-screen">
      {/* 헤더 */}
      <div className="lobby-header">
        <h2>대기실</h2>
        <div className="room-code-box">
          <span className="room-code-label">방 코드</span>
          <span className="room-code-value">{lobby.code}</span>
          <button className="btn-copy" onClick={copyCode} title="복사">
            {copied ? '✅' : '📋'}
          </button>
        </div>
      </div>

      {/* 인원 */}
      <p className="lobby-info">
        {lobby.players.length} / {lobby.maxPlayers} 명 참가 중
      </p>

      {/* 플레이어 목록 */}
      <div className="lobby-players">
        {lobby.players.map(p => (
          <div
            key={p.id}
            className={`lobby-player-item ${p.id === myId ? 'me' : ''}`}
          >
            <div
              className="lobby-player-avatar"
              style={{ borderColor: p.color, background: p.color + '22' }}
            >
              {p.avatar}
            </div>
            <div>
              <div className="lobby-player-name" style={{ color: p.color }}>
                {p.name}{p.id === myId ? ' (나)' : ''}
              </div>
              <div className="lobby-player-tag">
                {p.id === 0 ? '방장' : '게스트'}
              </div>
            </div>
            <div className={`lobby-player-ready ${p.id === 0 ? 'ready-host' : 'ready-guest'}`}>
              {p.id === 0 ? '👑 방장' : '✅ 참가'}
            </div>
          </div>
        ))}
      </div>

      {/* 힌트 */}
      <div className="lobby-hint">
        친구에게 방 코드 <strong style={{ color: '#ffd200' }}>{lobby.code}</strong>를 알려주세요!<br />
        친구는 이 사이트에서 "방 참가하기"를 누르면 됩니다.
      </div>

      {/* 액션 */}
      <div className="lobby-actions">
        {isHost ? (
          <button
            className="btn-primary"
            onClick={onStart}
            disabled={!canStart}
            style={{ opacity: canStart ? 1 : 0.5 }}
          >
            게임 시작 {!canStart && '(3명 이상 필요)'}
          </button>
        ) : (
          <p className="waiting-msg">⏳ 방장이 게임을 시작할 때까지 기다려주세요...</p>
        )}
      </div>

      <button className="btn-danger" onClick={onLeave}>나가기</button>
    </div>
  );
}
