'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Legend,
  ReferenceLine, ReferenceArea, ReferenceDot
} from 'recharts'
import api from '../../../lib/axios'
import { Alerta } from '../../../types'
import { useAuthStore } from '../../../store/auth'
import { useToastStore } from '../../../store/toast'
import { useKpiPipStore } from '../../../store/kpiPip'
import GlowingCard from '../../../components/reactbits/GlowingCard'
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

// Umbrales de referencia por KPI — valores encima (o debajo para positivos) indican zona de peligro
const kpiUmbrales: Record<string, { umbral: number; direccion: 'arriba' | 'abajo'; max: number; label: string }> = {
  tasa_cancelacion:  { umbral: 20, direccion: 'arriba', max: 100, label: 'Límite cancelación' },
  tasa_noshow:       { umbral: 15, direccion: 'arriba', max: 100, label: 'Límite no-show' },
  ingresos_dia:      { umbral: 200, direccion: 'abajo', max: 0,   label: 'Ingreso mínimo' },
  ticket_promedio:   { umbral: 40, direccion: 'abajo', max: 0,    label: 'Ticket mínimo' },
  ocupacion_agenda:  { umbral: 50, direccion: 'abajo', max: 0,    label: 'Ocupación mínima' },
  pacientes_nuevos:  { umbral: 5,  direccion: 'abajo', max: 0,    label: 'Mínimo pac. nuevos' },
  retencion_90:      { umbral: 40, direccion: 'abajo', max: 0,    label: 'Retención mínima' },
  nps:               { umbral: 30, direccion: 'abajo', max: 0,    label: 'NPS mínimo' },
  citas_reagendadas: { umbral: 25, direccion: 'arriba', max: 100, label: 'Límite reagendadas' },
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
const MinimizeIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
    <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
    <line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>
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
  const [chartSize, setChartSize] = useState<'normal' | 'grande' | 'completo'>('grande')
  const [alertasKpi, setAlertasKpi] = useState<Alerta[]>([])
  const [mostrarDeteccion, setMostrarDeteccion] = useState(true)
  const [alertaDetalleId, setAlertaDetalleId] = useState<number | null>(null)
  const router = useRouter()
  const { user } = useAuthStore()
  const toast = useToastStore()
  const pipStore = useKpiPipStore()
  const clinicaId = user?.clinica_id || 1

  const chartHeights: Record<string, number> = { normal: 320, grande: 460, completo: 600 }
  const chartHeight = chartHeights[chartSize]

  // Al entrar a KPIs, ocultar el mini chart
  useEffect(() => { pipStore.hide() }, [])

  useEffect(() => {
    fetchKPIs()
    fetchAlertasKpi()
    const interval = setInterval(() => { fetchKPIs(); fetchAlertasKpi() }, 30000)
    return () => clearInterval(interval)
  }, [clinicaId, horas])

  const fetchAlertasKpi = async () => {
    try {
      const res = await api.get('/alertas/')
      const all: Alerta[] = res.data.results || res.data
      setAlertasKpi(all)
    } catch { /* silent */ }
  }

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
    } catch {
      toast.error('Error al cargar KPIs', 'No se pudieron obtener los datos de indicadores.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Get alerts relevant to the selected KPI
  const alertasDelKpi = alertasKpi.filter(a => a.tipo_kpi === kpiSeleccionado)

  // Get the latest alert with Prophet forecast data for this KPI
  const alertaConProphet = alertasDelKpi.find(a =>
    a.detalle_deteccion?.prophet?.forecast?.length
  )
  const prophetForecast = alertaConProphet?.detalle_deteccion?.prophet?.forecast || []

  // Build chart data enriched with Prophet bands and anomaly markers
  const datosActualesRaw = kpiData[kpiSeleccionado] || []
  const datosActuales = datosActualesRaw.map(d => {
    // Find matching Prophet forecast point
    const prophetPoint = prophetForecast.find(f => {
      const fTime = new Date(f.fecha).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })
      return fTime === d.fecha
    })
    return {
      ...d,
      ...(prophetPoint && mostrarDeteccion ? {
        prophet_yhat: prophetPoint.yhat,
        prophet_lower: prophetPoint.yhat_lower,
        prophet_upper: prophetPoint.yhat_upper,
      } : {}),
    }
  })

  // Find anomaly points to mark on chart
  const anomalyPoints = mostrarDeteccion ? alertasDelKpi
    .filter(a => a.estado === 'activa')
    .map(a => {
      const time = new Date(a.creada_en).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })
      const dataIdx = datosActuales.findIndex(d => d.fecha === time)
      return { ...a, chartTime: time, dataIdx }
    })
    .filter(a => a.dataIdx >= 0) : []

  const cfg = kpiConfig[kpiSeleccionado]
  const umbralActual = kpiUmbrales[kpiSeleccionado] || null

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

  const minimizarAPip = () => {
    const allKpis = Object.entries(kpiConfig)
      .filter(([tipo]) => (kpiData[tipo] || []).length > 0)
      .map(([tipo, c]) => {
        const datos = kpiData[tipo] || []
        return {
          tipo,
          label: c.label,
          color: c.color,
          unit: c.unit,
          datos,
          ultimoValor: datos.length > 0 ? datos[datos.length - 1].valor : 0,
        }
      })
    const startIndex = allKpis.findIndex(k => k.tipo === kpiSeleccionado)
    if (allKpis.length > 0) {
      pipStore.show(allKpis, Math.max(0, startIndex))
      setTimeout(() => router.push('/dashboard'), 50)
    }
  }

  return (
    <>
        {/* CONTROLES */}
        <FadeContent direction="down" duration={0.5}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <h1 className="font-display" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>
                <ShinyText text="Análisis de KPIs" speed={4} className="font-display" />
              </h1>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
                Actualización cada 30s
              </p>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* GRÁFICA PRINCIPAL */}
            <FadeContent direction="up" delay={0.2} duration={0.4}>
              <GlowingCard className="p-6 sm:p-8 lg:p-10">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
                  <div>
                    <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                      {cfg?.label}
                    </h2>
                    <p style={{ fontSize: 14, color: 'var(--muted)' }}>
                      Últimas {horas}h · {datosActuales.length} registros
                    </p>
                    {mostrarDeteccion && (alertasDelKpi.length > 0 || prophetForecast.length > 0) && (
                      <div style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: 11 }}>
                        {prophetForecast.length > 0 && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#7CB5E8' }}>
                            <svg width="16" height="2"><line x1="0" y1="1" x2="16" y2="1" stroke="#7CB5E8" strokeWidth="2" strokeDasharray="4 2"/></svg>
                            Prophet
                          </span>
                        )}
                        {anomalyPoints.length > 0 && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#E8A0C4' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E8A0C4' }} />
                            {anomalyPoints.length} anomalía{anomalyPoints.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {/* Controles de tamaño */}
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, padding: 3 }}>
                      {(['normal', 'grande', 'completo'] as const).map(s => (
                        <motion.button key={s} onClick={() => setChartSize(s)} whileTap={{ scale: 0.95 }}
                          style={{
                            padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 500,
                            cursor: 'pointer', border: 'none',
                            background: chartSize === s ? 'rgba(155,142,196,0.2)' : 'transparent',
                            color: chartSize === s ? 'var(--primary)' : 'var(--muted)',
                          }}>
                          {s === 'normal' ? 'S' : s === 'grande' ? 'M' : 'L'}
                        </motion.button>
                      ))}
                    </div>
                    {/* Toggle detección */}
                    <motion.button onClick={() => setMostrarDeteccion(!mostrarDeteccion)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      title={mostrarDeteccion ? 'Ocultar detección' : 'Mostrar detección'}
                      style={{
                        padding: '6px 12px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                        background: mostrarDeteccion ? 'rgba(124,181,232,0.15)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${mostrarDeteccion ? 'rgba(124,181,232,0.3)' : 'var(--border)'}`,
                        color: mostrarDeteccion ? '#7CB5E8' : 'var(--muted)',
                      }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/>
                      </svg>
                      AI
                    </motion.button>
                    {/* Minimizar a PiP */}
                    <motion.button onClick={minimizarAPip} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      title="Minimizar gráfico"
                      style={{ width: 32, height: 32, borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
                      <MinimizeIcon />
                    </motion.button>
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
                </div>

                {loading ? (
                  <div style={{ height: chartHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
                  </div>
                ) : datosActuales.length === 0 ? (
                  <div style={{ height: chartHeight, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <p style={{ color: 'var(--muted)', fontSize: 15 }}>Sin datos en este rango de tiempo.</p>
                    <p style={{ color: 'var(--muted)', fontSize: 13 }}>Prueba con un rango mayor o espera el próximo ciclo.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={chartHeight}>
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
                      <ReferenceLine
                        y={umbralActual?.umbral}
                        stroke="#E8A0C4"
                        strokeDasharray="6 4"
                        strokeWidth={1.5}
                        ifOverflow="extendDomain"
                        label={{
                          value: umbralActual?.label || '',
                          position: 'insideTopRight',
                          fill: '#E8A0C4',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      />
                      <ReferenceArea
                        y1={umbralActual?.direccion === 'arriba' ? umbralActual.umbral : 0}
                        y2={umbralActual?.direccion === 'arriba' ? umbralActual.max : umbralActual?.umbral}
                        fill="#E8A0C4"
                        fillOpacity={0.08}
                        ifOverflow="extendDomain"
                      />
                      <Area
                        type="monotone" dataKey="valor" name={cfg?.label}
                        stroke={cfg?.color} strokeWidth={2.5}
                        fill="url(#colorKpi)" dot={false}
                        activeDot={{ r: 6, fill: cfg?.color, stroke: 'var(--void)', strokeWidth: 2 }}
                      />
                      {/* Prophet forecast band */}
                      {mostrarDeteccion && datosActuales.some((d: any) => d.prophet_upper) && (
                        <>
                          <Area
                            type="monotone" dataKey="prophet_upper" name="Prophet (sup)"
                            stroke="transparent" fill="transparent" dot={false} activeDot={false}
                            legendType="none"
                          />
                          <Area
                            type="monotone" dataKey="prophet_lower" name="Prophet (inf)"
                            stroke="transparent" fill="rgba(124,181,232,0.10)" dot={false} activeDot={false}
                            legendType="none"
                          />
                          <Line
                            type="monotone" dataKey="prophet_yhat" name="Prophet"
                            stroke="#7CB5E8" strokeWidth={1.5} strokeDasharray="6 3"
                            dot={false} activeDot={{ r: 4, fill: '#7CB5E8', stroke: 'var(--void)', strokeWidth: 2 }}
                          />
                        </>
                      )}
                      {/* Anomaly markers */}
                      {anomalyPoints.map(ap => {
                        const d = datosActuales[ap.dataIdx]
                        if (!d) return null
                        return (
                          <ReferenceDot
                            key={ap.id}
                            x={d.fecha}
                            y={d.valor}
                            r={6}
                            fill="#E8A0C4"
                            stroke="var(--void)"
                            strokeWidth={2}
                          />
                        )
                      })}
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </GlowingCard>
            </FadeContent>

            {/* DETECTION ALERTS FOR THIS KPI */}
            {mostrarDeteccion && alertasDelKpi.length > 0 && (
              <FadeContent direction="up" delay={0.25} duration={0.4}>
                <GlowingCard className="p-5 sm:p-6">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B8EC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                      </svg>
                      <h3 className="font-display" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                        Detección de Anomalías — {cfg?.label}
                      </h3>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>
                      {alertasDelKpi.filter(a => a.estado === 'activa').length} activas
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto' }}>
                    {alertasDelKpi.slice(0, 5).map(a => {
                      const sevColor = a.severidad === 'critica' ? '#E8A0C4' : a.severidad === 'alta' ? '#9B8EC4' : a.severidad === 'media' ? '#C4B5E8' : '#A0C4B5'
                      const d = a.detalle_deteccion
                      const isExpanded = alertaDetalleId === a.id
                      return (
                        <motion.div key={a.id} layout
                          style={{
                            padding: '12px 14px', borderRadius: 14,
                            background: `${sevColor}08`, border: `1px solid ${sevColor}25`,
                          }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: sevColor, boxShadow: `0 0 6px ${sevColor}` }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: sevColor, padding: '2px 8px', borderRadius: 10, background: `${sevColor}15` }}>
                              {a.severidad}
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                              {a.metodo_deteccion?.startsWith('ensemble:') ? 'Ensemble' : a.metodo_deteccion || 'Estadístico'}
                            </span>
                            {/* Methods that voted */}
                            {d?.ensemble && d.ensemble.metodos_disponibles.length > 1 && (
                              <div style={{ display: 'flex', gap: 4, marginLeft: 4 }}>
                                {d.ensemble.metodos_disponibles.map(m => {
                                  const voted = d.ensemble!.metodos_que_flaggearon.includes(m)
                                  const mColor = m === 'estadistico' ? '#A0C4B5' : m === 'prophet' ? '#7CB5E8' : '#E8C4A0'
                                  return (
                                    <span key={m} style={{
                                      fontSize: 9, fontWeight: 700, width: 18, height: 18, borderRadius: 6,
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      background: voted ? `${mColor}25` : 'rgba(255,255,255,0.03)',
                                      color: voted ? mColor : 'var(--muted)',
                                      border: `1px solid ${voted ? mColor + '40' : 'var(--border)'}`,
                                    }}
                                    title={`${m}: ${voted ? 'anomalía' : 'normal'}`}
                                    >
                                      {m === 'estadistico' ? 'σ' : m === 'prophet' ? 'P' : 'F'}
                                    </span>
                                  )
                                })}
                              </div>
                            )}
                            <motion.button
                              onClick={() => setAlertaDetalleId(isExpanded ? null : a.id)}
                              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              style={{
                                marginLeft: 'auto', width: 22, height: 22, borderRadius: 11,
                                background: isExpanded ? 'rgba(155,142,196,0.2)' : 'rgba(255,255,255,0.05)',
                                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: isExpanded ? '#9B8EC4' : 'var(--muted)',
                              }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                              </svg>
                            </motion.button>
                          </div>
                          <div style={{ display: 'flex', gap: 14, fontSize: 12, flexWrap: 'wrap' }}>
                            <span style={{ color: 'var(--muted)' }}>
                              Detectado: <strong style={{ color: sevColor }}>{a.valor_detectado?.toFixed(1)}</strong>
                            </span>
                            <span style={{ color: 'var(--muted)' }}>
                              Esperado: <strong style={{ color: 'var(--text)' }}>{a.valor_esperado?.toFixed(1)}</strong>
                            </span>
                            <span style={{ color: sevColor, fontWeight: 600 }}>
                              {a.desviacion > 0 ? '+' : ''}{a.desviacion?.toFixed(1)}%
                            </span>
                            <span style={{ color: 'var(--muted)', marginLeft: 'auto', fontSize: 11 }}>
                              {new Date(a.creada_en).toLocaleString('es-CR')}
                            </span>
                          </div>
                          {/* Expanded detail */}
                          {isExpanded && d && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                              style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {/* Per-method results */}
                              {d.estadistico && (
                                <div style={{ padding: '8px 10px', borderRadius: 10, background: 'rgba(160,196,181,0.08)', border: '1px solid rgba(160,196,181,0.15)', fontSize: 12 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                    <span style={{ fontWeight: 700, color: '#A0C4B5' }}>σ Estadístico</span>
                                    <span style={{ fontSize: 11, color: d.estadistico.es_anomalia ? '#E8A0C4' : '#A0C4B5' }}>
                                      {d.estadistico.es_anomalia ? 'Anomalía' : 'Normal'}
                                    </span>
                                  </div>
                                  <span style={{ color: 'var(--muted)' }}>
                                    Desviación: {d.estadistico.desviacion}% (umbral: {d.estadistico.umbral}%) · {d.estadistico.datos_usados} datos
                                  </span>
                                </div>
                              )}
                              {d.prophet && (
                                <div style={{ padding: '8px 10px', borderRadius: 10, background: 'rgba(124,181,232,0.08)', border: '1px solid rgba(124,181,232,0.15)', fontSize: 12 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                    <span style={{ fontWeight: 700, color: '#7CB5E8' }}>P Prophet</span>
                                    <span style={{ fontSize: 11, color: d.prophet.es_anomalia ? '#E8A0C4' : '#A0C4B5' }}>
                                      {d.prophet.es_anomalia ? 'Anomalía' : 'Normal'}
                                    </span>
                                  </div>
                                  <span style={{ color: 'var(--muted)' }}>
                                    Predicción: {d.prophet.yhat} · Rango [{d.prophet.yhat_lower} — {d.prophet.yhat_upper}] · {d.prophet.datos_entrenamiento} datos
                                  </span>
                                </div>
                              )}
                              {d.pyod && (
                                <div style={{ padding: '8px 10px', borderRadius: 10, background: 'rgba(232,196,160,0.08)', border: '1px solid rgba(232,196,160,0.15)', fontSize: 12 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                    <span style={{ fontWeight: 700, color: '#E8C4A0' }}>F Isolation Forest</span>
                                    <span style={{ fontSize: 11, color: d.pyod.es_anomalia ? '#E8A0C4' : '#A0C4B5' }}>
                                      {d.pyod.es_anomalia ? 'Outlier' : 'Normal'}
                                    </span>
                                  </div>
                                  <span style={{ color: 'var(--muted)' }}>
                                    Score: {d.pyod.anomaly_score} (threshold: {d.pyod.threshold}) · Media: {d.pyod.media_historica} ±{d.pyod.std_historica?.toFixed(1)}
                                  </span>
                                </div>
                              )}
                              {a.recomendacion && (
                                <div style={{ padding: '8px 10px', borderRadius: 10, background: 'rgba(155,142,196,0.08)', border: '1px solid rgba(155,142,196,0.15)', fontSize: 12 }}>
                                  <span style={{ fontWeight: 700, color: '#C4B5E8', fontSize: 11 }}>Recomendación IA:</span>
                                  <p style={{ color: 'var(--text)', opacity: 0.85, marginTop: 4, lineHeight: 1.6 }}>{a.recomendacion}</p>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </GlowingCard>
              </FadeContent>
            )}

            {/* KPI STATS GRID */}
            {chartSize !== 'completo' && (
              <FadeContent direction="up" delay={0.3} duration={0.4}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
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
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.03 }}
                        onClick={() => setKpiSeleccionado(tipo)}
                        whileHover={{ scale: 1.03 }}
                        style={{
                          padding: '14px 16px', borderRadius: 16, cursor: 'pointer',
                          background: isSelected ? `${c.color}15` : 'var(--glass)',
                          backdropFilter: 'blur(20px)',
                          border: `1px solid ${isSelected ? c.color + '40' : 'var(--border)'}`,
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{c.label}</p>
                          <p style={{ fontSize: 11, color: up ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                            {up ? '↑' : '↓'}{Math.abs(Number(diff))}%
                          </p>
                        </div>
                        <p className="font-display" style={{ fontSize: 20, fontWeight: 700, color: c.color }}>
                          {c.unit}<CountUp to={ultimo} decimals={1} duration={0.8} />
                        </p>
                      </motion.div>
                    )
                  })}
                </div>
              </FadeContent>
            )}
          </div>
        ) : (
          /* VISTA COMPARAR */
          <FadeContent direction="up" delay={0.2} duration={0.4}>
            <GlowingCard className="p-6 sm:p-8 lg:p-10">
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
                    {Object.entries(kpiUmbrales)
                      .filter(([tipo]) => kpiData[tipo]?.length > 0)
                      .map(([tipo, u]) => (
                        <ReferenceLine
                          key={`umbral-${tipo}`}
                          y={u.umbral}
                          stroke={kpiConfig[tipo]?.color || '#E8A0C4'}
                          strokeDasharray="4 3"
                          strokeWidth={1}
                          strokeOpacity={0.5}
                          ifOverflow="extendDomain"
                        />
                      ))
                    }
                  </LineChart>
                </ResponsiveContainer>
              )}
            </GlowingCard>
          </FadeContent>
        )}
    </>
  )
}