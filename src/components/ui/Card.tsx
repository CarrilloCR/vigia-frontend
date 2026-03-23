'use client'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  onClick?: () => void
  delay?: number
}

export default function Card({
  children,
  className = '',
  hover = false,
  glow = false,
  onClick,
  delay = 0,
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={hover ? { y: -2, scale: 1.01 } : {}}
      onClick={onClick}
      className={`glass rounded-2xl p-5 ${hover ? 'cursor-pointer glass-hover' : ''} ${glow ? 'animate-pulse-glow' : ''} ${className}`}
    >
      {children}
    </motion.div>
  )
}