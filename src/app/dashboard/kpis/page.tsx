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
import CountUp from '../../../components/reactbits/CountUp'
import FadeContent from '../../../components/reactbits/FadeContent'
import ShinyText from '../../../components/reactbits/ShinyText'

const kpiConfig: Record<string, { label: string; color: string; unit: string }> = {
  tasa_cancelacion:  { label: 'Cancelación',  color: '#E8A0C4', unit: '%' },
  tasa_noshow:       { label: 'No-Show',       color: '#C4B5E8', unit: '%' },
  ingresos_dia:      { label: 'Ingresos',      color: '#A0C4B5', unit: '$' },
  ticket_promedio:   { label: 'Ticket Prom',   color: '#9B8EC4', unit: '$' },
  pacientes_nuevos:  { label: 'Pac. Nuevos',   color: '#7C6FBF', unit: '%' },
  retencion_90:      { label: 'Retención',     color: '#BBA8E8', unit: '%' },
  nps:               { label: 'NPS',           color: '#A8C4A0', unit: ''  },
  citas_reagendadas: { label: 'Reagendadas',   color: '#E8C4A0', unit: '%' },
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

const RefreshIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(28,24,48,0.97)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(155,142,196,0.3)', borderRadius: 14,
        padding: '12px 16px', fontSize: 13,
      }}>
        <p style={{ color: 'var(--muted)', marginBottom: 8, fontSize: 12 }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < payload.length - 1 ? 4 : 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
            <p style={{ color: 'var(--text)', fontWeight: 600 }}>
              {p.name}: <span style={{ color: p.color }}>{p.value}</span>
            </p>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function KPIsPage() {
  const [kpiData, setKpiData] = useState<Record<string, KPIData[]>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [kpiSeleccionado, setKpiSeleccionado] = useState('ingresos_dia')
  const [vista, setVista] = useState<'individual' | 'comparar'>('individual')
  const [horas, setHoras] = useState(2)
  const router = useRouter()
  const { user } = useAuthStore()
  const clinicaId = user?.clinica_id || 1

  useEffect(() => {
    fetchKPIs()
    const interval = setInterval(fetchKPIs, 30000)
    return () => clearInterval(interval)
  }, [clinicaId, horas])

  const fetchKPIs = async (manual = false) => {
    if (manual) setRefreshing(true)
    try {
      const res = await api.get(`/kpis/?clinica=${clinicaId}&horas=${horas}`)
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
        agrupado[key] = agrupado[key].slice(-24)
      })

      setKpiData(agrupado)
    } catch (err) {
      console.error('Error cargando KPIs:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const datosActuales = kpiData[kpiSeleccionado] || []
  const cfg = kpiConfig[kpiSeleccionado]

  const datosComparar = (() => {
    const tiposDisponibles = Object.keys(kpiData).filter(tipo => kpiData[tipo].length > 0)
    if (tiposDisponibles.length === 0) return []
    const maxLen = Math.max(...tiposDisponibles.map(t => kpiData[t].length))
    const result: any[] = []
    for (let i = 0; i < maxLen; i++) {
      const punto: any = {}
      tiposDisponibles.forEach(tipo => {
        const datos = kpiData[tipo]
        const d = datos[i] || datos[datos.length - 1]
        if (d) {
          punto.fecha = d.fecha
          punto[kpiConfig[tipo]?.label || tipo] = d.valor
        }
      })
      if (punto.fecha) result.push(punto)
    }
    return result
  })()

  const ultimoValor = datosActuales.length > 0 ? datosActuales[datosActuales.length - 1].valor : 0
  const primerValor = datosActuales.length > 0 ? datosActuales[0].valor : 0
  const cambio = primerValor !== 0 ? ((ultimoValor - primerValor) / primerValor * 100).toFixed(1) : '0'
  const subiendo = ultimoValor >= primerValor

  return (
    <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: 'var(--void)', position: 'relative', overflow: 'hidden' }}>
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
        <FadeContent direction="down" duration={0.5}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48 }}>
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
                <h1 className="font-display" style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2 }}>
                  <ShinyText text="Análisis de KPIs" speed={4} className="font-display" />
                </h1>
                <p style={{ fontSize: 15, color: 'var(--muted)', marginTop: 4 }}>
                  {user?.clinica_nombre} · Actualización cada 30s
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Selector de rango */}
              <div style={{
                display: 'flex', background: 'var(--glass)', backdropFilter: 'blur(20px)',
                border: '1px solid var(--border)', borderRadius: 14, padding: 4,
              }}>
                {[1, 2, 6, 12].map(h => (
                  <motion.button
                    key={h}
                    onClick={() => setHoras(h)}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      padding: '10px 16px', borderRadius: 11, fontSize: 13, fontWeight: 500,
                      cursor: 'pointer', border: 'none', position: 'relative', overflow: 'hidden',
                      background: 'transparent', color: horas === h ? 'white' : 'var(--muted)',
                    }}
                  >
                    {horas === h && (
                      <motion.div layoutId="horasTab"
                        style={{ position: 'absolute', inset: 0, borderRadius: 11, background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <span style={{ position: 'relative', zIndex: 1 }}>{h}h</span>
                  </motion.button>
                ))}
              </div>

              {/* Vista toggle */}
              <div style={{
                display: 'flex', background: 'var(--glass)', backdropFilter: 'blur(20px)',
                border: '1px solid var(--border)', borderRadius: 14, padding: 4,
              }}>
                {(['individual', 'comparar'] as const).map(v => (
                  <motion.button
                    key={v}
                    onClick={() => setVista(v)}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      padding: '10px 18px', borderRadius: 11, fontSize: 14, fontWeight: 500,
                      cursor: 'pointer', border: 'none', position: 'relative', overflow: 'hidden',
                      background: 'transparent', color: vista === v ? 'white' : 'var(--muted)',
                    }}
                  >
                    {vista === v && (
                      <motion.div layoutId="vistaTab"
                        style={{ position: 'absolute', inset: 0, borderRadius: 11, background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <span style={{ position: 'relative', zIndex: 1 }}>
                      {v === 'individual' ? 'Individual' : 'Comparar todo'}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Refresh manual */}
              <motion.button
                onClick={() => fetchKPIs(true)}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                style={{
                  width: 48, height: 48, borderRadius: 14, background: 'var(--glass)',
                  backdropFilter: 'blur(20px)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--text)',
                }}
              >
                <motion.div animate={refreshing ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: 'linear' }}>
                  <RefreshIcon />
                </motion.div>
              </motion.button>

              <ThemeToggle />
            </div>
          </div>
        </FadeContent>

        {/* KPI SELECTOR */}
        <FadeContent direction="up" delay={0.1} duration={0.4}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
            {Object.entries(kpiConfig).map(([tipo, cfg]) => {
              const datos = kpiData[tipo] || []
              const ultimo = datos.length > 0 ? datos[datos.length - 1].valor : null
              const penultimo = datos.length > 1 ? datos[datos.length - 2].valor : null
              const isSelected = kpiSeleccionado === tipo
              const trending = ultimo !== null && penultimo !== null ? ultimo >= penultimo : null

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
                    backdropFilter: 'blur(20px)', borderWidth: 1, borderStyle: 'solid',
                    borderColor: isSelected ? cfg.color : 'var(--border)',
                    color: isSelected ? 'white' : 'var(--muted)',
                    transition: 'all 0.2s',
                    boxShadow: isSelected ? `0 4px 20px ${cfg.color}40` : 'none',
                  }}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="kpiSelected"
                      style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${cfg.color}CC, ${cfg.color}88)` }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {cfg.label}
                    {ultimo !== null && (
                      <span style={{ opacity: 0.85, fontSize: 13 }}>
                        {cfg.unit}{ultimo}
                      </span>
                    )}
                    {trending !== null && (
                      <span style={{ fontSize: 11, color: isSelected ? 'rgba(255,255,255,0.8)' : trending ? '#A0C4B5' : '#E8A0C4' }}>
                        {trending ? '↑' : '↓'}
                      </span>
                    )}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </FadeContent>

        {vista === 'individual' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>

            {/* GRÁFICA PRINCIPAL */}
            <FadeContent direction="up" delay={0.2} duration={0.4}>
              <GlowingCard className="p-8">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
                  <div>
                    <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                      {cfg?.label}
                    </h2>
                    <p style={{ fontSize: 14, color: 'var(--muted)' }}>
                      Últimas {horas}h · {datosActuales.length} registros
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="font-display" style={{ fontSize: 42, fontWeight: 800, color: cfg?.color, lineHeight: 1 }}>
                      {cfg?.unit}<CountUp to={ultimoValor} decimals={1} duration={1} />
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 500, marginTop: 6, color: subiendo ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                      <span>{subiendo ? '↑' : '↓'}</span>
                      <span>{Math.abs(Number(cambio))}% vs inicio</span>
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
                  </div>
                ) : datosActuales.length === 0 ? (
                  <div style={{ height: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <p style={{ color: 'var(--muted)', fontSize: 15 }}>Sin datos en este rango de tiempo.</p>
                    <p style={{ color: 'var(--muted)', fontSize: 13 }}>Prueba con un rango mayor o espera el próximo ciclo.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={datosActuales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorKpi" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={cfg?.color} stopOpacity={0.35}/>
                          <stop offset="95%" stopColor={cfg?.color} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(155,142,196,0.08)" />
                      <XAxis dataKey="fecha" stroke="var(--muted)" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                      <YAxis stroke="var(--muted)" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone" dataKey="valor" name={cfg?.label}
                        stroke={cfg?.color} strokeWidth={2.5}
                        fill="url(#colorKpi)" dot={false}
                        activeDot={{ r: 6, fill: cfg?.color, stroke: 'var(--void)', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </GlowingCard>
            </FadeContent>

            {/* SIDEBAR STATS */}
            <FadeContent direction="right" delay={0.3} duration={0.4}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Object.entries(kpiConfig).map(([tipo, c], i) => {
                  const datos = kpiData[tipo] || []
                  const ultimo = datos.length > 0 ? datos[datos.length - 1].valor : 0
                  const penultimo = datos.length > 1 ? datos[datos.length - 2].valor : 0
                  const diff = penultimo !== 0 ? ((ultimo - penultimo) / penultimo * 100).toFixed(1) : '0'
                  const up = ultimo >= penultimo
                  const isSelected = kpiSeleccionado === tipo

                  return (
                    <motion.div
                      key={tipo}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      onClick={() => setKpiSeleccionado(tipo)}
                      whileHover={{ scale: 1.02 }}
                      style={{
                        padding: '16px 18px', borderRadius: 18, cursor: 'pointer',
                        background: isSelected ? `${c.color}15` : 'var(--glass)',
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${isSelected ? c.color + '40' : 'var(--border)'}`,
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{c.label}</p>
                        <p style={{ fontSize: 12, color: up ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                          {up ? '↑' : '↓'}{Math.abs(Number(diff))}%
                        </p>
                      </div>
                      <p className="font-display" style={{ fontSize: 22, fontWeight: 700, color: c.color }}>
                        {c.unit}<CountUp to={ultimo} decimals={1} duration={0.8} />
                      </p>
                      <div style={{ marginTop: 8, height: 2, borderRadius: 2, background: `${c.color}20` }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (ultimo / (c.unit === '$' ? 800 : 100)) * 100)}%` }}
                          transition={{ duration: 1, delay: i * 0.05 }}
                          style={{ height: '100%', borderRadius: 2, background: c.color }}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </FadeContent>
          </div>
        ) : (
          /* VISTA COMPARAR */
          <FadeContent direction="up" delay={0.2} duration={0.4}>
            <GlowingCard className="p-8">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
                  Comparativa de todos los KPIs
                </h2>
                <span style={{ fontSize: 14, color: 'var(--muted)' }}>Últimas {horas}h</span>
              </div>
              {datosComparar.length === 0 ? (
                <div style={{ height: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                  <p style={{ color: 'var(--muted)', fontSize: 15 }}>Sin datos en este rango.</p>
                  <p style={{ color: 'var(--muted)', fontSize: 13 }}>Prueba aumentando el rango de horas.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={420}>
                  <LineChart data={datosComparar} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(155,142,196,0.08)" />
                    <XAxis dataKey="fecha" stroke="var(--muted)" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                    <YAxis stroke="var(--muted)" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: 'var(--muted)', fontSize: 13, paddingTop: 16 }} />
                    {Object.entries(kpiConfig)
                      .filter(([tipo]) => kpiData[tipo]?.length > 0)
                      .map(([tipo, cfg]) => (
                        <Line
                          key={tipo}
                          type="monotone"
                          dataKey={cfg.label}
                          stroke={cfg.color}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, fill: cfg.color, stroke: 'var(--void)', strokeWidth: 2 }}
                        />
                      ))
                    }
                  </LineChart>
                </ResponsiveContainer>
              )}
            </GlowingCard>
          </FadeContent>
        )}
      </div>
    </div>
  )
}