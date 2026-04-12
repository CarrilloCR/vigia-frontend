'use client'
import { useEffect } from 'react'

export default function CursorGlow() {
  useEffect(() => {
    const el = document.getElementById('cursor-glow')
    if (!el) return
    const onMove = (e: MouseEvent) => {
      el.style.left = e.clientX + 'px'
      el.style.top = e.clientY + 'px'
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return <div id="cursor-glow" aria-hidden="true" />
}
