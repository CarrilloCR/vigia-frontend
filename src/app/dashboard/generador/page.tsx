'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../lib/axios'
import { useAuthStore } from '../../../store/auth'
import { useToastStore } from '../../../store/toast'
import GlowingCard from '../../../components/reactbits/GlowingCard'
import CountUp from '../../../components/reactbits/CountUp'
import SpotlightCard from '../../../components/reactbits/SpotlightCard'
import GradientText from '../../../components/reactbits/GradientText'
import TiltedCard from '../../../components/reactbits/TiltedCard'
import SedeSelector from '../../../components/ui/SedeSelector'
import HisMirror from '../../../components/HisMirror'
import StarBorder from '../../../components/reactbits/StarBorder'
import GlareHover from '../../../components/reactbits/GlareHover'

const kpiConfig: Record<string, { label: string; color: string; unit: string }> = {
  tasa_cancelacion:  { label: 'Cancelación',  color: '#FF6B6B', unit: '%' },
  tasa_noshow:       { label: 'No-Show',      color: '#4A9EF0', unit: '%' },
  ingresos_dia:      { label: 'Ingresos',     color: '#00D6B2', unit: '$' },
  ocupacion_agenda:  { label: 'Ocupación',    color: '#B06EF5', unit: '%' },
  ticket_promedio:   { label: 'Ticket',       color: '#00D6B2', unit: '$' },
  pacientes_nuevos:  { label: 'Pac. Nuevos',  color: '#00A88A', unit: '' },
  retencion_90:      { label: 'Retención',    color: '#00D6B2', unit: '%' },
  nps:               { label: 'NPS',          color: '#4A9EF0', unit: '' },
  citas_reagendadas: { label: 'Reagendadas',  color: '#FFD166', unit: '' },
}

interface RegistroKPI {
  id: number
  tipo: string
  valor: number
  fecha_hora: string
  sede: number | null
  medico: number | null
  periodo: string
}

const PulseDot = ({ color = '#00D6B2' }: { color?: string }) => (
  <motion.div
    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
    transition={{ duration: 1.6, repeat: Infinity }}
    style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 12px ${color}` }}
  />
)

const PlayIcon = () => (
  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" /></svg>
)
const PauseIcon = () => (
  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
)
const RefreshIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)
const ActivityIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
)
const DatabaseIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
  </svg>
)
const ClockIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

function relativeTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 5) return 'ahora'
  if (diff < 60) return `hace ${Math.floor(diff)}s`
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
  return `hace ${Math.floor(diff / 86400)}d`
}

function formatValor(tipo: string, valor: number) {
  const cfg = kpiConfig[tipo]
  if (!cfg) return valor.toFixed(2)
  if (cfg.unit === '$') return `$${valor.toFixed(2)}`
  if (cfg.unit === '%') return `${valor.toFixed(1)}%`
  return valor.toFixed(1)
}

export default function GeneradorPage() {
  const { user } = useAuthStore()
  const toast = useToastStore()
  const router = useRouter()
  const { activeClinicaId } = useAuthStore(); const clinicaId = activeClinicaId || 1
  const [hisConn, setHisConn] = useState<any>(null)
  useEffect(() => {
    api.get(`/integraciones/?clinica=${clinicaId}`)
      .then(res => setHisConn((res.data.results || res.data).find((i: any) => i.tipo === 'his') || null))
      .catch(() => {})
  }, [clinicaId])
  const [selectedSede, setSelectedSede] = useState<number | null>(null)

  const [registros, setRegistros] = useState<RegistroKPI[]>([])
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(true)
  const [generadorActivo, setGeneradorActivo] = useState<boolean | null>(null)
  const [togglingGenerador, setTogglingGenerador] = useState(false)
  const [horas, setHoras] = useState(6)
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null)
  const [nuevosIds, setNuevosIds] = useState<Set<number>>(new Set())
  const prevIdsRef = useRef<Set<number>>(new Set())

  const fetchRegistros = async () => {
    try {
      const res = await api.get(`/kpis/?clinica=${clinicaId}&horas=${horas}${selectedSede ? `&sede=${selectedSede}` : ''}`)
      const data: RegistroKPI[] = res.data.results || res.data
      const ordenado = [...data].sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())

      // Detectar nuevos registros (ids que no estaban antes)
      const nuevosSet = new Set<number>()
      const prev = prevIdsRef.current
      if (prev.size > 0) {
        ordenado.forEach(r => { if (!prev.has(r.id)) nuevosSet.add(r.id) })
      }
      prevIdsRef.current = new Set(ordenado.map(r => r.id))

      setRegistros(ordenado)
      setUltimaActualizacion(new Date())

      if (nuevosSet.size > 0) {
        setNuevosIds(nuevosSet)
        setTimeout(() => setNuevosIds(new Set()), 3500)
      }
    } catch {
      toast.error('Error', 'No se pudieron cargar los registros del generador.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Fetch clinica state to know if generador is on
    api.get(`/clinicas/${clinicaId}/`).then(res => setGeneradorActivo(res.data.generador_activo)).catch(() => {})
    fetchRegistros()
  }, [horas, selectedSede])

  const handleToggleGenerador = async () => {
    setTogglingGenerador(true)
    try {
      const res = await api.post('/generador/toggle/', { clinica_id: clinicaId })
      setGeneradorActivo(res.data.generador_activo)
      toast.success(
        res.data.generador_activo ? 'Generador activado' : 'Generador detenido',
        res.data.generador_activo ? 'El backend volverá a producir datos cada 5 min.' : 'El backend dejará de generar datos en el próximo ciclo.'
      )
    } catch {
      toast.error('Error', 'No se pudo cambiar el estado del generador.')
    } finally { setTogglingGenerador(false) }
  }

  useEffect(() => {
    if (!live) return
    const id = setInterval(fetchRegistros, 15000)
    return () => clearInterval(id)
  }, [live, horas])

  // Force re-render every 10s to update relative times
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 10000)
    return () => clearInterval(id)
  }, [])

  const registrosFiltrados = useMemo(
    () => filtroTipo === 'todos' ? registros : registros.filter(r => r.tipo === filtroTipo),
    [registros, filtroTipo]
  )

  const conteoPorTipo = useMemo(() => {
    const c: Record<string, number> = {}
    registros.forEach(r => { c[r.tipo] = (c[r.tipo] || 0) + 1 })
    return c
  }, [registros])

  const tiposPresentes = useMemo(() => Object.keys(conteoPorTipo), [conteoPorTipo])

  const ultimoRegistro = registros[0]

  // Integración real: con un HIS conectado, la página es el ESPEJO en vivo del HIS
  // dentro de Vigía (solo lectura), no el generador de datos falsos.
  if (hisConn) {
    return (
      <div>
        <HisMirror clinicaId={clinicaId} />
      </div>
    )
  }

  return (
    <div>
      {/* Fuentes de datos — reemplaza al generador en producción */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 24, padding: '18px 22px', borderRadius: 18, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ maxWidth: 560 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h2 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Fuente de datos</h2>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600,
              background: hisConn ? 'rgba(0,214,178,0.12)' : 'rgba(245,197,24,0.12)',
              color: hisConn ? 'var(--primary)' : '#E8C490',
              border: `1px solid ${hisConn ? 'rgba(0,214,178,0.25)' : 'rgba(245,197,24,0.25)'}` }}>
              {hisConn ? 'HIS conectado' : 'Sin fuente real'}
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            {hisConn
              ? <>Los datos provienen de tu sistema externo <strong>{hisConn.nombre}</strong>. El generador de abajo es solo para pruebas.</>
              : <>En producción los datos vienen de tu <strong>sistema HIS/ERP</strong> o de <strong>CSV</strong>, no del generador. Conecta una fuente para analizar datos reales.</>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <motion.button onClick={() => router.push('/dashboard/configuracion')}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '11px 20px', borderRadius: 12, border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg, var(--primary), var(--accent))', whiteSpace: 'nowrap' }}>
            {hisConn ? 'Gestionar integración' : 'Conectar fuente de datos'}
          </motion.button>
        </div>
      </motion.div>

      {/* Encabezado de página */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <PulseDot color={generadorActivo ? '#00D6B2' : '#FF6B6B'} />
            <h1 className="font-display" style={{ fontSize: 32, fontWeight: 800 }}>
              <GradientText text={hisConn ? 'Datos en Vivo' : 'Generador en Vivo'} className="font-display" />
            </h1>
          </div>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>
            {hisConn
              ? <>Flujo de KPIs desde tu sistema externo <strong style={{ color: 'var(--primary)' }}>{hisConn.nombre}</strong>, mapeados por IA a Vigía y sincronizados automáticamente.</>
              : <>Flujo de datos producido por <code style={{ background: 'rgba(0,214,178,0.1)', padding: '2px 8px', borderRadius: 6, color: 'var(--primary)' }}>generador.py</code> cada 5 minutos en Celery Beat</>}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SedeSelector clinicaId={clinicaId} value={selectedSede} onChange={setSelectedSede} compact />

          {/* Toggle generador backend */}
          <motion.button
            onClick={handleToggleGenerador}
            disabled={togglingGenerador || generadorActivo === null}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 500,
              background: generadorActivo ? 'rgba(0,214,178,0.15)' : 'rgba(255,107,107,0.1)',
              border: `1px solid ${generadorActivo ? 'rgba(0,214,178,0.35)' : 'rgba(255,107,107,0.3)'}`,
              color: generadorActivo ? 'var(--success)' : 'var(--danger)',
              cursor: togglingGenerador || generadorActivo === null ? 'not-allowed' : 'pointer',
              backdropFilter: 'blur(20px)',
              opacity: togglingGenerador ? 0.6 : 1,
            }}>
            {togglingGenerador
              ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }} />
              : generadorActivo ? <PauseIcon /> : <PlayIcon />
            }
            {generadorActivo ? 'Generador ON' : 'Generador OFF'}
          </motion.button>

          {/* Toggle live polling */}
          <motion.button onClick={() => setLive(!live)}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 500,
              background: live ? 'rgba(0,214,178,0.15)' : 'var(--glass)',
              border: `1px solid ${live ? 'rgba(0,214,178,0.3)' : 'var(--border)'}`,
              color: live ? 'var(--primary)' : 'var(--muted)',
              cursor: 'pointer', backdropFilter: 'blur(20px)',
            }}>
            {live ? <PauseIcon /> : <PlayIcon />}
            {live ? 'Vista en vivo' : 'Vista pausada'}
          </motion.button>

          <motion.button onClick={fetchRegistros}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px', borderRadius: 12, fontSize: 13, fontWeight: 500,
              background: 'var(--glass)', border: '1px solid var(--border)',
              color: 'var(--muted)', cursor: 'pointer', backdropFilter: 'blur(20px)',
            }}>
            <RefreshIcon /> Actualizar
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: `Registros (${horas}h)`, value: registros.length, color: '#00D6B2', icon: <DatabaseIcon /> },
          { label: 'Tipos de KPI', value: tiposPresentes.length, color: '#4A9EF0', icon: <ActivityIcon /> },
          { label: 'Último registro', text: ultimoRegistro ? relativeTime(ultimoRegistro.fecha_hora) : '—', color: '#00D6B2', icon: <ClockIcon /> },
          { label: 'Actualizado', text: ultimaActualizacion ? ultimaActualizacion.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—', color: '#FF6B6B', icon: <RefreshIcon /> },
        ].map((s, i) => (
          <div key={s.label ?? i}>
            <TiltedCard tiltAmount={6} scaleOnHover={1.03}>
              <div style={{
                padding: 20, borderRadius: 20,
                background: 'var(--glass)', backdropFilter: 'blur(20px)',
                border: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, color: s.color }}>
                  {s.icon}
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{s.label}</span>
                </div>
                <p className="font-display" style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>
                  {s.value !== undefined ? <CountUp to={s.value} duration={0.8} /> : s.text}
                </p>
              </div>
            </TiltedCard>
          </div>
        ))}
      </div>

      {/* Controles de filtro */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        {/* Rango de horas */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, padding: 3 }}>
          {[1, 6, 24, 72].map(h => (
            <motion.button key={h} onClick={() => setHoras(h)} whileTap={{ scale: 0.97 }}
              style={{
                padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500,
                cursor: 'pointer', border: 'none', position: 'relative', overflow: 'hidden',
                background: 'transparent', color: horas === h ? 'white' : 'var(--muted)',
              }}>
              {horas === h && (
                <motion.div layoutId="horasTab"
                  style={{ position: 'absolute', inset: 0, borderRadius: 10, background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} />
              )}
              <span style={{ position: 'relative', zIndex: 1 }}>{h}h</span>
            </motion.button>
          ))}
        </div>

        {/* Filtros de tipo */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <motion.button onClick={() => setFiltroTipo('todos')}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{
              padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              cursor: 'pointer', border: '1px solid',
              background: filtroTipo === 'todos' ? 'rgba(0,214,178,0.2)' : 'rgba(255,255,255,0.03)',
              color: filtroTipo === 'todos' ? 'var(--primary)' : 'var(--muted)',
              borderColor: filtroTipo === 'todos' ? 'rgba(0,214,178,0.4)' : 'var(--border)',
            }}>
            Todos ({registros.length})
          </motion.button>
          {tiposPresentes.map(tipo => {
            const cfg = kpiConfig[tipo]
            if (!cfg) return null
            const active = filtroTipo === tipo
            return (
              <motion.button key={tipo} onClick={() => setFiltroTipo(tipo)}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{
                  padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  cursor: 'pointer', border: '1px solid',
                  background: active ? `${cfg.color}22` : 'rgba(255,255,255,0.03)',
                  color: active ? cfg.color : 'var(--muted)',
                  borderColor: active ? `${cfg.color}55` : 'var(--border)',
                }}>
                <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: cfg.color, marginRight: 6, verticalAlign: 'middle' }} />
                {cfg.label} ({conteoPorTipo[tipo]})
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Lista de registros */}
      <div>
      <SpotlightCard className="p-4 sm:p-6" spotlightColor="rgba(0,214,178,0.12)" from="top">
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--muted)' }}>
            Cargando registros...
          </div>
        ) : registrosFiltrados.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--muted)' }}>
            <DatabaseIcon />
            <p style={{ marginTop: 12 }}>Sin registros en este rango</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '62vh', overflowY: 'auto', paddingRight: 6 }}>
            <AnimatePresence initial={false}>
              {registrosFiltrados.map(r => {
                const cfg = kpiConfig[r.tipo]
                const esNuevo = nuevosIds.has(r.id)
                return (
                  <motion.div
                    key={r.id}
                    layout
                    initial={esNuevo ? { opacity: 0, y: -20, scale: 0.95 } : { opacity: 0 }}
                    animate={{
                      opacity: 1, y: 0, scale: 1,
                      backgroundColor: esNuevo ? `${cfg?.color || '#00D6B2'}1A` : 'rgba(255,255,255,0.02)',
                    }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr 140px 110px',
                      alignItems: 'center', gap: 16,
                      padding: '14px 18px', borderRadius: 14,
                      border: `1px solid ${esNuevo ? (cfg?.color || '#00D6B2') + '40' : 'var(--border)'}`,
                    }}>
                    {/* Timestamp */}
                    <div>
                      <p style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'monospace' }}>
                        {new Date(r.fecha_hora).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </p>
                      <p style={{ fontSize: 10, color: 'var(--muted)', opacity: 0.6, marginTop: 2 }}>
                        {new Date(r.fecha_hora).toLocaleDateString('es-CR', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>

                    {/* Tipo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: cfg?.color || '#00D6B2',
                        boxShadow: `0 0 10px ${cfg?.color || '#00D6B2'}`,
                      }} />
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                          {cfg?.label || r.tipo}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--muted)', opacity: 0.7 }}>
                          {r.tipo} · periodo: {r.periodo}
                        </p>
                      </div>
                    </div>

                    {/* Valor */}
                    <div style={{ textAlign: 'right' }}>
                      <p className="font-display" style={{
                        fontSize: 20, fontWeight: 800,
                        color: cfg?.color || '#00D6B2',
                      }}>
                        {formatValor(r.tipo, r.valor)}
                      </p>
                    </div>

                    {/* Relativo */}
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: 11, color: esNuevo ? (cfg?.color || '#00D6B2') : 'var(--muted)',
                        padding: '4px 10px', borderRadius: 12,
                        background: esNuevo ? `${cfg?.color || '#00D6B2'}1A` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${esNuevo ? (cfg?.color || '#00D6B2') + '40' : 'var(--border)'}`,
                        fontWeight: 500,
                      }}>
                        {esNuevo ? '· nuevo' : relativeTime(r.fecha_hora)}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </SpotlightCard>
      </div>
    </div>
  )
}
