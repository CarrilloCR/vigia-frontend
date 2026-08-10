'use client'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../lib/axios'
import GlowingCard from './reactbits/GlowingCard'

/**
 * Espejo en vivo del sistema HIS conectado, dentro de Vigía (solo lectura).
 * Reemplaza al generador cuando hay una integración HIS activa: muestra los
 * datos reales sincronizados actualizándose en tiempo real (polling).
 */
type Resumen = {
  conectado: boolean
  fuente: string | null
  ultima_sync: string | null
  totales: { citas: number; medicos: number; pacientes: number; sedes: number }
  citas_hoy: number
  ingresos_hoy: number
  por_estado: Record<string, number>
  top_medicos: { nombre: string; n: number }[]
  recientes: { fecha: string; paciente: string; medico: string; estado: string; ingreso: number }[]
}

const ESTADO_COLOR: Record<string, string> = {
  completada: '#00D6B2', cancelada: '#E85D5D', no_show: '#E8A064', reagendada: '#F5C518', agendada: '#4A9EF0',
}

export default function HisMirror({ clinicaId }: { clinicaId: number }) {
  const [data, setData] = useState<Resumen | null>(null)
  const prevCitas = useRef<number | null>(null)
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    let vivo = true
    const cargar = async () => {
      try {
        const res = await api.get(`/his/resumen/?clinica=${clinicaId}`)
        if (!vivo) return
        if (prevCitas.current !== null && res.data.totales.citas > prevCitas.current) {
          setPulse(true); setTimeout(() => setPulse(false), 1200)
        }
        prevCitas.current = res.data.totales.citas
        setData(res.data)
      } catch { /* silencio */ }
    }
    cargar()
    const id = setInterval(cargar, 5000)  // tiempo real: refresca cada 5s
    return () => { vivo = false; clearInterval(id) }
  }, [clinicaId])

  if (!data) return <div style={{ color: 'var(--muted)', padding: 40, textAlign: 'center' }}>Cargando datos del HIS…</div>

  const totalHoy = Object.values(data.por_estado).reduce((a, b) => a + b, 0) || 1

  const stat = (k: string | number, l: string) => (
    <GlowingCard className="p-5">
      <p className="font-display" style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-1px' }}>{k}</p>
      <p style={{ fontSize: 11.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{l}</p>
    </GlowingCard>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <motion.span animate={{ scale: pulse ? [1, 1.6, 1] : 1, opacity: pulse ? [1, 0.5, 1] : 1 }} transition={{ duration: 0.6 }}
              style={{ width: 10, height: 10, borderRadius: '50%', background: '#00D6B2', boxShadow: '0 0 10px #00D6B2' }} />
            <h2 className="font-display" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Sistema HIS · en vivo</h2>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            Espejo de <strong style={{ color: 'var(--primary)' }}>{data.fuente || 'tu sistema externo'}</strong> · datos reales sincronizados · se actualiza cada 5s
          </p>
        </div>
        <span style={{ fontSize: 12, padding: '5px 14px', borderRadius: 20, background: 'rgba(0,214,178,0.12)', color: 'var(--primary)', border: '1px solid rgba(0,214,178,0.25)' }}>
          Solo lectura
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 20 }}>
        {stat(data.citas_hoy, 'Citas hoy')}
        {stat(`$${data.ingresos_hoy.toLocaleString()}`, 'Ingresos hoy')}
        {stat(data.totales.pacientes, 'Pacientes')}
        {stat(data.totales.medicos, 'Médicos')}
        {stat(data.totales.citas.toLocaleString(), 'Citas totales')}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
        {/* Estado + recientes */}
        <GlowingCard className="p-6">
          <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Actividad de hoy por estado</h3>
          {Object.entries(data.por_estado).map(([est, n]) => (
            <div key={est} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
              <span style={{ fontSize: 11, fontWeight: 700, width: 92, color: ESTADO_COLOR[est] || 'var(--muted)' }}>{est}</span>
              <div style={{ flex: 1, height: 8, borderRadius: 5, background: 'var(--sunken)', overflow: 'hidden' }}>
                <motion.div animate={{ width: `${(n / totalHoy) * 100}%` }} transition={{ duration: 0.5 }}
                  style={{ height: '100%', borderRadius: 5, background: ESTADO_COLOR[est] || 'var(--primary)' }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', width: 34, textAlign: 'right' }}>{n}</span>
            </div>
          ))}
          <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '22px 0 12px' }}>Últimas citas</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead><tr style={{ color: 'var(--muted)', textAlign: 'left' }}>
                <th style={{ padding: '6px 6px', fontWeight: 600 }}>Fecha</th><th style={{ fontWeight: 600 }}>Paciente</th>
                <th style={{ fontWeight: 600 }}>Médico</th><th style={{ fontWeight: 600 }}>Estado</th><th style={{ fontWeight: 600, textAlign: 'right' }}>$</th>
              </tr></thead>
              <tbody>
                {data.recientes.map((c, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '7px 6px', color: 'var(--muted)' }}>{c.fecha}</td>
                    <td style={{ color: 'var(--text)' }}>{c.paciente}</td>
                    <td style={{ color: 'var(--muted)' }}>{c.medico}</td>
                    <td><span style={{ fontSize: 11, fontWeight: 700, color: ESTADO_COLOR[c.estado] || 'var(--muted)' }}>{c.estado}</span></td>
                    <td style={{ textAlign: 'right', color: 'var(--text)' }}>${c.ingreso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlowingCard>

        {/* Top médicos */}
        <GlowingCard className="p-6">
          <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Médicos con más citas hoy</h3>
          {data.top_medicos.map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{m.nombre}</span>
              <div style={{ flex: 1, height: 8, borderRadius: 5, background: 'var(--sunken)', overflow: 'hidden' }}>
                <motion.div animate={{ width: `${(m.n / (data.top_medicos[0]?.n || 1)) * 100}%` }} transition={{ duration: 0.5 }}
                  style={{ height: '100%', borderRadius: 5, background: 'linear-gradient(90deg, var(--primary), var(--accent))' }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', width: 28, textAlign: 'right' }}>{m.n}</span>
            </div>
          ))}
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 18, lineHeight: 1.6 }}>
            {data.totales.sedes} sede(s) · {data.ultima_sync ? `última sync ${new Date(data.ultima_sync).toLocaleTimeString('es')}` : 'sincronizando…'}
          </p>
        </GlowingCard>
      </div>
    </div>
  )
}
