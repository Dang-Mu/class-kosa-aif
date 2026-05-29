import { useEffect, useRef } from 'react'

export default function Cursor({ nightMode }) {
  const cursorRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px'
        cursorRef.current.style.top = e.clientY + 'px'
      }
      document.documentElement.style.setProperty('--x', e.clientX + 'px')
      document.documentElement.style.setProperty('--y', e.clientY + 'px')
    }
    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <>
      {nightMode && <div className="flashlight-overlay" />}
      <div ref={cursorRef} className="cursor">
        <div className="ch ch-v" />
        <div className="ch ch-h" />
      </div>
    </>
  )
}
