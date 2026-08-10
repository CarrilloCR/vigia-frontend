'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import api from '../../../../lib/axios'
import { useAuthStore } from '../../../../store/auth'
import { useToastStore } from '../../../../store/toast'
import GlowingCard from '../../../../components/reactbits/GlowingCard'

const estadoColor: Record<string, string> = {
  completada: '#00D6B2', cancelada: '#E85D5D', no_show: '#E8A064', reagendada: '#F5C518', agendada: '#4A9EF0',
}

export default function PacienteDetalle() {
  const router = useRouter()
  const { id } = useParams()
  const user = useAuthStore(s => s.user)
  const puedeDescargar = ['superadmin', 'admin', 'gerente'].includes(user?.rol || '')
  const [pac, setPac] = useState<any>(null)
  const [citas, setCitas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          api.get(`/pacientes/${id}/`),
          api.get(`/citas/?paciente=${id}`),
        ])
        setPac(pRes.data)
        setCitas(cRes.data.results || cRes.data)
      } catch { useToastStore.getState().error('No se pudo cargar el paciente') }
      finally { setLoading(false) }
    })()
  }, [id])

  const descargar = async () => {
    try {
      const res = await api.get(`/reportes/descargar/?tipo=paciente&id=${id}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a'); a.href = url; a.download = `reporte_paciente_${id}.csv`
      document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url)
    } catch { useToastStore.getState().error('No se pudo descargar') }
  }

  if (loading) return <p style={{ color: 'var(--muted)', padding: 40 }}>Cargando…</p>
  if (!pac) return <p style={{ color: 'var(--muted)', padding: 40 }}>Paciente no encontrado.</p>

  const total = citas.length
  const completadas = citas.filter(c => c.estado === 'completada').length
  const canceladas = citas.filter(c => c.estado === 'cancelada').length
  const ingresos = citas.filter(c => c.estado === 'completada').reduce((a, c) => a + parseFloat(c.ingreso_generado || 0), 0)
  // Médicos asignados (distintos) desde las citas
  const medicosMap = new Map<number, { nombre: string; n: number }>()
  citas.forEach(c => {
    if (c.medico) {
      const cur = medicosMap.get(c.medico) || { nombre: c.medico_nombre || `Médico ${c.medico}`, n: 0 }
      cur.n++; medicosMap.set(c.medico, cur)
    }
  })
  const medicos = [...medicosMap.entries()].sort((a, b) => b[1].n - a[1].n)

  const stat = (k: any, l: string, c = 'var(--text)') => (
    <GlowingCard className="p-5"><p className="font-display" style={{ fontSize: 30, fontWeight: 800, color: c, margin: 0 }}>{k}</p>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{l}</p></GlowingCard>
  )

  return (
    <div>
      <button onClick={() => router.push('/dashboard/pacientes')} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 13, marginBottom: 12 }}>← Pacientes</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#032', fontSize: 20 }}>
          {(pac.nombre || 'P')[0]}{(pac.apellido || '')[0]}
        </div>
        <div style={{ flex: 1 }}>
          <h1 className="font-display" style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{pac.nombre} {pac.apellido}</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>
            {[pac.sede_nombre, pac.email, pac.telefono].filter(Boolean).join(' · ') || 'Sin datos de contacto'}
          </p>
        </div>
        {puedeDescargar && (
          <motion.button onClick={descargar} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '9px 18px', borderRadius: 12, background: 'rgba(176,110,245,0.12)', color: '#B06EF5', border: '1px solid rgba(176,110,245,0.3)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            ↓ Descargar reporte
          </motion.button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 22 }}>
        {stat(total, 'Total citas')}
        {stat(completadas, 'Completadas', '#00D6B2')}
        {stat(canceladas, 'Canceladas', '#E85D5D')}
        {stat(`$${ingresos.toFixed(0)}`, 'Ingresos generados')}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 18 }}>
        <GlowingCard className="p-6">
          <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Médico(s) asignado(s)</h3>
          {medicos.length === 0 ? <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin médico asignado.</p>
            : medicos.map(([mid, m]) => (
              <div key={mid} onClick={() => router.push(`/dashboard/medico/${mid}`)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 12, background: 'var(--sunken)', border: '1px solid var(--border)', marginBottom: 8, cursor: 'pointer' }}>
                <span style={{ fontSize: 13.5, color: 'var(--text)' }}>{m.nombre}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{m.n} citas →</span>
              </div>
            ))}
        </GlowingCard>

        <GlowingCard className="p-6">
          <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Historial de citas ({total})</h3>
          <div style={{ maxHeight: 420, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {citas.slice(0, 60).map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '9px 12px', borderRadius: 10, background: 'var(--sunken)', border: '1px solid var(--border)' }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: 'var(--text)', margin: 0 }}>{c.medico_nombre || 'Médico'}</p>
                  <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>{new Date(c.fecha_hora_agendada).toLocaleString('es')}</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, color: estadoColor[c.estado] || 'var(--muted)', background: `${estadoColor[c.estado] || '#888'}22` }}>{c.estado}</span>
              </div>
            ))}
          </div>
        </GlowingCard>
      </div>
    </div>
  )
}
