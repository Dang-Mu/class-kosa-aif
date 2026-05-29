import { useCallback } from 'react'

export function useParticles(fireEnabled) {
  const createParticles = useCallback(
    (e) => {
      if (!fireEnabled) return
      if (
        e.target.closest('.settings-tab') ||
        e.target.closest('.modal') ||
        e.target.closest('input') ||
        e.target.closest('textarea') ||
        e.target.closest('select') ||
        e.target.closest('.sort-btn')
      )
        return

      const particleCount = 8
      for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div')
        p.className = 'particle'

        const size = Math.random() * 6 + 2
        p.style.width = size + 'px'
        p.style.height = size + 'px'
        p.style.left = e.clientX + 'px'
        p.style.top = e.clientY + 'px'

        document.body.appendChild(p)

        const angle = Math.random() * Math.PI * 2
        const velocity = Math.random() * 8 + 4

        let vx = Math.cos(angle) * velocity
        let vy = Math.sin(angle) * velocity - 3
        let x = e.clientX
        let y = e.clientY
        let opacity = 1

        const animate = () => {
          x += vx
          y += vy
          vy += 0.5
          opacity -= 0.03

          p.style.left = x + 'px'
          p.style.top = y + 'px'
          p.style.opacity = opacity

          if (opacity > 0) {
            requestAnimationFrame(animate)
          } else {
            p.remove()
          }
        }
        requestAnimationFrame(animate)
      }
    },
    [fireEnabled]
  )

  return createParticles
}
