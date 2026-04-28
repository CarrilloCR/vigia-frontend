'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CursorEffect() {
  const [enabled, setEnabled] = useState(false)
  const [hovering, setHovering] = useState<'default' | 'link' | 'text'>('default')

  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)
  const x = useSpring(mouseX, { damping: 22, stiffness: 280, mass: 0.4 })
  const y = useSpring(mouseY, { damping: 22, stiffness: 280, mass: 0.4 })
  const trailRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    setEnabled(true)
    document.documentElement.classList.add('has-custom-cursor')

    function move(e: MouseEvent) { mouseX.set(e.clientX); mouseY.set(e.clientY) }
    function over(e: MouseEvent) {
      const t = e.target as HTMLElement
      if (!t?.closest) return
      if (t.closest('a, button, [role=button], input, select, textarea, [data-cursor=link]')) setHovering('link')
      else if (t.closest('h1, h2, h3, p, [data-cursor=text]')) setHovering('text')
      else setHovering('default')
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseover', over)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [mouseX, mouseY])

  if (!enabled) return null
  const size = hovering === 'link' ? 56 : hovering === 'text' ? 4 : 14

  return (
    <>
      <motion.div
        ref={trailRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[9999] mix-blend-difference"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
      >
        <motion.div
          animate={{
            width: size, height: size,
            borderColor: hovering === 'link' ? 'rgba(0,201,167,0.95)' : 'rgba(232,244,242,0.75)',
          }}
          transition={{ duration: 0.18 }}
          className="rounded-full border-2"
        />
      </motion.div>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[9999]"
        style={{ x: mouseX, y: mouseY, translateX: '-50%', translateY: '-50%' }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: hovering === 'link' ? '#00C9A7' : '#E8F4F2' }}
        />
      </motion.div>
    </>
  )
}
