'use client'
import { ReactNode } from 'react'

type Tone = 'jade' | 'coral' | 'sap' | 'gold' | 'orchid' | 'neutral'

interface BadgeProps {
  children: ReactNode
  tone?: Tone
  dot?: boolean
  className?: string
}

const dotColor: Record<Tone, string> = {
  jade: 'var(--jade)', coral: 'var(--coral)', sap: 'var(--sapphire)',
  gold: 'var(--gold)', orchid: 'var(--orchid)', neutral: 'var(--muted)',
}

/** Map alert severity → tone (single source of truth for severity color). */
export const severityTone: Record<string, Tone> = {
  critica: 'coral', alta: 'coral', media: 'gold', baja: 'sap',
  activa: 'coral', revisada: 'gold', resuelta: 'jade',
}

export default function Badge({ children, tone = 'jade', dot = false, className = '' }: BadgeProps) {
  const cls = tone === 'neutral' ? '' : `badge-${tone}`
  return (
    <span
      className={`badge ${cls} ${className}`}
      style={tone === 'neutral' ? {
        background: 'var(--lift)', color: 'var(--sub)', border: '1px solid var(--border)',
      } : undefined}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor[tone], boxShadow: `0 0 8px ${dotColor[tone]}` }} />}
      {children}
    </span>
  )
}
