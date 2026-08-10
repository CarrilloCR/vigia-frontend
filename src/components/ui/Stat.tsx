'use client'
import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface StatProps {
  label: string
  value: ReactNode
  /** delta text, e.g. "+12%" */
  delta?: string
  deltaDir?: 'up' | 'down' | 'flat'
  /** up is good by default; set false for metrics where up is bad (cancelaciones) */
  positiveIsGood?: boolean
  icon?: ReactNode
  accent?: 'jade' | 'coral' | 'sap' | 'gold' | 'orchid'
  delay?: number
}

const accentColor: Record<string, string> = {
  jade: 'var(--jade)', coral: 'var(--coral)', sap: 'var(--sapphire)',
  gold: 'var(--gold)', orchid: 'var(--orchid)',
}

/** Editorial KPI stat: eyebrow label + huge Syne number + delta. */
export default function Stat({
  label, value, delta, deltaDir = 'flat', positiveIsGood = true,
  icon, accent = 'jade', delay = 0,
}: StatProps) {
  const good = deltaDir === 'flat' ? null
    : (deltaDir === 'up') === positiveIsGood
  const deltaColor = good === null ? 'var(--muted)' : good ? 'var(--jade)' : 'var(--coral)'
  const arrow = deltaDir === 'up' ? '↑' : deltaDir === 'down' ? '↓' : '→'

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="glass card-hover"
      style={{
        position: 'relative', overflow: 'hidden',
        borderRadius: 'var(--r-xl)', padding: 'var(--s-6)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: accentColor[accent], opacity: 0.85 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <span className="eyebrow">{label}</span>
        {icon && <span style={{ color: accentColor[accent], opacity: 0.9 }}>{icon}</span>}
      </div>
      <div className="display-md tnum" style={{ color: 'var(--text)', lineHeight: 1 }}>{value}</div>
      {delta && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: deltaColor }}>
          <span>{arrow}</span><span className="tnum">{delta}</span>
        </div>
      )}
    </motion.div>
  )
}
