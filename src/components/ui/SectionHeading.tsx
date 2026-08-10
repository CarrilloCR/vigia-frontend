'use client'
import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface SectionHeadingProps {
  /** small uppercase label above the title — the editorial signature */
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  /** right-aligned actions (buttons, filters) */
  action?: ReactNode
  size?: 'lg' | 'md'
  className?: string
}

/**
 * Editorial section/page header: eyebrow + large Syne display title + action.
 * The core visual signature defined in BRAND.md §4.
 */
export default function SectionHeading({
  eyebrow, title, subtitle, action, size = 'lg', className = '',
}: SectionHeadingProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        gap: 'var(--s-6)', flexWrap: 'wrap', marginBottom: 'var(--s-8)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ minWidth: 0 }}
      >
        {eyebrow && <span className="eyebrow" style={{ marginBottom: 10, display: 'inline-flex' }}>{eyebrow}</span>}
        <h1 className={size === 'lg' ? 'display-lg' : 'display-md'} style={{ color: 'var(--text)', margin: 0 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ color: 'var(--muted)', fontSize: 15, marginTop: 10, maxWidth: 560, lineHeight: 1.6 }}>
            {subtitle}
          </p>
        )}
      </motion.div>
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', flexWrap: 'wrap' }}
        >
          {action}
        </motion.div>
      )}
    </div>
  )
}
