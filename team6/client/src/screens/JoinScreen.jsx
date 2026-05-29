import { useState } from 'react';

export default function JoinScreen({ onBack, onConfirm, error }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  function handleSubmit() {
    if (!code.trim()) return;
    onConfirm(name.trim() || '게스트', code.trim().toUpperCase());
  }

  return (
    <div className="screen form-screen">
      <div className="screen-header">
        <button className="btn-back" onClick={onBack}>← 뒤로</button>
        <h2>방 참가하기</h2>
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
        />
      </div>

      <div className="form-group">
        <label>방 코드 입력</label>
        <input
          className="name-input code-input"
          type="text"
          placeholder="예: A1B2C3"
          maxLength={6}
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
      </div>

      {error && <p className="error-msg">{error}</p>}

      <button className="btn-primary" onClick={handleSubmit}>
        참가하기
      </button>
    </div>
  );
}
