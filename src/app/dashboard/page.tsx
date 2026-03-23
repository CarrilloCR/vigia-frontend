'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../lib/axios'
import { Alerta } from '../../types'
import { useAuthStore } from '../../store/auth'
import Aurora from '../../components/reactbits/Aurora'
import GlowingCard from '../../components/reactbits/GlowingCard'
import ThemeToggle from '../../components/ui/ThemeToggle'

const kpiLabel: Record<string, string> = {
  tasa_cancelacion: 'Cancelación',
  tasa_noshow: 'No-Show',
  ingresos_dia: 'Ingresos',
  ocupacion_agenda: 'Ocupación',
  ticket_promedio: 'Ticket Promedio',
  pacientes_nuevos: 'Pac. Nuevos',
  retencion_90: 'Retención 90d',
  nps: 'NPS',
  citas_reagendadas: 'Reagendadas',
}

const sevConfig: Record<string, { label: string; color: string; dot: string }> = {
  baja:    { label: 'Baja',    color: '#A0C4B5', dot: 'rgba(160,196,181,0.9)' },
  media:   { label: 'Media',   color: '#C4B5E8', dot: 'rgba(196,181,232,0.9)' },
  alta:    { label: 'Alta',    color: '#9B8EC4', dot: 'rgba(155,142,196,0.9)' },
  critica: { label: 'Crítica', color: '#E8A0C4', dot: 'rgba(232,160,196,0.9)' },
}

const Icon = ({ d, size = 15 }: { d: string; size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d={d} />
  </svg>
)

const ShieldIcon = () => <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={18} />
const BoltIcon   = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)
const BellIcon   = () => <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" />
const LogoutIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const CheckIcon  = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const ThumbUpIcon = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
  </svg>
)
const ThumbDownIcon = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
    <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
  </svg>
)
const ArrowRightIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
)
const CheckCircleIcon = () => (
  <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

interface Medico {
  id: number
  nombre: string
  apellido: string
  especialidad: string
}

function MedicosList({ clinicaId }: { clinicaId: number }) {
  const [medicos, setMedicos] = useState<Medico[]>([])
  const router = useRouter()

  useEffect(() => {
    api.get(`/medicos/?clinica=${clinicaId}`).then(res => {
      setMedicos(res.data.results || res.data)
    }).catch(() => {})
  }, [clinicaId])

  if (medicos.length === 0) return (
    <p className="text-sm text-center py-6" style={{ color: 'var(--muted)' }}>
      Sin médicos registrados
    </p>
  )

  return (
    <div className="space-y-2">
      {medicos.map((m, i) => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          onClick={() => router.push(`/dashboard/medico/${m.id}`)}
          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}
          whileHover={{ background: 'rgba(155,142,196,0.08)' } as any}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
          >
            {m.nombre[0]}{m.apellido[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
              Dr. {m.nombre} {m.apellido}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{m.especialidad}</p>
          </div>
          <span style={{ color: 'var(--muted)' }}><ArrowRightIcon /></span>
        </motion.div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)
  const [motorLoading, setMotorLoading] = useState(false)
  const [notifPendientes, setNotifPendientes] = useState(0)
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()
  const clinicaId = user?.clinica_id || 1

  useEffect(() => {
    fetchAlertas()
    fetchNotifs()
  }, [])

  const fetchAlertas = async () => {
    try {
      const res = await api.get('/alertas/?estado=activa')
      setAlertas(res.data.results || res.data)
    } catch { } finally { setLoading(false) }
  }

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/notificaciones/?estado=pendiente')
      setNotifPendientes((res.data.results || res.data).length)
    } catch { }
  }

  const ejecutarMotor = async () => {
    setMotorLoading(true)
    try {
      await api.post('/motor/ejecutar/', { clinica_id: clinicaId })
      await fetchAlertas()
      await fetchNotifs()
    } catch { } finally { setMotorLoading(false) }
  }

  const marcarRevisada = async (id: number) => {
    try {
      await api.post(`/alertas/${id}/marcar_revisada/`)
      setAlertas(prev => prev.filter(a => a.id !== id))
    } catch { }
  }

  const marcarFeedback = async (alertaId: number, fueUtil: boolean) => {
    try {
      await api.post('/feedbacks/', { alerta: alertaId, usuario: user?.id || 1, fue_util: fueUtil, comentario: '' })
    } catch { }
  }

  const handleLogout = async () => {
    try {
      const { refreshToken } = useAuthStore.getState()
      await api.post('/auth/logout/', { refresh: refreshToken })
    } catch { } finally {
      clearAuth()
      router.push('/')
    }
  }

  const stats = [
    { label: 'Total activas',  value: alertas.length,                                               color: '#9B8EC4' },
    { label: 'Críticas',       value: alertas.filter(a => a.severidad === 'critica').length,         color: '#E8A0C4' },
    { label: 'Altas',          value: alertas.filter(a => a.severidad === 'alta').length,            color: '#C4B5E8' },
    { label: 'Medias / Bajas', value: alertas.filter(a => ['media','baja'].includes(a.severidad)).length, color: '#A0C4B5' },
  ]

  return (
    <main className="min-h-screen relative" style={{ backgroundColor: 'var(--void)' }}>

      {/* Fondo */}
      <div className="fixed inset-0 pointer-events-none">
        <Aurora colorStops={['#9B8EC4','#7C6FBF','#C4B5E8']} amplitude={0.5} speed={0.15} />
      </div>
      <div className="fixed inset-0 pointer-events-none" style={{
        opacity: 0.03,
        backgroundImage: 'linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <div className="relative z-10 px-6 py-5 max-w-7xl mx-auto">

        {/* HEADER */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-7"
        >
          {/* Brand */}
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
              animate={{ boxShadow: ['0 0 12px rgba(155,142,196,0.3)','0 0 28px rgba(155,142,196,0.55)','0 0 12px rgba(155,142,196,0.3)'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <ShieldIcon />
            </motion.div>
            <div>
              <p className="font-bold font-display text-base leading-none" style={{ color: 'var(--text)' }}>Vigía</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{user?.clinica_nombre || 'Panel'}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Motor */}
            <motion.button
              onClick={ejecutarMotor}
              disabled={motorLoading}
              whileHover={{ scale: motorLoading ? 1 : 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #7AB5A3, var(--success))', boxShadow: '0 4px 16px rgba(160,196,181,0.25)' }}
            >
              {motorLoading
                ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                : <BoltIcon />}
              {motorLoading ? 'Analizando...' : 'Ejecutar análisis'}
            </motion.button>

            {/* Notificaciones */}
            <motion.button
              onClick={() => router.push('/dashboard/notificaciones')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium glass"
              style={{ color: 'var(--text)' }}
            >
              <BellIcon />
              <span>Notificaciones</span>
              <AnimatePresence>
                {notifPendientes > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full text-xs font-bold text-white flex items-center justify-center"
                    style={{ background: 'var(--danger)', boxShadow: '0 0 10px rgba(232,160,196,0.5)' }}
                  >
                    {notifPendientes}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <ThemeToggle />

            {/* Logout */}
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium glass"
              style={{ color: 'var(--muted)' }}
            >
              <LogoutIcon />
              Salir
            </motion.button>

            <div className="hidden xl:block text-right ml-1">
              <p className="text-sm font-medium capitalize" style={{ color: 'var(--text)' }}>
                {new Date().toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Panel de control</p>
            </div>
          </div>
        </motion.header>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="p-5 rounded-2xl glass"
            >
              <p className="text-3xl font-bold font-display mb-1" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{s.label}</p>
              <div className="mt-3 h-1 rounded-full" style={{ background: `${s.color}25` }}>
                <div className="h-full rounded-full" style={{ width: s.value > 0 ? '100%' : '0%', background: s.color, transition: 'width 0.8s ease' }} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-3 gap-5">

          {/* Alertas — 2/3 */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
              <GlowingCard className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold font-display text-base" style={{ color: 'var(--text)' }}>Alertas Activas</h2>
                  <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: 'rgba(155,142,196,0.12)', color: 'var(--primary)' }}>
                    {alertas.length} activas
                  </span>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => (
                      <motion.div key={i} animate={{ opacity: [0.3,0.6,0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i*0.2 }}
                        className="h-24 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }} />
                    ))}
                  </div>
                ) : alertas.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                    <motion.div animate={{ y: [0,-5,0] }} transition={{ duration: 3, repeat: Infinity }} className="flex justify-center mb-4" style={{ color: 'var(--success)' }}>
                      <CheckCircleIcon />
                    </motion.div>
                    <p className="font-semibold font-display" style={{ color: 'var(--text)' }}>Todo en orden</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>No hay alertas activas en este momento</p>
                  </motion.div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                    <AnimatePresence>
                      {alertas.map((a, i) => {
                        const cfg = sevConfig[a.severidad] || sevConfig.baja
                        return (
                          <motion.div
                            key={a.id}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 12 }}
                            transition={{ delay: i * 0.04 }}
                            className="p-4 rounded-2xl"
                            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${cfg.color}28` }}
                          >
                            <div className="flex items-start gap-3">
                              {/* Dot */}
                              <div className="mt-1.5 shrink-0">
                                <div className="w-2 h-2 rounded-full" style={{ background: cfg.dot, boxShadow: `0 0 6px ${cfg.dot}` }} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                                    style={{ background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                                    {cfg.label}
                                  </span>
                                  <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                                    {kpiLabel[a.tipo_kpi] || a.tipo_kpi}
                                  </span>
                                </div>
                                <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text)', opacity: 0.85 }}>
                                  {a.mensaje}
                                </p>
                                {a.recomendacion && (
                                  <div className="px-3 py-2.5 rounded-xl text-xs leading-relaxed"
                                    style={{ background: 'rgba(155,142,196,0.07)', border: '1px solid rgba(155,142,196,0.15)', color: 'var(--glow)' }}>
                                    {a.recomendacion}
                                  </div>
                                )}
                                <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
                                  {new Date(a.creada_en).toLocaleString('es-CR')}
                                </p>
                              </div>

                              {/* Acciones */}
                              <div className="flex flex-col gap-1.5 shrink-0">
                                <motion.button
                                  onClick={() => marcarRevisada(a.id)}
                                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
                                >
                                  <CheckIcon /> Revisada
                                </motion.button>
                                <div className="flex gap-1">
                                  <motion.button onClick={() => marcarFeedback(a.id, true)}
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium"
                                    style={{ background: 'rgba(160,196,181,0.12)', color: 'var(--success)' }}>
                                    <ThumbUpIcon /> Útil
                                  </motion.button>
                                  <motion.button onClick={() => marcarFeedback(a.id, false)}
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    className="flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs"
                                    style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--muted)' }}>
                                    <ThumbDownIcon />
                                  </motion.button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </GlowingCard>
            </motion.div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-5">
            {/* Médicos */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <GlowingCard className="p-6">
                <h2 className="font-bold font-display text-base mb-4" style={{ color: 'var(--text)' }}>Médicos</h2>
                <MedicosList clinicaId={clinicaId} />
              </GlowingCard>
            </motion.div>

            {/* User card */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 }}
              className="p-5 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, rgba(155,142,196,0.12), rgba(124,111,191,0.06))', border: '1px solid rgba(155,142,196,0.2)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                  {user?.nombre?.[0] || 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{user?.nombre || 'Usuario'}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: 'rgba(155,142,196,0.2)', color: 'var(--primary)' }}>
                  {user?.rol || 'admin'}
                </span>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>{user?.clinica_nombre}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}