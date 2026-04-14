'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/auth'
import api from '../../lib/axios'

interface ClinicaOption { id: number; nombre: string }

export default function ClinicaSwitcher() {
  const { activeClinicaId, activeClinicaNombre, setActiveClinica } = useAuthStore()
  const [clinicas, setClinicas] = useState<ClinicaOption[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.get('/clinicas/').then(r => {
      const data = r.data.results ?? r.data
      setClinicas(data.map((c: any) => ({ id: c.id, nombre: c.nombre })))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const ChevronIcon = () => (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points={open ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
    </svg>
  )

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 14px', borderRadius: 12, fontSize: 13, fontWeight: 600,
          cursor: 'pointer',
          background: 'rgba(232,160,100,0.12)',
          borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(232,160,100,0.35)',
          color: '#E8A064',
        }}
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        {activeClinicaNombre ?? 'Seleccionar clínica'}
        <ChevronIcon />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              minWidth: 220, borderRadius: 16, zIndex: 999,
              background: 'var(--glass)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(232,160,100,0.25)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '8px 12px 6px', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Cambiar clínica
              </p>
            </div>
            <div style={{ padding: 6, maxHeight: 280, overflowY: 'auto' }}>
              {clinicas.length === 0 ? (
                <p style={{ padding: '10px 12px', fontSize: 13, color: 'var(--muted)' }}>Cargando...</p>
              ) : clinicas.map(c => (
                <motion.button
                  key={c.id}
                  onClick={() => { setActiveClinica(c.id, c.nombre); setOpen(false) }}
                  whileHover={{ background: 'rgba(232,160,100,0.1)' }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 10,
                    fontSize: 13, fontWeight: c.id === activeClinicaId ? 700 : 500,
                    cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: 10,
                    background: c.id === activeClinicaId ? 'rgba(232,160,100,0.12)' : 'transparent',
                    color: c.id === activeClinicaId ? '#E8A064' : 'var(--text)',
                  }}
                >
                  {c.id === activeClinicaId ? (
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : <span style={{ width: 12 }} />}
                  {c.nombre}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
