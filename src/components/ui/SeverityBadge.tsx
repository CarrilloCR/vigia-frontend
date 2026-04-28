'use client'
import { motion } from 'framer-motion'

interface SeverityBadgeProps {
  severidad: 'baja' | 'media' | 'alta' | 'critica'
}

const config = {
  baja:    { label: 'Baja',    color: 'var(--jade)',     emoji: '🟢' },
  media:   { label: 'Media',   color: 'var(--gold)',     emoji: '🟡' },
  alta:    { label: 'Alta',    color: 'var(--sapphire)', emoji: '🟠' },
  critica: { label: 'Crítica', color: 'var(--coral)',    emoji: '🔴' },
}

export default function SeverityBadge({ severidad }: SeverityBadgeProps) {
  const { label, color, emoji } = config[severidad]

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {emoji} {label}
    </motion.span>
  )
}