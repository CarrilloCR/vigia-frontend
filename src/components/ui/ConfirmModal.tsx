'use client'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

const variantStyles = {
  danger: {
    icon: (
      <svg width="28" height="28" fill="none" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    iconBg: 'rgba(255,107,107,0.12)',
    iconBorder: 'rgba(255,107,107,0.25)',
    btnBg: 'linear-gradient(135deg, #FF6B6B, #d4789e)',
    btnShadow: '0 4px 20px rgba(255,107,107,0.3)',
  },
  warning: {
    icon: (
      <svg width="28" height="28" fill="none" stroke="#e8d2a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    iconBg: 'rgba(232,210,160,0.12)',
    iconBorder: 'rgba(232,210,160,0.25)',
    btnBg: 'linear-gradient(135deg, #e8d2a0, #d4b878)',
    btnShadow: '0 4px 20px rgba(232,210,160,0.3)',
  },
  info: {
    icon: (
      <svg width="28" height="28" fill="none" stroke="#00C9A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    iconBg: 'rgba(0,201,167,0.12)',
    iconBorder: 'rgba(0,201,167,0.25)',
    btnBg: 'linear-gradient(135deg, var(--primary), var(--accent))',
    btnShadow: '0 4px 20px rgba(0,201,167,0.3)',
  },
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const v = variantStyles[variant]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 420,
              padding: '32px', borderRadius: 24,
              background: 'var(--glass)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid var(--border)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
            }}
          >
            {/* Icon */}
            <div style={{
              width: 56, height: 56, borderRadius: 18,
              background: v.iconBg, border: `1px solid ${v.iconBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              {v.icon}
            </div>

            {/* Content */}
            <h3 className="font-display" style={{
              fontSize: 20, fontWeight: 700, color: 'var(--text)',
              textAlign: 'center', marginBottom: 10,
            }}>
              {title}
            </h3>
            <p style={{
              fontSize: 14, color: 'var(--muted)', textAlign: 'center',
              lineHeight: 1.6, marginBottom: 28,
            }}>
              {message}
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              <motion.button
                onClick={onCancel}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  flex: 1, padding: '14px 0', borderRadius: 14,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)',
                  color: 'var(--muted)', fontSize: 14, fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {cancelLabel}
              </motion.button>
              <motion.button
                onClick={onConfirm}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                style={{
                  flex: 1, padding: '14px 0', borderRadius: 14,
                  background: v.btnBg,
                  color: 'white', fontSize: 14, fontWeight: 600,
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: v.btnShadow,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {loading && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{
                      width: 16, height: 16,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white', borderRadius: '50%',
                    }}
                  />
                )}
                {loading ? 'Procesando...' : confirmLabel}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
