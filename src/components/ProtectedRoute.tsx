'use client'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit'
}

const variants = {
  primary: {
    background: 'var(--primary)',
    color: 'white',
    border: 'none',
  },
  secondary: {
    background: 'var(--glass)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
  },
  danger: {
    background: 'var(--danger)',
    color: 'white',
    border: 'none',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--muted)',
    border: '1px solid var(--border)',
  },
  success: {
    background: 'var(--success)',
    color: 'white',
    border: 'none',
  },
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02, opacity: disabled || loading ? 0.5 : 0.9 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        font-medium transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
      `}
      style={variants[variant]}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : children}
    </motion.button>
  )
}