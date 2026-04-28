'use client'
import { motion, useInView } from 'framer-motion'
import { useRef, ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  delay?: number
  duration?: number
  distance?: number
  scale?: number
  blur?: boolean
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  className?: string
  style?: React.CSSProperties
}

export default function ScrollReveal({
  children,
  delay = 0,
  duration = 0.6,
  distance = 32,
  scale = 0.96,
  blur = true,
  direction = 'up',
  className = '',
  style,
}: ScrollRevealProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const dir = {
    up:    { y: distance, x: 0 },
    down:  { y: -distance, x: 0 },
    left:  { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    none:  { x: 0, y: 0 },
  }[direction]

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, scale, filter: blur ? 'blur(8px)' : 'none', ...dir }}
      animate={inView
        ? { opacity: 1, scale: 1, filter: 'blur(0px)', x: 0, y: 0 }
        : { opacity: 0, scale, filter: blur ? 'blur(8px)' : 'none', ...dir }
      }
      transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  )
}
