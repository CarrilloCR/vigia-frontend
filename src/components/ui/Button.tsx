'use client'
import { motion } from 'framer-motion'
import { ReactNode, CSSProperties } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'signal'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit'
  className?: string
}

const variants: Record<string, CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, var(--jade), #06B79B)',
    color: '#03130F',
    border: '1px solid rgba(0,214,178,0.5)',
    boxShadow: 'var(--shadow-brand)',
    fontWeight: 700,
  },
  signal: {
    background: 'linear-gradient(135deg, var(--coral), #F04A4A)',
    color: '#1A0606',
    border: '1px solid rgba(255,107,107,0.5)',
    boxShadow: 'var(--shadow-signal)',
    fontWeight: 700,
  },
  success: {
    background: 'linear-gradient(135deg, var(--jade), #06B79B)',
    color: '#03130F',
    border: '1px solid rgba(0,214,178,0.5)',
    fontWeight: 700,
  },
  danger: {
    background: 'linear-gradient(135deg, var(--coral), #F04A4A)',
    color: '#1A0606',
    border: '1px solid rgba(255,107,107,0.5)',
    fontWeight: 700,
  },
  secondary: {
    background: 'var(--glass)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    backdropFilter: 'blur(20px)',
    fontWeight: 600,
  },
  ghost: {
    background: 'transparent',
    color: 'var(--sub)',
    border: '1px solid var(--border)',
    fontWeight: 600,
  },
}

const sizes = {
  sm: 'px-3.5 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}
const radii = { sm: 'var(--r-md)', md: 'var(--r-md)', lg: 'var(--r-lg)' }

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  className = '',
}: ButtonProps) {
  const spinnerColor = ['primary', 'signal', 'success', 'danger'].includes(variant) ? '#03130F' : 'var(--jade)'
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.025, y: disabled || loading ? 0 : -1 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      className={`
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2 whitespace-nowrap
        ${className}
      `}
      style={{ ...variants[variant], borderRadius: radii[size], letterSpacing: '0.01em' }}
    >
      {loading ? (
        <div className="w-4 h-4 rounded-full animate-spin"
          style={{ border: `2px solid ${spinnerColor}`, borderTopColor: 'transparent' }} />
      ) : children}
    </motion.button>
  )
}
