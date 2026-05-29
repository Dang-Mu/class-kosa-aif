import { useState } from 'react'
import QuestPanel from './QuestPanel'
import QAPanel from './QAPanel'

export default function QuestBoard({ roomId, roomInfo, username, onExit, showToast }) {
  const [activeTab, setActiveTab] = useState('quest')

  return (
    <div className="quest-board">
      {/* 뒤로가기 */}
      <button
        onClick={onExit}
        style={{
          position: 'fixed', top: 20, left: 20, zIndex: 10001,
          background: 'var(--panel)', border: '2px solid var(--border)', color: 'var(--text)',
          padding: '10px 18px', fontFamily: "'DungGeunMo',monospace", fontSize: 14,
          boxShadow: '4px 4px 0 #000', cursor: 'none',
        }}
      >
        ← 메인으로
      </button>

      {/* 헤더 */}
      <div style={{ marginBottom: 30, borderBottom: '2px solid var(--border)', paddingBottom: 20, paddingLeft: 160 }}>
        <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 4 }}>[ 작전 통제 센터 / 퀘스트 보드 ]</div>
        <h2 style={{ margin: 0, color: 'var(--point)', fontSize: 32 }}>
          {roomInfo.school} {roomInfo.grade}학년 {roomInfo.class}반 퀘스트 보드
        </h2>
        <div style={{ fontSize: 12, opacity: 0.4, marginTop: 6 }}>
          접속자: <span style={{ color: 'var(--point)' }}>{username}</span>
        </div>
      </div>

      {/* 탭 */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 25, borderBottom: '2px solid var(--border)', paddingLeft: 160 }}>
        {[{ key: 'quest', label: '📋 퀘스트 목록' }, { key: 'qa', label: '💬 Q&A' }].map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              background: isActive ? 'var(--point)' : 'transparent',
              border: `2px solid ${isActive ? 'var(--point)' : 'var(--border)'}`,
              borderBottom: 'none', color: isActive ? '#000' : 'var(--text)',
              padding: '10px 24px', fontFamily: "'DungGeunMo',monospace", fontSize: 14,
              cursor: 'none', marginBottom: -2, opacity: isActive ? 1 : 0.5,
            }}>{tab.label}</button>
          )
        })}
      </div>

      {/* 패널 */}
      {activeTab === 'quest' && (
        <QuestPanel roomId={roomId} username={username} showToast={showToast} />
      )}
      {activeTab === 'qa' && (
        <QAPanel roomId={roomId} showToast={showToast} />
      )}
    </div>
  )
}
