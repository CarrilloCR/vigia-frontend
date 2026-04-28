'use client'
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface MagnetProps {
  children: React.ReactNode
  strength?: number
  className?: string
  style?: React.CSSProperties
}

export default function Magnet({ children, strength = 0.35, className = '', style }: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [active, setActive] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    setPos({
      x: (e.clientX - cx) * strength,
      y: (e.clientY - cy) * strength,
    })
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => { setActive(false); setPos({ x: 0, y: 0 }) }}
      animate={{ x: active ? pos.x : 0, y: active ? pos.y : 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18, mass: 0.5 }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}
