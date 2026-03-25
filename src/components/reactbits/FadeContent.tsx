'use client'
import { motion, useInView } from 'framer-motion'
import { useRef, ReactNode } from 'react'

interface FadeContentProps {
  children: ReactNode
  blur?: boolean
  duration?: number
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  distance?: number
  className?: string
}

export default function FadeContent({
  children, blur = false, duration = 0.5,
  delay = 0, direction = 'up', distance = 20, className = '',
}: FadeContentProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const dirMap = {
    up:    { y: distance },
    down:  { y: -distance },
    left:  { x: distance },
    right: { x: -distance },
    none:  {},
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, filter: blur ? 'blur(10px)' : 'none', ...dirMap[direction] }}
      animate={isInView
        ? { opacity: 1, filter: 'blur(0px)', x: 0, y: 0 }
        : { opacity: 0, filter: blur ? 'blur(10px)' : 'none', ...dirMap[direction] }
      }
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}