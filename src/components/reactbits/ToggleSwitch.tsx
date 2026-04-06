'use client'
import { motion } from 'framer-motion'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md'
}

export default function ToggleSwitch({ checked, onChange, disabled = false, size = 'md' }: ToggleSwitchProps) {
  const w = size === 'sm' ? 40 : 48
  const h = size === 'sm' ? 22 : 26
  const dot = size === 'sm' ? 16 : 20
  const pad = (h - dot) / 2
  const travel = w - dot - pad * 2

  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      animate={{
        background: checked
          ? 'linear-gradient(135deg, var(--primary), var(--accent))'
          : 'rgba(255,255,255,0.08)',
      }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      style={{
        width: w,
        height: h,
        borderRadius: h,
        border: checked ? '1px solid rgba(155,142,196,0.4)' : '1px solid var(--border)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        padding: 0,
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ x: checked ? travel : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          width: dot,
          height: dot,
          borderRadius: '50%',
          background: 'white',
          position: 'absolute',
          top: pad,
          left: pad,
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }}
      />
    </motion.button>
  )
}
