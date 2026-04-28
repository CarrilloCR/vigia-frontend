'use client'
import { motion } from 'framer-motion'

interface PasswordRequirementsProps {
  password: string
}

const requirements = [
  { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Al menos 1 mayúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Al menos 1 minúscula', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Al menos 2 números', test: (p: string) => (p.match(/[0-9]/g) || []).length >= 2 },
  { label: '1 carácter especial (!@#$%...)', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(p) },
]

export function validatePassword(password: string): boolean {
  return requirements.every(r => r.test(password))
}

export default function PasswordRequirements({ password }: PasswordRequirementsProps) {
  if (!password) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      style={{
        marginTop: 12,
        padding: '14px 16px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border)',
      }}
    >
      <p style={{
        fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.5px', color: 'var(--muted)', marginBottom: 10,
      }}>
        Requisitos de contraseña
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {requirements.map((req, i) => {
          const passed = req.test(password)
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 13,
              }}
            >
              <motion.div
                animate={{
                  background: passed
                    ? 'rgba(0,201,167,0.2)'
                    : 'rgba(255,255,255,0.06)',
                  borderColor: passed
                    ? 'rgba(0,201,167,0.4)'
                    : 'var(--border)',
                }}
                style={{
                  width: 20, height: 20, borderRadius: 6,
                  border: '1px solid',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                }}
              >
                <motion.svg
                  width="12" height="12" fill="none"
                  stroke={passed ? '#a0c4b5' : 'var(--muted)'}
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  viewBox="0 0 24 24"
                  animate={{ opacity: passed ? 1 : 0.3, scale: passed ? 1 : 0.8 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </motion.svg>
              </motion.div>
              <motion.span
                animate={{
                  color: passed ? 'var(--success)' : 'var(--muted)',
                }}
                style={{ transition: 'color 0.2s', fontWeight: passed ? 500 : 400 }}
              >
                {req.label}
              </motion.span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
