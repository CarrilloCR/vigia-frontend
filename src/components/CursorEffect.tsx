'use client'
import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { usePrefsStore } from '../store/prefs'

type HoverKind = 'default' | 'link' | 'text'

// Por encima de modales/toasts (que usan 9999–10000) para que nunca quede debajo.
const CURSOR_Z = 2147483000

export default function CursorEffect() {
  const cursorCustom = usePrefsStore(s => s.cursorCustom)
  const [enabled, setEnabled] = useState(false)
  const [hovering, setHovering] = useState<HoverKind>('default')
  const [down, setDown] = useState(false)

  // Raw pointer (precise center dot)
  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)
  // Smoothed pointer (diamond ring trails slightly)
  const x = useSpring(mouseX, { damping: 24, stiffness: 350, mass: 0.35 })
  const y = useSpring(mouseY, { damping: 24, stiffness: 350, mass: 0.35 })

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (!cursorCustom) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEnabled(false)
      document.documentElement.classList.remove('has-custom-cursor')
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(true)
    document.documentElement.classList.add('has-custom-cursor')

    const move = (e: MouseEvent) => { mouseX.set(e.clientX); mouseY.set(e.clientY) }
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (!t?.closest) return
      if (t.closest('a, button, [role=button], input, select, textarea, [data-cursor=link]')) setHovering('link')
      else if (t.closest('h1, h2, h3, p, span, [data-cursor=text]')) setHovering('text')
      else setHovering('default')
    }
    const dn = () => setDown(true)
    const up = () => setDown(false)

    window.addEventListener('mousemove', move, { passive: true })
    window.addEventListener('mouseover', over, { passive: true })
    window.addEventListener('mousedown', dn)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
      window.removeEventListener('mousedown', dn)
      window.removeEventListener('mouseup', up)
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [mouseX, mouseY, cursorCustom])

  if (!enabled) return null

  // Ring behaviour per state
  const radius = hovering === 'link' ? 20 : hovering === 'text' ? 9 : 13
  const ringScale = down ? 0.8 : hovering === 'link' ? 1.15 : 1
  const spin = hovering === 'link' ? 3.2 : 7
  const dSize = hovering === 'link' ? 8 : 6.5
  const dotScale = hovering === 'text' ? 0.5 : down ? 1.4 : 1
  const diamonds = [0, 90, 180, 270]

  return (
    <>
      {/* Orbiting diamond ring — smoothed follow */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0"
        style={{ x, y, translateX: '-50%', translateY: '-50%', zIndex: CURSOR_Z }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: spin, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'relative', width: 0, height: 0 }}
        >
          <motion.div
            animate={{ scale: ringScale }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
            style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0 }}
          >
            {diamonds.map((a) => (
              <div key={a} style={{ position: 'absolute', left: 0, top: 0, transform: `rotate(${a}deg)` }}>
                <motion.div
                  animate={{ y: -radius }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  style={{ position: 'absolute', left: 0, top: 0 }}
                >
                  <motion.span
                    aria-hidden
                    animate={{ width: dSize, height: dSize }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    style={{
                      display: 'block',
                      marginLeft: -dSize / 2, marginTop: -dSize / 2,
                      background: 'var(--jade)',
                      borderRadius: 1.5,
                      transform: 'rotate(45deg)',
                      boxShadow: '0 0 7px var(--jade), 0 0 2px var(--jade)',
                    }}
                  />
                </motion.div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Precise center dot — raw pointer */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0"
        style={{ x: mouseX, y: mouseY, translateX: '-50%', translateY: '-50%', zIndex: CURSOR_Z }}
      >
        <motion.div
          animate={{ scale: dotScale, opacity: hovering === 'link' ? 0.9 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 24 }}
          style={{
            width: 5, height: 5, borderRadius: '50%',
            background: hovering === 'link' ? 'var(--jade)' : 'var(--text)',
            boxShadow: hovering === 'link' ? '0 0 8px var(--jade)' : 'none',
          }}
        />
      </motion.div>
    </>
  )
}
