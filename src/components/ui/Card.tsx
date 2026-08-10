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
  /** editorial accent stripe on the left edge */
  accent?: 'jade' | 'coral' | 'sap' | 'gold' | 'orchid'
}

const accentColor: Record<string, string> = {
  jade: 'var(--jade)', coral: 'var(--coral)', sap: 'var(--sapphire)',
  gold: 'var(--gold)', orchid: 'var(--orchid)',
}

export default function Card({
  children,
  className = '',
  hover = false,
  glow = false,
  onClick,
  delay = 0,
  accent,
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -4 } : undefined}
      onClick={onClick}
      className={`glass ${hover ? 'card-hover cursor-pointer' : ''} ${glow ? 'animate-pulse-glow' : ''} ${className}`}
      style={{
        position: 'relative',
        borderRadius: 'var(--r-xl)',
        padding: 'var(--s-8)',
        boxShadow: glow ? 'var(--shadow-brand)' : 'var(--shadow-md)',
        overflow: 'hidden',
      }}
    >
      {accent && (
        <span style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
          background: accentColor[accent], opacity: 0.9,
        }} />
      )}
      {children}
    </motion.div>
  )
}
