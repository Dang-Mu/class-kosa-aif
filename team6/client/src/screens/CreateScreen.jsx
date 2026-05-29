import { useState } from 'react';

export default function CreateScreen({ onBack, onConfirm }) {
  const [name, setName]       = useState('');
  const [maxPlayers, setMax]  = useState(3);

  function handleSubmit() {
    onConfirm(name.trim() || '방장', maxPlayers);
  }

  return (
    <div className="screen form-screen">
      <div className="screen-header">
        <button className="btn-back" onClick={onBack}>← 뒤로</button>
        <h2>방 만들기</h2>
      </div>

      <div className="form-group">
        <label>내 닉네임</label>
        <input
          className="name-input"
          type="text"
          placeholder="닉네임 입력"
          maxLength={8}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
      </div>

      <div className="form-group">
        <label>최대 인원 (3~5명)</label>
        <div className="player-buttons">
          {[3, 4, 5].map(n => (
            <button
              key={n}
              className={`player-count-btn ${maxPlayers === n ? 'active' : ''}`}
              onClick={() => setMax(n)}
            >
              {n}명
            </button>
          ))}
        </div>
      </div>

      <button className="btn-primary" onClick={handleSubmit}>
        방 생성
      </button>
    </div>
  );
}
