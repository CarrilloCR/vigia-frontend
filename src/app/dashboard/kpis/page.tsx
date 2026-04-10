'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Legend,
  ReferenceLine, ReferenceArea, ReferenceDot,
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

interface KPIData { fecha: string; fechaISO: string; valor: number; tipo: string }
type Vista = 'individual' | 'grid' | 'todas'
interface Overlays { prophet: boolean; pyod: boolean; umbral: boolean; anomalias: boolean }

// ── Icons ────────────────────────────────────────────────────────────────────

const ArrowLeftIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
const RefreshIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)
const MinimizeIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
    <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
    <line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
)

// ── Custom tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(18,14,36,0.97)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(155,142,196,0.3)', borderRadius: 14,
      padding: '12px 16px', fontSize: 13, minWidth: 160,
    }}>
      <p style={{ color: 'var(--muted)', marginBottom: 8, fontSize: 11 }}>{label}</p>
      {payload.map((p: any, i: number) => {
        if (p.value == null) return null
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < payload.length - 1 ? 5 : 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
            <p style={{ color: 'var(--text)', fontWeight: 600 }}>
              {p.name}: <span style={{ color: p.color }}>{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</span>
            </p>
          </div>
        )
      })}
    </div>
  )
}

const NormalizedTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(18,14,36,0.97)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(155,142,196,0.3)', borderRadius: 14,
      padding: '12px 16px', fontSize: 12, minWidth: 180,
    }}>
      <p style={{ color: 'var(--muted)', marginBottom: 8, fontSize: 11 }}>{label}</p>
      {payload.map((p: any, i: number) => {
        if (p.value == null) return null
        const sign = p.value >= 0 ? '+' : ''
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
            <p style={{ color: 'var(--text)', fontWeight: 600 }}>
              {p.name}: <span style={{ color: p.value >= 0 ? '#A0C4B5' : '#E8A0C4' }}>
                {sign}{p.value.toFixed(1)}%
              </span>
            </p>
          </div>
        )
      })}
      <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>desviación normalizada respecto a la media</p>
    </div>
  )
}

// ── OverlayButton ─────────────────────────────────────────────────────────────

function OverlayBtn({ label, active, color, onClick, hasData = true }: {
  label: string; active: boolean; color: string; onClick: () => void; hasData?: boolean
}) {
  return (
    <motion.button onClick={onClick} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
      title={!hasData ? 'Sin datos disponibles para este KPI — ejecuta el motor primero' : undefined}
      style={{
        padding: '5px 11px', borderRadius: 8, fontSize: 11, fontWeight: 600,
        cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: 5,
        background: active && hasData ? `${color}22` : 'rgba(255,255,255,0.03)',
        color: active && hasData ? color : 'var(--muted)',
        borderWidth: 1, borderStyle: 'solid',
        borderColor: active && hasData ? `${color}50` : 'var(--border)',
        transition: 'all 0.15s',
        opacity: hasData ? 1 : 0.5,
      }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: active && hasData ? color : 'var(--muted)', flexShrink: 0 }} />
      {label}
      {!hasData && <span style={{ fontSize: 9, color: 'var(--muted)', opacity: 0.7 }}>sin datos</span>}
    </motion.button>
  )
}

// ── Mini chart for grid view ──────────────────────────────────────────────────

function MiniKpiChart({ tipo, datos, alertas, overlays }: {
  tipo: string; datos: KPIData[]; alertas: Alerta[]; overlays: Overlays
}) {
  const cfg = kpiConfig[tipo]
  const umbralCfg = kpiUmbrales[tipo]
  const alertaConProphet = alertas.find(a => a.tipo_kpi === tipo && a.detalle_deteccion?.prophet?.yhat != null)
  const prophetData = alertaConProphet?.detalle_deteccion?.prophet
  const pyodAlertas = overlays.pyod ? alertas.filter(a => a.tipo_kpi === tipo && a.detalle_deteccion?.pyod?.es_anomalia) : []

  const ultimo = datos.length > 0 ? datos[datos.length - 1].valor : 0
  const penultimo = datos.length > 1 ? datos[datos.length - 2].valor : 0
  const cambio = penultimo !== 0 ? ((ultimo - penultimo) / penultimo * 100) : 0
  const subiendo = cambio >= 0
  const alertasActivas = alertas.filter(a => a.tipo_kpi === tipo && a.estado === 'activa').length

  // Anomaly points for this KPI — match by closest ISO timestamp within 2h
  const anomalyDataIndexes = new Set(
    alertas.filter(a => a.tipo_kpi === tipo).map(a => {
      const alertMs = new Date(a.creada_en).getTime()
      let bestIdx = -1, bestDiff = Infinity
      chartData.forEach((d: any, idx: number) => {
        if (!d.fechaISO) return
        const diff = Math.abs(new Date(d.fechaISO).getTime() - alertMs)
        if (diff < bestDiff) { bestDiff = diff; bestIdx = idx }
      })
      return bestDiff < 2 * 60 * 60 * 1000 ? bestIdx : -1
    }).filter(idx => idx >= 0)
  )

  const chartData = useMemo(() => {
    // Future prophet extension
    if (!overlays.prophet || !prophetData) return datos.slice(-16)
    return datos.slice(-16)
  }, [datos, overlays.prophet, prophetData])

  if (!cfg) return null

  return (
    <div style={{ height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, boxShadow: `0 0 8px ${cfg.color}` }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{cfg.label}</span>
            {alertasActivas > 0 && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10,
                background: 'rgba(232,160,196,0.2)', color: '#E8A0C4', border: '1px solid rgba(232,160,196,0.3)',
              }}>
                {alertasActivas} alerta{alertasActivas > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
            <span className="font-display" style={{ fontSize: 26, fontWeight: 800, color: cfg.color, lineHeight: 1 }}>
              {cfg.unit}<CountUp to={ultimo} decimals={1} duration={0.6} />
            </span>
            <span style={{ fontSize: 12, color: subiendo ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
              {subiendo ? '↑' : '↓'}{Math.abs(cambio).toFixed(1)}%
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          {overlays.prophet && prophetData && (
            <span style={{ fontSize: 10, color: '#7CB5E8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7CB5E8' }} />
              Prophet
            </span>
          )}
          {overlays.pyod && pyodAlertas.length > 0 && (
            <span style={{ fontSize: 10, color: '#E8C4A0', fontWeight: 600 }}>
              {pyodAlertas.length} outlier{pyodAlertas.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Chart */}
      {chartData.length === 0 ? (
        <div style={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>Sin datos</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={110}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${tipo}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={cfg.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={cfg.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="fecha" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ background: 'rgba(18,14,36,0.97)', border: `1px solid ${cfg.color}30`, borderRadius: 10, fontSize: 11, padding: '4px 8px' }}
              labelStyle={{ color: 'var(--muted)', fontSize: 10 }}
              formatter={(v: any) => [`${cfg.unit}${Number(v).toFixed(1)}`, cfg.label]}
            />
            {/* Umbral reference */}
            {overlays.umbral && umbralCfg && (
              <ReferenceLine y={umbralCfg.umbral} stroke="#E8A0C4" strokeDasharray="4 3" strokeWidth={1} strokeOpacity={0.6} />
            )}
            {/* Prophet band */}
            {overlays.prophet && prophetData && (
              <>
                <ReferenceArea
                  y1={prophetData.yhat_lower}
                  y2={prophetData.yhat_upper}
                  fill="rgba(124,181,232,0.12)"
                  fillOpacity={1}
                  ifOverflow="extendDomain"
                />
                <ReferenceLine y={prophetData.yhat} stroke="#7CB5E8" strokeDasharray="5 3" strokeWidth={1.5} strokeOpacity={0.8} />
              </>
            )}
            {/* Actual data */}
            <Area
              type="monotone" dataKey="valor" name={cfg.label}
              stroke={cfg.color} strokeWidth={2}
              fill={`url(#grad-${tipo})`} dot={false}
              activeDot={{ r: 4, fill: cfg.color, stroke: 'var(--void)', strokeWidth: 2 }}
            />
            {/* Anomaly dots */}
            {overlays.anomalias && chartData.map((d, idx) =>
              anomalyDataIndexes.has(idx) && d.valor != null ? (
                <ReferenceDot key={idx} x={d.fecha} y={d.valor} r={5} fill="#E8A0C4" stroke="var(--void)" strokeWidth={2} />
              ) : null
            )}
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Prophet future badge */}
      {overlays.prophet && prophetData && (
        <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 10 }}>
          <span style={{ color: 'var(--muted)' }}>
            Pred.: <strong style={{ color: '#7CB5E8' }}>{cfg.unit}{prophetData.yhat}</strong>
          </span>
          <span style={{ color: 'var(--muted)' }}>
            Rango: <strong style={{ color: 'var(--text)' }}>{prophetData.yhat_lower} — {prophetData.yhat_upper}</strong>
          </span>
        </div>
      )}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function KPIsPage() {
  const [kpiData, setKpiData] = useState<Record<string, KPIData[]>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [kpiSeleccionado, setKpiSeleccionado] = useState('ingresos_dia')
  const [vista, setVista] = useState<Vista>('individual')
  const [horas, setHoras] = useState(2)
  const [chartSize, setChartSize] = useState<'normal' | 'grande' | 'completo'>('grande')
  const [alertasKpi, setAlertasKpi] = useState<Alerta[]>([])
  const [overlays, setOverlays] = useState<Overlays>({ prophet: true, pyod: true, umbral: true, anomalias: true })
  const [alertaDetalleId, setAlertaDetalleId] = useState<number | null>(null)
  const router = useRouter()
  const { user } = useAuthStore()
  const toast = useToastStore()
  const pipStore = useKpiPipStore()
  const clinicaId = user?.clinica_id || 1

  const chartHeights: Record<string, number> = { normal: 320, grande: 460, completo: 620 }
  const chartHeight = chartHeights[chartSize]

  useEffect(() => { pipStore.hide() }, [])

  useEffect(() => {
    fetchKPIs()
    fetchAlertasKpi()
    const interval = setInterval(() => { fetchKPIs(); fetchAlertasKpi() }, 30000)
    return () => clearInterval(interval)
  }, [clinicaId, horas])

  const fetchAlertasKpi = async () => {
    try {
      const res = await api.get(`/alertas/?clinica=${clinicaId}`)
      setAlertasKpi(res.data.results || res.data)
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
          fechaISO: kpi.fecha_hora,
          valor: Math.round(kpi.valor * 100) / 100,
          tipo: kpi.tipo,
        })
      })
      Object.keys(agrupado).forEach(k => { agrupado[k] = agrupado[k].slice(-24) })
      setKpiData(agrupado)
    } catch {
      toast.error('Error al cargar KPIs', 'No se pudieron obtener los datos de indicadores.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const toggleOverlay = (key: keyof Overlays) =>
    setOverlays(prev => ({ ...prev, [key]: !prev[key] }))

  // ── Derived data for individual chart ─────────────────────────────────────

  const alertasDelKpi = alertasKpi.filter(a => a.tipo_kpi === kpiSeleccionado)
  const alertaConProphet = alertasDelKpi.find(a => a.detalle_deteccion?.prophet?.forecast?.length)
  const prophetForecast = alertaConProphet?.detalle_deteccion?.prophet?.forecast || []
  const prophetBand = alertaConProphet?.detalle_deteccion?.prophet

  // Chart data: always includes future prophet extension (visibility controlled in render)
  const chartData = useMemo(() => {
    const raw = kpiData[kpiSeleccionado] || []
    if (prophetForecast.length === 0) return raw

    const now = Date.now()
    const futurePoint = prophetForecast.find(f => new Date(f.fecha).getTime() > now)
      ?? prophetForecast[prophetForecast.length - 1]

    if (!futurePoint || new Date(futurePoint.fecha).getTime() <= now) return raw

    const futDate = new Date(futurePoint.fecha)
    const futurePoints = [6, 12, 18, 24].map(h => {
      const d = new Date(futDate)
      d.setHours(h, 0, 0, 0)
      return {
        fecha: d.toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit' }) + ' ' +
               d.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
        fechaISO: d.toISOString(),
        valor: null as any,
        prophet_yhat: futurePoint.yhat,
        prophet_lower: futurePoint.yhat_lower,
        prophet_upper: futurePoint.yhat_upper,
        tipo: kpiSeleccionado,
        esFuturo: true,
      }
    })
    return [...raw, ...futurePoints]
  }, [kpiData, kpiSeleccionado, prophetForecast])

  // Match an alert to the closest KPI data point within the chart's time window
  const matchDataIndex = (alertISO: string, data: typeof chartData): number => {
    const alertMs = new Date(alertISO).getTime()
    let bestIdx = -1
    let bestDiff = Infinity
    data.forEach((d: any, idx: number) => {
      if (!d.fechaISO || d.esFuturo) return
      const diff = Math.abs(new Date(d.fechaISO).getTime() - alertMs)
      if (diff < bestDiff) { bestDiff = diff; bestIdx = idx }
    })
    // tolerance = horas window + 30min buffer so alerts slightly outside window still match
    return bestDiff < (horas + 0.5) * 60 * 60 * 1000 ? bestIdx : -1
  }

  // All alerts in the chart's time range (active + revisadas — so dots persist after review)
  const anomalyPoints = useMemo(() =>
    alertasDelKpi
      .map(a => ({ ...a, dataIdx: matchDataIndex(a.creada_en, chartData) }))
      .filter(a => a.dataIdx >= 0)
  , [alertasDelKpi, chartData])

  const pyodPoints = useMemo(() =>
    alertasDelKpi
      .filter(a => a.detalle_deteccion?.pyod?.es_anomalia === true)
      .map(a => ({ ...a, dataIdx: matchDataIndex(a.creada_en, chartData) }))
      .filter(a => a.dataIdx >= 0)
  , [alertasDelKpi, chartData])

  // Last actual data point label (for "Ahora" separator)
  const rawData = kpiData[kpiSeleccionado] || []
  const ahoraLabel = rawData.length > 0 ? rawData[rawData.length - 1].fecha : null
  const hayFuturos = chartData.some((d: any) => d.esFuturo)

  const cfg = kpiConfig[kpiSeleccionado]
  const umbralActual = kpiUmbrales[kpiSeleccionado] || null
  const ultimoValor = rawData.length > 0 ? rawData[rawData.length - 1].valor : 0
  const primerValor = rawData.length > 0 ? rawData[0].valor : 0
  const cambio = primerValor !== 0 ? ((ultimoValor - primerValor) / primerValor * 100).toFixed(1) : '0'
  const subiendo = ultimoValor >= primerValor

  // ── Normalized data for "todas" view ──────────────────────────────────────

  const datosNormalizados = useMemo(() => {
    const tiposDisponibles = Object.keys(kpiData).filter(t => kpiData[t].length > 0)
    if (tiposDisponibles.length === 0) return []

    // Compute mean for each KPI
    const medias: Record<string, number> = {}
    tiposDisponibles.forEach(t => {
      const vals = kpiData[t].map(d => d.valor)
      medias[t] = vals.reduce((a, b) => a + b, 0) / vals.length
    })

    // Build unified time series
    const maxLen = Math.max(...tiposDisponibles.map(t => kpiData[t].length))
    const result: any[] = []
    for (let i = 0; i < maxLen; i++) {
      const punto: any = {}
      tiposDisponibles.forEach(t => {
        const datos = kpiData[t]
        const d = datos[i] || datos[datos.length - 1]
        if (d) {
          punto.fecha = d.fecha
          const media = medias[t]
          if (media !== 0) {
            punto[kpiConfig[t]?.label || t] = parseFloat(((d.valor / media - 1) * 100).toFixed(2))
          }
        }
      })
      if (punto.fecha) result.push(punto)
    }
    return result
  }, [kpiData])

  // ── Pip ───────────────────────────────────────────────────────────────────

  const minimizarAPip = () => {
    const all = Object.entries(kpiConfig)
      .filter(([t]) => (kpiData[t] || []).length > 0)
      .map(([t, c]) => {
        const datos = kpiData[t] || []
        return { tipo: t, label: c.label, color: c.color, unit: c.unit, datos, ultimoValor: datos.length > 0 ? datos[datos.length - 1].valor : 0 }
      })
    const idx = all.findIndex(k => k.tipo === kpiSeleccionado)
    if (all.length > 0) { pipStore.show(all, Math.max(0, idx)); setTimeout(() => router.push('/dashboard'), 50) }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* HEADER */}
      <FadeContent direction="down" duration={0.5}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="font-display" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>
              <ShinyText text="Análisis de KPIs" speed={4} className="font-display" />
            </h1>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>Actualización cada 30s</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Time range */}
            <div style={{ display: 'flex', background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', borderRadius: 14, padding: 4 }}>
              {[1, 2, 6, 12].map(h => (
                <motion.button key={h} onClick={() => setHoras(h)} whileTap={{ scale: 0.97 }}
                  style={{ padding: '10px 16px', borderRadius: 11, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', position: 'relative', overflow: 'hidden', background: 'transparent', color: horas === h ? 'white' : 'var(--muted)' }}>
                  {horas === h && (
                    <motion.div layoutId="horasTab" style={{ position: 'absolute', inset: 0, borderRadius: 11, background: 'linear-gradient(135deg, var(--primary), var(--accent))' }} transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} />
                  )}
                  <span style={{ position: 'relative', zIndex: 1 }}>{h}h</span>
                </motion.button>
              ))}
            </div>

            {/* Vista tabs */}
            <div style={{ display: 'flex', background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', borderRadius: 14, padding: 4 }}>
              {([['individual', 'Individual'], ['grid', 'Grid'], ['todas', 'Todas']] as [Vista, string][]).map(([v, lbl]) => (
                <motion.button key={v} onClick={() => setVista(v)} whileTap={{ scale: 0.97 }}
                  style={{ padding: '10px 16px', borderRadius: 11, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', position: 'relative', overflow: 'hidden', background: 'transparent', color: vista === v ? 'white' : 'var(--muted)' }}>
                  {vista === v && (
                    <motion.div layoutId="vistaTab" style={{ position: 'absolute', inset: 0, borderRadius: 11, background: 'linear-gradient(135deg, var(--primary), var(--accent))' }} transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} />
                  )}
                  <span style={{ position: 'relative', zIndex: 1 }}>{lbl}</span>
                </motion.button>
              ))}
            </div>

            {/* Refresh */}
            <motion.button onClick={() => fetchKPIs(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text)' }}>
              <motion.div animate={refreshing ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: 'linear' }}>
                <RefreshIcon />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </FadeContent>

      {/* ── INDIVIDUAL VIEW ── */}
      {vista === 'individual' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* KPI Selector */}
          <FadeContent direction="up" delay={0.1} duration={0.4}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {Object.entries(kpiConfig).map(([tipo, c]) => {
                const datos = kpiData[tipo] || []
                const ultimo = datos.length > 0 ? datos[datos.length - 1].valor : null
                const penultimo = datos.length > 1 ? datos[datos.length - 2].valor : null
                const isSelected = kpiSeleccionado === tipo
                const trending = ultimo !== null && penultimo !== null ? ultimo >= penultimo : null
                const hasAlerts = alertasKpi.some(a => a.tipo_kpi === tipo && a.estado === 'activa')

                return (
                  <motion.button key={tipo} onClick={() => setKpiSeleccionado(tipo)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    style={{
                      padding: '11px 18px', borderRadius: 14, fontSize: 14, fontWeight: 500, cursor: 'pointer',
                      border: 'none', position: 'relative', overflow: 'hidden',
                      background: isSelected ? 'transparent' : 'var(--glass)', backdropFilter: 'blur(20px)',
                      borderWidth: 1, borderStyle: 'solid',
                      borderColor: isSelected ? c.color : hasAlerts ? 'rgba(232,160,196,0.3)' : 'var(--border)',
                      color: isSelected ? 'white' : 'var(--muted)', transition: 'all 0.2s',
                      boxShadow: isSelected ? `0 4px 20px ${c.color}40` : 'none',
                    }}>
                    {isSelected && (
                      <motion.div layoutId="kpiSelected"
                        style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${c.color}CC, ${c.color}88)` }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {hasAlerts && !isSelected && (
                        <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                          style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8A0C4', flexShrink: 0 }} />
                      )}
                      {c.label}
                      {ultimo !== null && <span style={{ opacity: 0.85, fontSize: 13 }}>{c.unit}{ultimo}</span>}
                      {trending !== null && <span style={{ fontSize: 11, color: isSelected ? 'rgba(255,255,255,0.8)' : trending ? '#A0C4B5' : '#E8A0C4' }}>{trending ? '↑' : '↓'}</span>}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </FadeContent>

          {/* Main chart */}
          <FadeContent direction="up" delay={0.2} duration={0.4}>
            <GlowingCard className="p-6 sm:p-8 lg:p-10">
              {/* Chart header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{cfg?.label}</h2>
                  <p style={{ fontSize: 13, color: 'var(--muted)' }}>Últimas {horas}h · {rawData.length} registros</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {/* Overlay toggles */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <OverlayBtn label="Prophet" active={overlays.prophet} color="#7CB5E8" onClick={() => toggleOverlay('prophet')} hasData={!!prophetBand} />
                    <OverlayBtn label="PyOD" active={overlays.pyod} color="#E8C4A0" onClick={() => toggleOverlay('pyod')} hasData={pyodPoints.length > 0} />
                    <OverlayBtn label="Umbral" active={overlays.umbral} color="#E8A0C4" onClick={() => toggleOverlay('umbral')} hasData={!!umbralActual} />
                    <OverlayBtn label="Anomalías" active={overlays.anomalias} color="#C4B5E8" onClick={() => toggleOverlay('anomalias')} hasData={anomalyPoints.length > 0} />
                  </div>

                  {/* Chart size */}
                  <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, padding: 3 }}>
                    {(['normal', 'grande', 'completo'] as const).map(s => (
                      <motion.button key={s} onClick={() => setChartSize(s)} whileTap={{ scale: 0.95 }}
                        style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: 'pointer', border: 'none', background: chartSize === s ? 'rgba(155,142,196,0.2)' : 'transparent', color: chartSize === s ? 'var(--primary)' : 'var(--muted)' }}>
                        {s === 'normal' ? 'S' : s === 'grande' ? 'M' : 'L'}
                      </motion.button>
                    ))}
                  </div>

                  {/* PiP */}
                  <motion.button onClick={minimizarAPip} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    title="Minimizar gráfico"
                    style={{ width: 32, height: 32, borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
                    <MinimizeIcon />
                  </motion.button>

                  <div style={{ textAlign: 'right' }}>
                    <p className="font-display" style={{ fontSize: 40, fontWeight: 800, color: cfg?.color, lineHeight: 1 }}>
                      {cfg?.unit}<CountUp to={ultimoValor} decimals={1} duration={1} />
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 500, marginTop: 5, color: subiendo ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                      <span>{subiendo ? '↑' : '↓'}</span>
                      <span>{Math.abs(Number(cambio))}% vs inicio</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap', fontSize: 11 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: cfg?.color }}>
                  <div style={{ width: 16, height: 3, borderRadius: 2, background: cfg?.color }} />
                  Valor real
                </span>
                {overlays.prophet && prophetBand && (
                  <>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#7CB5E8' }}>
                      <svg width="16" height="3"><line x1="0" y1="1.5" x2="16" y2="1.5" stroke="#7CB5E8" strokeWidth="2" strokeDasharray="5 3"/></svg>
                      Prophet (predicción)
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#7CB5E8', opacity: 0.7 }}>
                      <div style={{ width: 14, height: 8, borderRadius: 3, background: 'rgba(124,181,232,0.2)', border: '1px solid rgba(124,181,232,0.3)' }} />
                      Intervalo confianza 90%
                    </span>
                  </>
                )}
                {overlays.umbral && umbralActual && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#E8A0C4' }}>
                    <svg width="16" height="3"><line x1="0" y1="1.5" x2="16" y2="1.5" stroke="#E8A0C4" strokeWidth="2" strokeDasharray="6 4"/></svg>
                    {umbralActual.label}
                  </span>
                )}
                {overlays.anomalias && anomalyPoints.length > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#E8A0C4' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E8A0C4' }} />
                    {anomalyPoints.length} anomalía{anomalyPoints.length > 1 ? 's' : ''}
                  </span>
                )}
                {overlays.pyod && pyodPoints.length > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#E8C4A0' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E8C4A0' }} />
                    {pyodPoints.length} outlier PyOD
                  </span>
                )}
                {overlays.prophet && hayFuturos && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--muted)' }}>
                    <div style={{ width: 14, height: 8, borderRadius: 3, background: 'rgba(124,181,232,0.08)', border: '1px dashed rgba(124,181,232,0.3)' }} />
                    Predicción futura
                  </span>
                )}
              </div>

              {/* Chart */}
              {loading ? (
                <div style={{ height: chartHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
                </div>
              ) : chartData.length === 0 ? (
                <div style={{ height: chartHeight, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                  <p style={{ color: 'var(--muted)', fontSize: 15 }}>Sin datos en este rango de tiempo.</p>
                  <p style={{ color: 'var(--muted)', fontSize: 13 }}>Prueba con un rango mayor o espera el próximo ciclo.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorKpi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={cfg?.color} stopOpacity={0.35}/>
                        <stop offset="95%" stopColor={cfg?.color} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorFuture" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7CB5E8" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#7CB5E8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(155,142,196,0.08)" />
                    <XAxis dataKey="fecha" stroke="var(--muted)" tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                    <YAxis stroke="var(--muted)" tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />

                    {/* ── Stable DOM overlays — visibility via fill/stroke, not conditional mount ── */}

                    {/* Umbral zone — always rendered, opacity controlled */}
                    <ReferenceLine
                      y={umbralActual?.umbral ?? 0}
                      stroke="#E8A0C4"
                      strokeDasharray="6 4" strokeWidth={1.5}
                      strokeOpacity={overlays.umbral && umbralActual ? 1 : 0}
                      ifOverflow="extendDomain"
                      label={overlays.umbral && umbralActual ? { value: umbralActual.label, position: 'insideTopRight', fill: '#E8A0C4', fontSize: 11, fontWeight: 600 } : undefined}
                    />
                    <ReferenceArea
                      y1={umbralActual?.direccion === 'arriba' ? (umbralActual.umbral ?? 0) : 0}
                      y2={umbralActual?.direccion === 'arriba' ? (umbralActual.max ?? 0) : (umbralActual?.umbral ?? 0)}
                      fill={overlays.umbral && umbralActual ? '#E8A0C4' : 'transparent'}
                      fillOpacity={0.06}
                      ifOverflow="extendDomain"
                    />

                    {/* Prophet confidence band — always rendered, opacity controlled */}
                    <ReferenceArea
                      y1={prophetBand?.yhat_lower ?? 0}
                      y2={prophetBand?.yhat_upper ?? 0}
                      fill={overlays.prophet && prophetBand ? 'rgba(124,181,232,0.14)' : 'transparent'}
                      fillOpacity={1}
                      ifOverflow="extendDomain"
                    />
                    <ReferenceLine
                      y={prophetBand?.yhat ?? 0}
                      stroke="#7CB5E8"
                      strokeDasharray="7 4" strokeWidth={2}
                      strokeOpacity={overlays.prophet && prophetBand ? 0.9 : 0}
                      ifOverflow="extendDomain"
                      label={overlays.prophet && prophetBand ? { value: `P: ${prophetBand.yhat}`, position: 'insideTopLeft', fill: '#7CB5E8', fontSize: 10, fontWeight: 700 } : undefined}
                    />

                    {/* "Ahora" separator */}
                    <ReferenceLine
                      x={ahoraLabel ?? undefined}
                      stroke="rgba(155,142,196,0.5)"
                      strokeDasharray="4 3" strokeWidth={1.5}
                      strokeOpacity={overlays.prophet && hayFuturos ? 1 : 0}
                      label={overlays.prophet && hayFuturos ? { value: 'Ahora', position: 'insideTopRight', fill: 'rgba(155,142,196,0.8)', fontSize: 10, fontWeight: 700 } : undefined}
                    />

                    {/* Future zone highlight */}
                    <ReferenceArea
                      x1={ahoraLabel ?? undefined}
                      fill={overlays.prophet && hayFuturos ? 'rgba(124,181,232,0.05)' : 'transparent'}
                      fillOpacity={1}
                      ifOverflow="extendDomain"
                    />

                    {/* Actual KPI area */}
                    <Area
                      type="monotone" dataKey="valor" name={cfg?.label}
                      stroke={cfg?.color} strokeWidth={2.5}
                      fill="url(#colorKpi)" dot={false}
                      activeDot={{ r: 6, fill: cfg?.color, stroke: 'var(--void)', strokeWidth: 2 }}
                      connectNulls={false}
                    />

                    {/* Future Prophet area — always in DOM, stroke/fill controlled */}
                    <Area
                      type="monotone" dataKey="prophet_yhat" name="Predicción futura"
                      stroke={overlays.prophet && hayFuturos ? '#7CB5E8' : 'transparent'}
                      strokeWidth={2} strokeDasharray="7 4"
                      fill={overlays.prophet && hayFuturos ? 'url(#colorFuture)' : 'transparent'}
                      dot={false}
                      activeDot={overlays.prophet && hayFuturos ? { r: 4, fill: '#7CB5E8', stroke: 'var(--void)', strokeWidth: 2 } : false}
                    />

                    {/* Anomaly dots — fill controlled by overlay */}
                    {anomalyPoints.map(ap => {
                      const d = chartData[ap.dataIdx]
                      if (!d || d.valor == null) return null
                      const sevColor = ap.severidad === 'critica' ? '#E8A0C4' : ap.severidad === 'alta' ? '#9B8EC4' : '#C4B5E8'
                      return (
                        <ReferenceDot key={`anom-${ap.id}`} x={d.fecha} y={d.valor} r={7}
                          fill={overlays.anomalias ? sevColor : 'transparent'}
                          stroke={overlays.anomalias ? 'var(--void)' : 'transparent'}
                          strokeWidth={2}
                        />
                      )
                    })}

                    {/* PyOD dots — fill controlled by overlay */}
                    {pyodPoints.map(ap => {
                      const d = chartData[ap.dataIdx]
                      if (!d || d.valor == null) return null
                      return (
                        <ReferenceDot key={`pyod-${ap.id}`} x={d.fecha} y={d.valor} r={5}
                          fill={overlays.pyod ? '#E8C4A0' : 'transparent'}
                          stroke={overlays.pyod ? 'var(--void)' : 'transparent'}
                          strokeWidth={2}
                        />
                      )
                    })}
                  </AreaChart>
                </ResponsiveContainer>
              )}

              {/* Prophet future info */}
              {overlays.prophet && hayFuturos && prophetBand && (
                <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 14, background: 'rgba(124,181,232,0.07)', border: '1px solid rgba(124,181,232,0.2)', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7CB5E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#7CB5E8' }}>Predicción futura (Prophet)</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                    Valor esperado: <strong style={{ color: '#7CB5E8' }}>{cfg?.unit}{prophetBand.yhat}</strong>
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                    Rango 90%: <strong style={{ color: 'var(--text)' }}>{cfg?.unit}{prophetBand.yhat_lower} — {cfg?.unit}{prophetBand.yhat_upper}</strong>
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--muted)', opacity: 0.7 }}>
                    Basado en {prophetBand.datos_entrenamiento} registros históricos
                  </span>
                </div>
              )}
            </GlowingCard>
          </FadeContent>

          {/* Detection alerts for this KPI */}
          {overlays.anomalias && alertasDelKpi.length > 0 && (
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto' }}>
                  {alertasDelKpi.slice(0, 5).map(a => {
                    const sevColor = a.severidad === 'critica' ? '#E8A0C4' : a.severidad === 'alta' ? '#9B8EC4' : a.severidad === 'media' ? '#C4B5E8' : '#A0C4B5'
                    const d = a.detalle_deteccion
                    const isExpanded = alertaDetalleId === a.id
                    return (
                      <motion.div key={a.id} layout style={{ padding: '12px 14px', borderRadius: 14, background: `${sevColor}08`, border: `1px solid ${sevColor}25` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: sevColor, boxShadow: `0 0 6px ${sevColor}` }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: sevColor, padding: '2px 8px', borderRadius: 10, background: `${sevColor}15` }}>{a.severidad}</span>
                          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{a.metodo_deteccion?.startsWith('ensemble:') ? 'Ensemble' : a.metodo_deteccion || 'Estadístico'}</span>
                          {d?.ensemble && d.ensemble.metodos_disponibles.length > 1 && (
                            <div style={{ display: 'flex', gap: 4 }}>
                              {d.ensemble.metodos_disponibles.map(m => {
                                const voted = d.ensemble!.metodos_que_flaggearon.includes(m)
                                const mColor = m === 'estadistico' ? '#A0C4B5' : m === 'prophet' ? '#7CB5E8' : '#E8C4A0'
                                return (
                                  <span key={m} title={`${m}: ${voted ? 'anomalía' : 'normal'}`} style={{ fontSize: 9, fontWeight: 700, width: 18, height: 18, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: voted ? `${mColor}25` : 'rgba(255,255,255,0.03)', color: voted ? mColor : 'var(--muted)', border: `1px solid ${voted ? mColor + '40' : 'var(--border)'}` }}>
                                    {m === 'estadistico' ? 'σ' : m === 'prophet' ? 'P' : 'F'}
                                  </span>
                                )
                              })}
                            </div>
                          )}
                          <motion.button onClick={() => setAlertaDetalleId(isExpanded ? null : a.id)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            style={{ marginLeft: 'auto', width: 22, height: 22, borderRadius: 11, background: isExpanded ? 'rgba(155,142,196,0.2)' : 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isExpanded ? '#9B8EC4' : 'var(--muted)' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                            </svg>
                          </motion.button>
                        </div>
                        <div style={{ display: 'flex', gap: 14, fontSize: 12, flexWrap: 'wrap' }}>
                          <span style={{ color: 'var(--muted)' }}>Detectado: <strong style={{ color: sevColor }}>{a.valor_detectado?.toFixed(1)}</strong></span>
                          <span style={{ color: 'var(--muted)' }}>Esperado: <strong style={{ color: 'var(--text)' }}>{a.valor_esperado?.toFixed(1)}</strong></span>
                          <span style={{ color: sevColor, fontWeight: 600 }}>{a.desviacion > 0 ? '+' : ''}{a.desviacion?.toFixed(1)}%</span>
                          <span style={{ color: 'var(--muted)', marginLeft: 'auto', fontSize: 11 }}>{new Date(a.creada_en).toLocaleString('es-CR')}</span>
                        </div>
                        {isExpanded && d && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {d.estadistico && (
                              <div style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(160,196,181,0.08)', border: '1px solid rgba(160,196,181,0.2)', fontSize: 12 }}>
                                <p style={{ fontWeight: 700, color: '#A0C4B5', marginBottom: 3 }}>σ Estadístico — {d.estadistico.es_anomalia ? '⚠ Anomalía' : '✓ Normal'}</p>
                                <p style={{ color: 'var(--muted)', lineHeight: 1.5 }}>
                                  Desviación: <strong style={{ color: '#A0C4B5' }}>{d.estadistico.desviacion}%</strong> (umbral: {d.estadistico.umbral}%) ·{' '}
                                  Esperado: {d.estadistico.valor_esperado} · {d.estadistico.datos_usados} datos hist.
                                </p>
                              </div>
                            )}
                            {d.prophet && (
                              <div style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(124,181,232,0.08)', border: '1px solid rgba(124,181,232,0.2)', fontSize: 12 }}>
                                <p style={{ fontWeight: 700, color: '#7CB5E8', marginBottom: 3 }}>P Prophet — {d.prophet.es_anomalia ? '⚠ Fuera del rango' : '✓ Dentro del rango'}</p>
                                <p style={{ color: 'var(--muted)', lineHeight: 1.5 }}>
                                  Predicción: <strong style={{ color: '#7CB5E8' }}>{d.prophet.yhat}</strong> ·
                                  Rango IC {d.prophet.intervalo_confianza}%: [{d.prophet.yhat_lower} — {d.prophet.yhat_upper}] ·
                                  Desv: {d.prophet.desviacion?.toFixed(1)}% · {d.prophet.datos_entrenamiento} registros de entrenamiento
                                </p>
                              </div>
                            )}
                            {d.pyod && (
                              <div style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(232,196,160,0.08)', border: '1px solid rgba(232,196,160,0.2)', fontSize: 12 }}>
                                <p style={{ fontWeight: 700, color: '#E8C4A0', marginBottom: 3 }}>F Isolation Forest — {d.pyod.es_anomalia ? '⚠ Outlier' : '✓ Normal'}</p>
                                <p style={{ color: 'var(--muted)', lineHeight: 1.5 }}>
                                  Score: <strong style={{ color: d.pyod.es_outlier ? '#E8A0C4' : '#A0C4B5' }}>{d.pyod.anomaly_score}</strong> (umbral: {d.pyod.threshold}) ·
                                  Media hist.: {d.pyod.media_historica} ± {d.pyod.std_historica?.toFixed(1)}
                                </p>
                              </div>
                            )}
                            {a.recomendacion && (
                              <div style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(155,142,196,0.08)', border: '1px solid rgba(155,142,196,0.2)', fontSize: 12 }}>
                                <p style={{ fontWeight: 700, color: '#C4B5E8', fontSize: 11, marginBottom: 4 }}>Recomendación IA</p>
                                <p style={{ color: 'var(--text)', opacity: 0.85, lineHeight: 1.6 }}>{a.recomendacion}</p>
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

          {/* Stats grid */}
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
                  const hasAlert = alertasKpi.some(a => a.tipo_kpi === tipo && a.estado === 'activa')
                  return (
                    <motion.div key={tipo} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.03 }}
                      onClick={() => setKpiSeleccionado(tipo)} whileHover={{ scale: 1.03 }}
                      style={{ padding: '14px 16px', borderRadius: 16, cursor: 'pointer', background: isSelected ? `${c.color}15` : 'var(--glass)', backdropFilter: 'blur(20px)', border: `1px solid ${isSelected ? c.color + '40' : hasAlert ? 'rgba(232,160,196,0.25)' : 'var(--border)'}`, transition: 'all 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{c.label}</p>
                        <p style={{ fontSize: 11, color: up ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{up ? '↑' : '↓'}{Math.abs(Number(diff))}%</p>
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
      )}

      {/* ── GRID VIEW ── */}
      {vista === 'grid' && (
        <FadeContent direction="up" delay={0.1} duration={0.4}>
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Overlays activos:</p>
            <OverlayBtn label="Prophet" active={overlays.prophet} color="#7CB5E8" onClick={() => toggleOverlay('prophet')} />
            <OverlayBtn label="PyOD" active={overlays.pyod} color="#E8C4A0" onClick={() => toggleOverlay('pyod')} />
            <OverlayBtn label="Umbral" active={overlays.umbral} color="#E8A0C4" onClick={() => toggleOverlay('umbral')} />
            <OverlayBtn label="Anomalías" active={overlays.anomalias} color="#C4B5E8" onClick={() => toggleOverlay('anomalias')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {Object.keys(kpiConfig).map((tipo, i) => {
              const datos = kpiData[tipo] || []
              const hasAlert = alertasKpi.some(a => a.tipo_kpi === tipo && a.estado === 'activa')
              const c = kpiConfig[tipo]
              return (
                <motion.div key={tipo}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => { setKpiSeleccionado(tipo); setVista('individual') }}
                  style={{
                    padding: '20px', borderRadius: 22, cursor: 'pointer',
                    background: 'var(--glass)', backdropFilter: 'blur(20px)',
                    border: `1px solid ${hasAlert ? 'rgba(232,160,196,0.3)' : c.color + '25'}`,
                    transition: 'all 0.2s',
                  }}
                  whileHover={{ scale: 1.01, borderColor: c.color + '60' } as any}
                  whileTap={{ scale: 0.99 }}
                >
                  <MiniKpiChart tipo={tipo} datos={datos} alertas={alertasKpi} overlays={overlays} />
                </motion.div>
              )
            })}
          </div>
        </FadeContent>
      )}

      {/* ── TODAS VIEW (normalized) ── */}
      {vista === 'todas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <FadeContent direction="up" delay={0.1} duration={0.4}>
            <GlowingCard className="p-6 sm:p-8 lg:p-10">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                    Todos los KPIs — Vista normalizada
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                    Cada KPI se normaliza como <strong style={{ color: 'var(--text)' }}>% de desviación respecto a su propia media</strong>.
                    Permite comparar tendencias independientemente de la escala ($, %, puntos).
                    La línea 0% es el promedio histórico de cada KPI.
                  </p>
                </div>
                <span style={{ fontSize: 14, color: 'var(--muted)', flexShrink: 0 }}>Últimas {horas}h</span>
              </div>

              {datosNormalizados.length === 0 ? (
                <div style={{ height: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                  <p style={{ color: 'var(--muted)', fontSize: 15 }}>Sin datos en este rango.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={460}>
                  <LineChart data={datosNormalizados} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(155,142,196,0.08)" />
                    <XAxis dataKey="fecha" stroke="var(--muted)" tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                    <YAxis stroke="var(--muted)" tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}%`} />
                    <Tooltip content={<NormalizedTooltip />} />
                    <Legend wrapperStyle={{ color: 'var(--muted)', fontSize: 12, paddingTop: 20 }} />
                    {/* Zero reference line */}
                    <ReferenceLine y={0} stroke="rgba(155,142,196,0.3)" strokeWidth={1.5} strokeDasharray="6 3"
                      label={{ value: 'Media base', position: 'insideLeft', fill: 'rgba(155,142,196,0.6)', fontSize: 10 }} />
                    {/* Alert zones */}
                    <ReferenceArea y1={35} y2={200} fill="rgba(232,160,196,0.05)" fillOpacity={1} />
                    <ReferenceArea y1={-200} y2={-35} fill="rgba(232,160,196,0.05)" fillOpacity={1} />
                    {Object.entries(kpiConfig)
                      .filter(([t]) => kpiData[t]?.length > 0)
                      .map(([t, c]) => (
                        <Line key={t} type="monotone" dataKey={c.label}
                          stroke={c.color} strokeWidth={2} dot={false}
                          activeDot={{ r: 5, fill: c.color, stroke: 'var(--void)', strokeWidth: 2 }}
                        />
                      ))
                    }
                  </LineChart>
                </ResponsiveContainer>
              )}

              <div style={{ marginTop: 14, padding: '10px 16px', borderRadius: 12, background: 'rgba(155,142,196,0.05)', border: '1px solid rgba(155,142,196,0.12)', display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 11 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)' }}>
                  <div style={{ width: 14, height: 8, borderRadius: 2, background: 'rgba(232,160,196,0.15)' }} />
                  Zona de alerta (&gt;35% desviación)
                </span>
                <span style={{ color: 'var(--muted)' }}>
                  La escala es <strong style={{ color: 'var(--text)' }}>porcentaje sobre/bajo la media de cada KPI</strong> — no son valores absolutos.
                </span>
              </div>
            </GlowingCard>
          </FadeContent>

          {/* KPI summary row */}
          <FadeContent direction="up" delay={0.15} duration={0.4}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {Object.entries(kpiConfig).map(([tipo, c], i) => {
                const datos = kpiData[tipo] || []
                const ultimo = datos.length > 0 ? datos[datos.length - 1].valor : 0
                const penultimo = datos.length > 1 ? datos[datos.length - 2].valor : 0
                const diff = penultimo !== 0 ? ((ultimo - penultimo) / penultimo * 100).toFixed(1) : '0'
                const up = ultimo >= penultimo
                const alertCount = alertasKpi.filter(a => a.tipo_kpi === tipo && a.estado === 'activa').length
                return (
                  <motion.div key={tipo} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.04 }}
                    onClick={() => { setKpiSeleccionado(tipo); setVista('individual') }}
                    whileHover={{ scale: 1.03 }} style={{ padding: '14px 16px', borderRadius: 16, cursor: 'pointer', background: 'var(--glass)', backdropFilter: 'blur(20px)', border: `1px solid ${alertCount > 0 ? 'rgba(232,160,196,0.3)' : c.color + '25'}`, transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{c.label}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {alertCount > 0 && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 8, background: 'rgba(232,160,196,0.2)', color: '#E8A0C4' }}>{alertCount}</span>
                        )}
                        <p style={{ fontSize: 11, color: up ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{up ? '↑' : '↓'}{Math.abs(Number(diff))}%</p>
                      </div>
                    </div>
                    <p className="font-display" style={{ fontSize: 20, fontWeight: 700, color: c.color }}>
                      {c.unit}<CountUp to={ultimo} decimals={1} duration={0.8} />
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </FadeContent>
        </div>
      )}
    </>
  )
}
