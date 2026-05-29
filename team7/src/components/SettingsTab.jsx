import { useState, useEffect, useRef } from 'react'

export default function SettingsTab({ fireEnabled, nightMode, darkMode, onToggleFire, onToggleNight, onToggleDark }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.closest('.settings-tab').contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return (
    <div className="settings-tab" ref={menuRef}>
      <button
        className="settings-btn"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
      >
        ⚙️ 시스템 설정
      </button>
      {open && (
        <div className="settings-menu" onClick={(e) => e.stopPropagation()}>
          <div className="setting-item">
            <span>사격 파티클</span>
            <button
              className={`toggle-btn ${fireEnabled ? 'active' : ''}`}
              onClick={onToggleFire}
            >
              {fireEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="setting-item">
            <span>야간 투시</span>
            <button
              className={`toggle-btn ${nightMode ? 'active' : ''}`}
              onClick={onToggleNight}
            >
              {nightMode ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="setting-item">
            <span>다크 모드</span>
            <button
              className={`toggle-btn ${darkMode ? 'active' : ''}`}
              onClick={onToggleDark}
            >
              {darkMode ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
