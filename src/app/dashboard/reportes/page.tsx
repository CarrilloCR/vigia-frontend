'use client'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import api from '../../../lib/axios'
import { useAuthStore } from '../../../store/auth'
import { useToastStore } from '../../../store/toast'
import GlowingCard from '../../../components/reactbits/GlowingCard'
import CountUp from '../../../components/reactbits/CountUp'
import FadeContent from '../../../components/reactbits/FadeContent'
import SedeSelector from '../../../components/ui/SedeSelector'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(18,14,36,0.97)',
      border: '1px solid rgba(155,142,196,0.3)',
      borderRadius: 12,
      padding: '10px 14px',
      fontSize: 12,
    }}>
      <p style={{ color: 'var(--muted)', marginBottom: 6 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.fill, marginTop: 2, flexShrink: 0 }} />
          <span style={{ color: 'var(--text)' }}>{p.name}: <strong style={{ color: p.fill }}>{p.value}</strong></span>
        </div>
      ))}
    </div>
  )
}

const PrintIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="6 9 6 2 18 2 18 9"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
)
const DownloadIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)

export default function ReportesPage() {
  const { user } = useAuthStore()
  const toast = useToastStore()
  const clinicaId = user?.clinica_id || 1
  const [selectedSede, setSelectedSede] = useState<number | null>(null)

  const [rango, setRango] = useState<7 | 30 | 90>(30)
  const [alertas, setAlertas] = useState<any[]>([])
  const [medicos, setMedicos] = useState<any[]>([])
  const [kpiData, setKpiData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const sedeParam = selectedSede ? `&sede=${selectedSede}` : ''
    Promise.all([
      api.get(`/alertas/?clinica=${clinicaId}&dias=${rango}${sedeParam}`).catch(() => ({ data: [] })),
      api.get(`/medicos/?clinica=${clinicaId}`).catch(() => ({ data: [] })),
      api.get(`/kpis/?clinica=${clinicaId}&horas=${rango * 24}${sedeParam}`).catch(() => ({ data: [] })),
    ]).then(([alertasRes, medicosRes, kpiRes]) => {
      setAlertas(alertasRes.data.results || alertasRes.data || [])
      setMedicos(medicosRes.data.results || medicosRes.data || [])
      setKpiData(kpiRes.data.results || kpiRes.data || [])
    }).catch(() => {
      toast.error('Error al cargar datos del reporte')
    }).finally(() => setLoading(false))
  }, [rango, clinicaId, selectedSede])

  const stats = useMemo(() => ({
    total: alertas.length,
    resueltas: alertas.filter(a => a.estado === 'resuelta' || a.estado === 'revisada').length,
    porcentajeResueltas: alertas.length > 0
      ? Math.round((alertas.filter(a => a.estado !== 'activa').length / alertas.length) * 100)
      : 0,
    criticas: alertas.filter(a => a.severidad === 'critica').length,
    kpiMasProblematico: (() => {
      const counts: Record<string, number> = {}
      alertas.forEach(a => counts[a.tipo_kpi] = (counts[a.tipo_kpi] || 0) + 1)
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
      return top ? { kpi: top[0].replace(/_/g, ' '), count: top[1] } : null
    })(),
  }), [alertas])

  const alertasPorDia = useMemo(() => {
    const map: Record<string, Record<string, number>> = {}
    alertas.forEach(a => {
      const dia = new Date(a.creada_en).toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit' })
      if (!map[dia]) map[dia] = { baja: 0, media: 0, alta: 0, critica: 0 }
      map[dia][a.severidad] = (map[dia][a.severidad] || 0) + 1
    })
    return Object.entries(map)
      .slice(-14)
      .map(([fecha, vals]) => ({ fecha, ...vals }))
  }, [alertas])

  const rankingMedicos = useMemo(() => {
    const counts: Record<number, number> = {}
    alertas.forEach(a => { if (a.medico) counts[a.medico] = (counts[a.medico] || 0) + 1 })
    return medicos
      .map(m => ({ ...m, alertas: counts[m.id] || 0 }))
      .sort((a, b) => b.alertas - a.alertas)
      .slice(0, 5)
  }, [alertas, medicos])

  const kpiPorTipo = useMemo(() => {
    const grouped: Record<string, number[]> = {}
    kpiData.forEach((k: any) => {
      if (!grouped[k.tipo]) grouped[k.tipo] = []
      grouped[k.tipo].push(k.valor)
    })
    return Object.entries(grouped).map(([tipo, valores]) => ({
      tipo: tipo.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      promedio: Math.round((valores.reduce((a, b) => a + b, 0) / valores.length) * 100) / 100,
      ultimo: valores[valores.length - 1],
      variacion: valores.length > 1
        ? ((valores[valores.length - 1] - valores[0]) / valores[0] * 100).toFixed(1)
        : '0',
    }))
  }, [kpiData])

  const maxAlertas = rankingMedicos.length > 0 ? Math.max(...rankingMedicos.map(m => m.alertas), 1) : 1

  const exportarCSV = () => {
    const filas = [
      ['Fecha', 'KPI', 'Severidad', 'Estado', 'Valor detectado', 'Valor esperado', 'Desviación %', 'Método', 'Mensaje'],
      ...alertas.map(a => [
        new Date(a.creada_en).toLocaleString('es-CR'),
        a.tipo_kpi.replace(/_/g, ' '),
        a.severidad,
        a.estado,
        a.valor_detectado,
        a.valor_esperado,
        a.desviacion,
        a.metodo_deteccion,
        `"${(a.mensaje || '').replace(/"/g, '""')}"`,
      ])
    ]
    const csv = filas.map(r => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vigia-alertas-${rango}d-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <style>{`
        @media print {
          nav, header, [data-no-print] { display: none !important; }
          body { background: white !important; color: black !important; }
          [data-print-area] { padding: 0 !important; }
        }
      `}</style>

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}
        data-no-print
      >
        <div>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
            Reportes
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
            Análisis de alertas y rendimiento clínico
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SedeSelector clinicaId={clinicaId} value={selectedSede} onChange={setSelectedSede} compact />
          {/* Rango selector */}
          <div style={{ display: 'flex', gap: 6 }}>
            {([7, 30, 90] as const).map(d => (
              <motion.button
                key={d}
                onClick={() => setRango(d)}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                style={{
                  padding: '9px 18px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', border: 'none',
                  background: rango === d ? 'rgba(155,142,196,0.15)' : 'var(--glass)',
                  backdropFilter: 'blur(20px)',
                  borderWidth: 1, borderStyle: 'solid',
                  borderColor: rango === d ? 'var(--primary)' : 'var(--border)',
                  color: rango === d ? 'var(--primary)' : 'var(--muted)',
                  transition: 'all 0.2s',
                }}
              >
                {d}d
              </motion.button>
            ))}
          </div>
          {/* Exportar CSV */}
          <motion.button
            onClick={exportarCSV}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px',
              borderRadius: 12, fontSize: 13, fontWeight: 600,
              background: 'rgba(160,196,181,0.1)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(160,196,181,0.3)', color: '#A0C4B5', cursor: 'pointer',
            }}
          >
            <DownloadIcon /> Exportar CSV
          </motion.button>
          {/* Imprimir */}
          <motion.button
            onClick={() => window.print()}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px',
              borderRadius: 12, fontSize: 13, fontWeight: 500,
              background: 'var(--glass)', backdropFilter: 'blur(20px)',
              border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer',
            }}
          >
            <PrintIcon /> Imprimir
          </motion.button>
        </div>
      </motion.div>

      <div data-print-area>
        {/* STATS CARDS */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 36 }}>
            {[1,2,3,4].map(i => (
              <motion.div key={i} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                style={{ height: 120, borderRadius: 24, background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : (
          <FadeContent>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 36 }}>
              {/* Total */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
                style={{ padding: '28px', borderRadius: 24, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)' }}>
                <p className="font-display" style={{ fontSize: 48, fontWeight: 800, color: '#9B8EC4', lineHeight: 1, marginBottom: 10 }}>
                  <CountUp to={stats.total} />
                </p>
                <p style={{ fontSize: 15, color: 'var(--muted)', fontWeight: 500 }}>Total alertas</p>
              </motion.div>
              {/* % Resueltas */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                style={{ padding: '28px', borderRadius: 24, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)' }}>
                <p className="font-display" style={{ fontSize: 48, fontWeight: 800, color: '#A0C4B5', lineHeight: 1, marginBottom: 10 }}>
                  <CountUp to={stats.porcentajeResueltas} />%
                </p>
                <p style={{ fontSize: 15, color: 'var(--muted)', fontWeight: 500 }}>Resueltas</p>
              </motion.div>
              {/* Críticas */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
                style={{ padding: '28px', borderRadius: 24, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)' }}>
                <p className="font-display" style={{ fontSize: 48, fontWeight: 800, color: '#E8A0C4', lineHeight: 1, marginBottom: 10 }}>
                  <CountUp to={stats.criticas} />
                </p>
                <p style={{ fontSize: 15, color: 'var(--muted)', fontWeight: 500 }}>Críticas</p>
              </motion.div>
              {/* KPI más problemático */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
                style={{ padding: '28px', borderRadius: 24, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)' }}>
                <p className="font-display" style={{ fontSize: 22, fontWeight: 800, color: '#C4B5E8', lineHeight: 1.2, marginBottom: 10, textTransform: 'capitalize' }}>
                  {stats.kpiMasProblematico?.kpi || '—'}
                </p>
                <p style={{ fontSize: 15, color: 'var(--muted)', fontWeight: 500 }}>KPI crítico</p>
                {stats.kpiMasProblematico && (
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{stats.kpiMasProblematico.count} alertas</p>
                )}
              </motion.div>
            </div>
          </FadeContent>
        )}

        {/* BAR CHART: Alertas por día */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ marginBottom: 36 }}>
          <GlowingCard className="p-6 sm:p-8 lg:p-10">
            <h2 className="font-display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>
              Alertas por día
            </h2>
            {alertasPorDia.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <p style={{ fontSize: 14, color: 'var(--muted)' }}>Sin datos para el período seleccionado</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={alertasPorDia} margin={{ top: 0, right: 0, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="fecha" tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: 'var(--muted)' }} />
                  <Bar dataKey="baja" name="Baja" stackId="a" fill="#A0C4B5" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="media" name="Media" stackId="a" fill="#C4B5E8" />
                  <Bar dataKey="alta" name="Alta" stackId="a" fill="#9B8EC4" />
                  <Bar dataKey="critica" name="Crítica" stackId="a" fill="#E8A0C4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </GlowingCard>
        </motion.div>

        {/* GRID: Ranking médicos + KPIs tabla */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 36 }}
        >
          {/* Ranking médicos */}
          <GlowingCard className="p-6 sm:p-8 lg:p-10">
            <h2 className="font-display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>
              Top médicos por alertas
            </h2>
            {rankingMedicos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <p style={{ fontSize: 14, color: 'var(--muted)' }}>Sin datos</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {rankingMedicos.map((m, i) => (
                  <div key={m.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', width: 20 }}>#{i + 1}</span>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700 }}>
                          {(m.nombre || m.user?.nombre || 'M')[0].toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>
                            {m.nombre || m.user?.nombre || `Dr. #${m.id}`}
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--muted)' }}>{m.especialidad || ''}</p>
                        </div>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#9B8EC4' }}>{m.alertas}</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 4, background: 'rgba(155,142,196,0.12)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(m.alertas / maxAlertas) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, var(--primary), var(--accent))' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlowingCard>

          {/* KPIs tabla */}
          <GlowingCard className="p-6 sm:p-8 lg:p-10">
            <h2 className="font-display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>
              KPIs — resumen
            </h2>
            {kpiPorTipo.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <p style={{ fontSize: 14, color: 'var(--muted)' }}>Sin datos de KPI</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {/* Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>KPI</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Promedio</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right', minWidth: 60 }}>Variación</p>
                </div>
                {kpiPorTipo.map((k, i) => {
                  const variacion = parseFloat(k.variacion)
                  const isPositive = variacion >= 0
                  return (
                    <motion.div
                      key={k.tipo}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16,
                        padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                        alignItems: 'center',
                      }}
                    >
                      <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{k.tipo}</p>
                      <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600, textAlign: 'right' }}>{k.promedio}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', minWidth: 60 }}>
                        <svg width="12" height="12" fill="none" stroke={isPositive ? 'var(--success)' : 'var(--danger)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          {isPositive
                            ? <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></>
                            : <><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></>
                          }
                        </svg>
                        <span style={{ fontSize: 13, fontWeight: 600, color: isPositive ? 'var(--success)' : 'var(--danger)' }}>
                          {Math.abs(variacion)}%
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </GlowingCard>
        </motion.div>
      </div>
    </>
  )
}
