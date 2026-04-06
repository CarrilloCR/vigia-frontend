'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useToastStore, type ToastType } from '../../store/toast'

const icons: Record<ToastType, React.ReactNode> = {
  success: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
}

const colors: Record<ToastType, { bg: string; border: string; icon: string; bar: string }> = {
  success: {
    bg: 'rgba(160,196,181,0.1)',
    border: 'rgba(160,196,181,0.3)',
    icon: '#a0c4b5',
    bar: '#a0c4b5',
  },
  error: {
    bg: 'rgba(232,160,196,0.1)',
    border: 'rgba(232,160,196,0.3)',
    icon: '#e8a0c4',
    bar: '#e8a0c4',
  },
  warning: {
    bg: 'rgba(232,210,160,0.1)',
    border: 'rgba(232,210,160,0.3)',
    icon: '#e8d2a0',
    bar: '#e8d2a0',
  },
  info: {
    bg: 'rgba(155,142,196,0.1)',
    border: 'rgba(155,142,196,0.3)',
    icon: '#9b8ec4',
    bar: '#9b8ec4',
  },
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxWidth: 420,
        width: '100%',
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const c = colors[toast.type]
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              style={{
                pointerEvents: 'auto',
                padding: '16px 18px',
                borderRadius: 18,
                background: c.bg,
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: `1px solid ${c.border}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                cursor: 'pointer',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}
              onClick={() => removeToast(toast.id)}
              whileHover={{ scale: 1.02, x: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Progress bar */}
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: (toast.duration || 4500) / 1000, ease: 'linear' }}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: c.bar,
                  transformOrigin: 'left',
                  borderRadius: '0 0 18px 18px',
                  opacity: 0.6,
                }}
              />

              {/* Icon */}
              <div style={{ color: c.icon, flexShrink: 0, marginTop: 1 }}>
                {icons[toast.type]}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
                  {toast.title}
                </p>
                {toast.message && (
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, lineHeight: 1.4 }}>
                    {toast.message}
                  </p>
                )}
                {toast.action && (
                  <button
                    onClick={(e) => { e.stopPropagation(); toast.action!.onClick(); removeToast(toast.id) }}
                    style={{
                      marginTop: 8, padding: '5px 14px', borderRadius: 8,
                      background: `${c.icon}22`, border: `1px solid ${c.border}`,
                      color: c.icon, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>

              {/* Close */}
              <button
                onClick={(e) => { e.stopPropagation(); removeToast(toast.id) }}
                style={{
                  flexShrink: 0, background: 'none', border: 'none',
                  color: 'var(--muted)', cursor: 'pointer', padding: 2,
                  opacity: 0.5,
                }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
