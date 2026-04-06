'use client'
import { useRef, useState, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface TiltedCardProps {
  children: ReactNode
  className?: string
  tiltAmount?: number
  scaleOnHover?: number
  onClick?: () => void
}

export default function TiltedCard({
  children, className = '', tiltAmount = 8, scaleOnHover = 1.02, onClick,
}: TiltedCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width / 2)
    const dy = (e.clientY - cy) / (rect.height / 2)
    setTilt({ x: -dy * tiltAmount, y: dx * tiltAmount })
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }) }}
      onClick={onClick}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
        scale: hovered ? scaleOnHover : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ transformStyle: 'preserve-3d', cursor: onClick ? 'pointer' : 'default' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}