'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Legend
} from 'recharts'
import api from '../../../lib/axios'
import { useAuthStore } from '../../../store/auth'
import Aurora from '../../../components/reactbits/Aurora'
import GlowingCard from '../../../components/reactbits/GlowingCard'
import ThemeToggle from '../../../components/ui/ThemeToggle'

const kpiConfig: Record<string, { label: string; color: string; unit: string }> = {
  tasa_cancelacion: { label: 'Cancelación', color: '#E8A0C4', unit: '%' },
  tasa_noshow:      { label: 'No-Show',     color: '#C4B5E8', unit: '%' },
  ingresos_dia:     { label: 'Ingresos',    color: '#A0C4B5', unit: '$' },
  ticket_promedio:  { label: 'Ticket Prom', color: '#9B8EC4', unit: '$' },
  pacientes_nuevos: { label: 'Pac. Nuevos', color: '#7C6FBF', unit: '%' },
  retencion_90:     { label: 'Retención',   color: '#C4B5E8', unit: '%' },
  nps:              { label: 'NPS',         color: '#A0C4B5', unit: '' },
  citas_reagendadas:{ label: 'Reagendadas', color: '#E8A0C4', unit: '%' },
}

interface KPIData {
  fecha: string
  valor: number
  tipo: string
}

const ArrowLeftIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(28,24,48,0.95)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(155,142,196,0.3)', borderRadius: 12,
        padding: '10px 14px', fontSize: 13,
      }}>
        <p style={{ color: 'var(--muted)', marginBottom: 6 }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function KPIsPage() {
  const [kpiData, setKpiData] = useState<Record<string, KPIData[]>>({})
  const [loading, setLoading] = useState(true)
  const [kpiSeleccionado, setKpiSeleccionado] = useState('ingresos_dia')
  const [vista, setVista] = useState<'individual' | 'comparar'>('individual')
  const router = useRouter()
  const { user } = useAuthStore()
  const clinicaId = user?.clinica_id || 1

  useEffect(() => {
    fetchKPIs()
    const interval = setInterval(fetchKPIs, 30000)
    return () => clearInterval(interval)
  }, [clinicaId])

  const fetchKPIs = async () => {
    try {
      const res = await api.get(`/kpis/?clinica=${clinicaId}`)
      const data = res.data.results || res.data

      const agrupado: Record<string, KPIData[]> = {}
      data.forEach((kpi: any) => {
        if (!agrupado[kpi.tipo]) agrupado[kpi.tipo] = []
        agrupado[kpi.tipo].push({
          fecha: new Date(kpi.fecha_hora).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
          valor: Math.round(kpi.valor * 100) / 100,
          tipo: kpi.tipo,
        })
      })

      Object.keys(agrupado).forEach(key => {
        agrupado[key] = agrupado[key].slice(-20)
      })

      setKpiData(agrupado)
    } catch (err) {
      console.error('Error cargando KPIs:', err)
    } finally {
      setLoading(false)
    }
  }

  const datosActuales = kpiData[kpiSeleccionado] || []
  const cfg = kpiConfig[kpiSeleccionado]

  const datosComparar = Object.entries(kpiData)
    .filter(([tipo]) => ['tasa_cancelacion', 'tasa_noshow', 'pacientes_nuevos'].includes(tipo))
    .reduce((acc, [tipo, datos]) => {
      datos.forEach((d, i) => {
        if (!acc[i]) acc[i] = { fecha: d.fecha }
        acc[i][kpiConfig[tipo]?.label || tipo] = d.valor
      })
      return acc
    }, [] as any[])

  const ultimoValor = datosActuales.length > 0 ? datosActuales[datosActuales.length - 1].valor : 0
  const primerValor = datosActuales.length > 0 ? datosActuales[0].valor : 0
  const cambio = primerValor !== 0 ? ((ultimoValor - primerValor) / primerValor * 100).toFixed(1) : 0
  const subiendo = ultimoValor >= primerValor

  return (
    <div style={{
      width: '100vw', minHeight: '100vh',
      backgroundColor: 'var(--void)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <Aurora colorStops={['#9B8EC4', '#7C6FBF', '#C4B5E8']} amplitude={0.4} speed={0.1} />
      </div>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <div style={{ position: 'relative', zIndex: 10, padding: '32px 48px', maxWidth: 1600, margin: '0 auto' }}>

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <motion.button
              onClick={() => router.push('/dashboard')}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{
                width: 48, height: 48, borderRadius: 14, background: 'var(--glass)',
                backdropFilter: 'blur(20px)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text)',
              }}
            >
              <ArrowLeftIcon />
            </motion.button>
            <div>
              <h1 className="font-display" style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
                Análisis de KPIs
              </h1>
              <p style={{ fontSize: 15, color: 'var(--muted)', marginTop: 4 }}>
                {user?.clinica_nombre} · Actualización cada 30s
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Vista toggle */}
            <div style={{
              display: 'flex', background: 'var(--glass)', backdropFilter: 'blur(20px)',
              border: '1px solid var(--border)', borderRadius: 14, padding: 4,
            }}>
              {(['individual', 'comparar'] as const).map(v => (
                <motion.button
                  key={v}
                  onClick={() => setVista(v)}
                  style={{
                    padding: '10px 20px', borderRadius: 11, fontSize: 14, fontWeight: 500,
                    cursor: 'pointer', border: 'none', position: 'relative', overflow: 'hidden',
                    background: 'transparent', color: vista === v ? 'white' : 'var(--muted)',
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  {vista === v && (
                    <motion.div
                      layoutId="vistaTab"
                      style={{
                        position: 'absolute', inset: 0, borderRadius: 11,
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                      }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span style={{ position: 'relative', zIndex: 1 }}>
                    {v === 'individual' ? 'Individual' : 'Comparar'}
                  </span>
                </motion.button>
              ))}
            </div>
            <ThemeToggle />
          </div>
        </motion.div>

        {/* KPI SELECTOR */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}
        >
          {Object.entries(kpiConfig).map(([tipo, cfg]) => {
            const datos = kpiData[tipo] || []
            const ultimo = datos.length > 0 ? datos[datos.length - 1].valor : null
            const isSelected = kpiSeleccionado === tipo

            return (
              <motion.button
                key={tipo}
                onClick={() => setKpiSeleccionado(tipo)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '12px 20px', borderRadius: 14, fontSize: 14, fontWeight: 500,
                  cursor: 'pointer', border: 'none', position: 'relative', overflow: 'hidden',
                  background: isSelected ? 'transparent' : 'var(--glass)',
                  backdropFilter: 'blur(20px)',
                  borderWidth: 1, borderStyle: 'solid',
                  borderColor: isSelected ? cfg.color : 'var(--border)',
                  color: isSelected ? 'white' : 'var(--muted)',
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? `0 4px 20px ${cfg.color}40` : 'none',
                }}
              >
                {isSelected && (
                  <motion.div
                    layoutId="kpiSelected"
                    style={{
                      position: 'absolute', inset: 0,
                      background: `linear-gradient(135deg, ${cfg.color}CC, ${cfg.color}88)`,
                    }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>
                  {cfg.label}
                  {ultimo !== null && (
                    <span style={{ marginLeft: 8, opacity: 0.8 }}>
                      {cfg.unit}{ultimo}
                    </span>
                  )}
                </span>
              </motion.button>
            )
          })}
        </motion.div>

        {vista === 'individual' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>

            {/* GRÁFICA PRINCIPAL */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <GlowingCard className="p-8">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                  <div>
                    <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
                      {cfg?.label}
                    </h2>
                    <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
                      Últimos 20 registros
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="font-display" style={{ fontSize: 36, fontWeight: 800, color: cfg?.color, lineHeight: 1 }}>
                      {cfg?.unit}{ultimoValor}
                    </p>
                    <p style={{
                      fontSize: 14, fontWeight: 500, marginTop: 4,
                      color: subiendo ? 'var(--success)' : 'var(--danger)',
                    }}>
                      {subiendo ? '↑' : '↓'} {Math.abs(Number(cambio))}%
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}
                    />
                  </div>
                ) : datosActuales.length === 0 ? (
                  <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: 'var(--muted)', fontSize: 15 }}>Sin datos aún. Ejecuta el análisis.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={datosActuales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorKpi" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={cfg?.color} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={cfg?.color} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(155,142,196,0.1)" />
                      <XAxis dataKey="fecha" stroke="var(--muted)" tick={{ fontSize: 12 }} />
                      <YAxis stroke="var(--muted)" tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone" dataKey="valor" name={cfg?.label}
                        stroke={cfg?.color} strokeWidth={2.5}
                        fill="url(#colorKpi)" dot={false}
                        activeDot={{ r: 5, fill: cfg?.color }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </GlowingCard>
            </motion.div>

            {/* STATS SIDEBAR */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {Object.entries(kpiConfig).map(([tipo, c], i) => {
                const datos = kpiData[tipo] || []
                const ultimo = datos.length > 0 ? datos[datos.length - 1].valor : 0
                const penultimo = datos.length > 1 ? datos[datos.length - 2].valor : 0
                const diff = penultimo !== 0 ? ((ultimo - penultimo) / penultimo * 100).toFixed(1) : '0'
                const up = ultimo >= penultimo

                return (
                  <motion.div
                    key={tipo}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setKpiSeleccionado(tipo)}
                    style={{
                      padding: '16px 20px', borderRadius: 18, cursor: 'pointer',
                      background: kpiSeleccionado === tipo ? `${c.color}15` : 'var(--glass)',
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${kpiSeleccionado === tipo ? c.color + '40' : 'var(--border)'}`,
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>{c.label}</p>
                      <p style={{ fontSize: 12, color: up ? 'var(--success)' : 'var(--danger)', fontWeight: 500 }}>
                        {up ? '↑' : '↓'}{Math.abs(Number(diff))}%
                      </p>
                    </div>
                    <p className="font-display" style={{ fontSize: 24, fontWeight: 700, color: c.color, marginTop: 6 }}>
                      {c.unit}{ultimo}
                    </p>
                    {/* Mini sparkline */}
                    <div style={{ marginTop: 10, height: 2, borderRadius: 2, background: `${c.color}20` }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Math.abs(ultimo))}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                        style={{ height: '100%', borderRadius: 2, background: c.color }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ) : (
          /* VISTA COMPARAR */
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <GlowingCard className="p-8">
              <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 28 }}>
                Comparativa de KPIs
              </h2>
              {datosComparar.length === 0 ? (
                <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ color: 'var(--muted)', fontSize: 15 }}>Sin datos aún.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={datosComparar} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(155,142,196,0.1)" />
                    <XAxis dataKey="fecha" stroke="var(--muted)" tick={{ fontSize: 12 }} />
                    <YAxis stroke="var(--muted)" tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: 'var(--muted)', fontSize: 13 }} />
                    {['Cancelación', 'No-Show', 'Pac. Nuevos'].map((nombre, i) => (
                      <Line
                        key={nombre}
                        type="monotone"
                        dataKey={nombre}
                        stroke={['#E8A0C4', '#C4B5E8', '#7C6FBF'][i]}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </GlowingCard>
          </motion.div>
        )}
      </div>
    </div>
  )
}