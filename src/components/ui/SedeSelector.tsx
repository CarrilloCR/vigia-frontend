'use client'
import { useEffect, useState } from 'react'
import api from '../../lib/axios'
import { Sede } from '../../types'

const MapPinIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

interface SedeSelectorProps {
  clinicaId: number
  value: number | null
  onChange: (sedeId: number | null) => void
  placeholder?: string
  compact?: boolean
}

export default function SedeSelector({
  clinicaId,
  value,
  onChange,
  placeholder = 'Todas las sedes',
  compact = false,
}: SedeSelectorProps) {
  const [sedes, setSedes] = useState<Sede[]>([])

  useEffect(() => {
    api.get(`/sedes/?clinica=${clinicaId}`)
      .then(res => setSedes(res.data.results || res.data))
      .catch(() => {})
  }, [clinicaId])

  if (sedes.length <= 1) return null

  const selected = sedes.find(s => s.id === value)

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <div style={{
        position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
        color: 'var(--primary)', pointerEvents: 'none', zIndex: 1,
      }}>
        <MapPinIcon />
      </div>
      <select
        value={value ?? ''}
        onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
        style={{
          paddingLeft: 34, paddingRight: compact ? 28 : 36,
          paddingTop: compact ? 8 : 10, paddingBottom: compact ? 8 : 10,
          borderRadius: 12, fontSize: compact ? 12 : 13, fontWeight: 500,
          background: value ? 'rgba(155,142,196,0.12)' : 'var(--glass)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${value ? 'rgba(155,142,196,0.4)' : 'var(--border)'}`,
          color: value ? 'var(--primary)' : 'var(--muted)',
          cursor: 'pointer', outline: 'none',
          boxShadow: 'var(--shadow-sm)',
          appearance: 'none', WebkitAppearance: 'none',
          transition: 'all 0.2s',
        }}
      >
        <option value="">{placeholder}</option>
        {sedes.map(s => (
          <option key={s.id} value={s.id} style={{ background: 'var(--card)', color: 'var(--text)' }}>
            {s.nombre}{!s.activa ? ' (inactiva)' : ''}
          </option>
        ))}
      </select>
      {/* Chevron */}
      <div style={{
        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
        pointerEvents: 'none', color: 'var(--muted)',
      }}>
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
    </div>
  )
}
