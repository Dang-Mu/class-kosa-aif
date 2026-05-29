const RULES = [
  {
    num: 1,
    icon: '🃏',
    title: '카드 버리기',
    desc: '같은 숫자의 카드끼리 두 장씩 버린다.',
  },
  {
    num: 2,
    icon: '✊',
    title: '순서 정하기',
    desc: '가위바위보를 해서 이긴 사람부터 순서를 정한다.',
  },
  {
    num: 3,
    icon: '👆',
    title: '카드 뽑기',
    desc: '순서대로 상대방의 카드 중 한 장을 뽑는다. 같은 숫자가 나오면 버린다.',
  },
  {
    num: 4,
    icon: '😈',
    title: '도둑 결정',
    desc: '마지막까지 조커를 들고 있는 사람이 도둑으로 패배한다.',
  },
];

export default function MainScreen({ onCreateRoom, onJoinRoom }) {
  return (
    <div className="screen main-screen">
      <div className="title-area">
        <span className="title-icon">🃏</span>
        <h1>도둑잡기</h1>
        <p className="subtitle">조커를 피하라!</p>
      </div>

      <div className="main-buttons">
        <button className="btn-primary" onClick={onCreateRoom}>
          <span>🏠</span> 방 만들기
        </button>
        <button className="btn-outline" onClick={onJoinRoom}>
          <span>🚪</span> 방 참가하기
        </button>
      </div>

      {/* 게임 규칙 */}
      <div className="rules-section">
        <div className="rules-title">📋 게임 규칙</div>
        <div className="rules-list">
          {RULES.map(rule => (
            <div key={rule.num} className="rule-item">
              <div className="rule-num">{rule.num}</div>
              <div className="rule-icon">{rule.icon}</div>
              <div className="rule-text">
                <div className="rule-title">{rule.title}</div>
                <div className="rule-desc">{rule.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="main-hint">
        친구와 같은 네트워크 또는 인터넷으로 함께 플레이!
      </p>
    </div>
  );
}
