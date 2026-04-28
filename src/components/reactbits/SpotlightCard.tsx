'use client'
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface SpotlightCardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  spotlightColor?: string
  from?: 'bottom' | 'top' | 'left' | 'right' | 'none'
}

export default function SpotlightCard({
  children, className = '', style, spotlightColor = 'rgba(0,201,167,0.22)', from = 'none',
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 50, y: 50 })
  const [hovered, setHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  const edgeGlow: Record<string, string> = {
    bottom: 'inset 0 -2px 0 rgba(0,201,167,0.5), 0 16px 40px rgba(0,201,167,0.12)',
    top:    'inset 0  2px 0 rgba(0,201,167,0.5), 0 -8px 30px rgba(0,201,167,0.1)',
    left:   'inset 2px 0  0 rgba(0,201,167,0.5)',
    right:  'inset -2px 0 0 rgba(0,201,167,0.5)',
    none:   'none',
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-3xl ${className}`}
      style={{
        background: 'var(--glass)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid var(--border)',
        boxShadow: hovered ? edgeGlow[from] : 'var(--shadow-lg)',
        transition: 'box-shadow 0.3s ease',
        ...style,
      }}
    >
      {/* spotlight */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, ${spotlightColor} 0%, transparent 60%)`,
        }}
      />
      {children}
    </motion.div>
  )
}
