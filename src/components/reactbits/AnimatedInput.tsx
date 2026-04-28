'use client'
import { useState, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AnimatedInputProps {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  icon?: React.ReactNode
}

export default function AnimatedInput({
  label, type = 'text', value, onChange, placeholder, error, icon,
}: AnimatedInputProps) {
  const [focused, setFocused] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const id = useId()
  const inputType = type === 'password' ? (showPass ? 'text' : 'password') : type
  const isActive = focused || value.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div
        style={{
          position: 'relative',
          borderRadius: 14,
          border: `1.5px solid ${error ? 'var(--danger)' : focused ? 'var(--primary)' : 'var(--border)'}`,
          background: focused ? 'rgba(0,201,167,0.07)' : 'rgba(255,255,255,0.03)',
          boxShadow: focused ? '0 0 0 4px rgba(0,201,167,0.12)' : 'none',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          height: 68,
          overflow: 'hidden',
        }}
      >
        {icon && (
          <div style={{
            paddingLeft: 18, paddingRight: 4, color: focused ? 'var(--primary)' : 'var(--muted)',
            display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'color 0.2s',
          }}>
            {icon}
          </div>
        )}

        <div style={{ flex: 1, position: 'relative', height: '100%', paddingLeft: icon ? 8 : 18, paddingRight: 4 }}>
          <motion.label
            htmlFor={id}
            animate={{
              y: isActive ? -12 : 0,
              scale: isActive ? 0.72 : 1,
              color: focused ? 'var(--primary)' : 'var(--muted)',
            }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              transformOrigin: 'left center',
              fontSize: 15,
              fontWeight: 500,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              color: 'var(--muted)',
            }}
          >
            {label}
          </motion.label>

          <input
            id={id}
            type={inputType}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              position: 'absolute',
              bottom: 12,
              left: 0,
              right: 0,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 15,
              color: 'var(--text)',
              fontFamily: 'Inter, sans-serif',
              width: '100%',
              fontWeight: 500,
            }}
          />
        </div>

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            style={{
              paddingRight: 18, paddingLeft: 8, background: 'none', border: 'none',
              cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', flexShrink: 0,
            }}
          >
            {showPass ? (
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ fontSize: 12, color: 'var(--danger)', marginLeft: 4 }}>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}