import { useState, useCallback, useRef } from 'react'

export function useToast() {
  const [toast, setToast] = useState({ visible: false, message: '' })
  const timerRef = useRef(null)

  const showToast = useCallback((message) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast({ visible: true, message })
    timerRef.current = setTimeout(() => {
      setToast({ visible: false, message: '' })
    }, 2000)
  }, [])

  return { toast, showToast }
}
