'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../lib/axios'
import { Alerta } from '../../types'
import { useAuthStore } from '../../store/auth'
import Aurora from '../../components/reactbits/Aurora'
import GlowingCard from '../../components/reactbits/GlowingCard'
import CountUp from '../../components/reactbits/CountUp'
import ThemeToggle from '../../components/ui/ThemeToggle'

const kpiLabel: Record<string, string> = {
  tasa_cancelacion: 'Cancelación',
  tasa_noshow: 'No-Show',
  ingresos_dia: 'Ingresos del Día',
  ocupacion_agenda: 'Ocupación',
  ticket_promedio: 'Ticket Promedio',
  pacientes_nuevos: 'Pac. Nuevos',
  retencion_90: 'Retención 90d',
  nps: 'NPS',
  citas_reagendadas: 'Reagendadas',
}

const sevConfig: Record<string, { label: string; color: string }> = {
  baja:    { label: 'Baja',    color: '#A0C4B5' },
  media:   { label: 'Media',   color: '#C4B5E8' },
  alta:    { label: 'Alta',    color: '#9B8EC4' },
  critica: { label: 'Crítica', color: '#E8A0C4' },
}

const ShieldIcon = () => (
  <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const BoltIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)
const BellIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const LogoutIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const ThumbUpIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
  </svg>
)
const ThumbDownIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
    <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
  </svg>
)
const ArrowRightIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
)
const CheckCircleIcon = () => (
  <svg width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const HistoryIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-4.84"/>
  </svg>
)
const EyeOffIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)
const ResolveAllIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12"/>
    <polyline points="20 12 9 23 4 18"/>
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
    <p style={{ fontSize: 14, color: 'var(--muted)', textAlign: 'center', padding: '24px 0' }}>
      Sin médicos registrados
    </p>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {medicos.map((m, i) => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          onClick={() => router.push(`/dashboard/medico/${m.id}`)}
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 16px', borderRadius: 16, cursor: 'pointer',
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
            transition: 'all 0.2s',
          }}
          whileHover={{ background: 'rgba(155,142,196,0.08)' } as any}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 14, fontWeight: 700,
          }}>
            {m.nombre[0]}{m.apellido[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Dr. {m.nombre} {m.apellido}
            </p>
            <p style={{ fontSize: 13, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {m.especialidad}
            </p>
          </div>
          <span style={{ color: 'var(--muted)', flexShrink: 0 }}><ArrowRightIcon /></span>
        </motion.div>
      ))}
    </div>
  )
}

type FiltroSeveridad = 'todas' | 'critica' | 'alta' | 'media' | 'baja'
type VistaAlertas = 'activas' | 'historial'

export default function DashboardPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [historial, setHistorial] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)
  const [motorLoading, setMotorLoading] = useState(false)
  const [notifPendientes, setNotifPendientes] = useState(0)
  const [filtroSev, setFiltroSev] = useState<FiltroSeveridad>('todas')
  const [vistaAlertas, setVistaAlertas] = useState<VistaAlertas>('activas')
  const [ocultarTodas, setOcultarTodas] = useState(false)
  const [feedbackDado, setFeedbackDado] = useState<Record<number, 'util' | 'no_util'>>({})
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()
  const clinicaId = user?.clinica_id || 1

  useEffect(() => {
    fetchAlertas()
    fetchHistorial()
    fetchNotifs()
  }, [])

  const fetchAlertas = async () => {
    try {
      const res = await api.get('/alertas/?estado=activa')
      setAlertas(res.data.results || res.data)
    } catch { } finally { setLoading(false) }
  }

  const fetchHistorial = async () => {
    try {
      const res = await api.get('/alertas/')
      setHistorial(res.data.results || res.data)
    } catch { }
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
      await fetchHistorial()
      await fetchNotifs()
    } catch { } finally { setMotorLoading(false) }
  }

  const marcarRevisada = async (id: number) => {
    try {
      await api.post(`/alertas/${id}/marcar_revisada/`)
      setAlertas(prev => prev.filter(a => a.id !== id))
      await fetchHistorial()
    } catch { }
  }

  const resolverTodas = async () => {
    try {
      await api.post('/alertas/resolver_todas/', { clinica_id: clinicaId })
      await fetchAlertas()
      await fetchHistorial()
    } catch { }
  }

  const marcarFeedback = async (alertaId: number, fueUtil: boolean) => {
    try {
      await api.post('/feedbacks/', {
        alerta: alertaId,
        usuario: user?.id || 1,
        fue_util: fueUtil,
        comentario: ''
      })
      setFeedbackDado(prev => ({ ...prev, [alertaId]: fueUtil ? 'util' : 'no_util' }))
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

  const alertasFiltradas = alertas.filter(a =>
    filtroSev === 'todas' || a.severidad === filtroSev
  )

  const historialFiltrado = historial.filter(a =>
    filtroSev === 'todas' || a.severidad === filtroSev
  )

  const listaActual = vistaAlertas === 'activas' ? alertasFiltradas : historialFiltrado

  const stats = [
    { label: 'Total activas',  value: alertas.length, color: '#9B8EC4', filtro: 'todas' as FiltroSeveridad },
    { label: 'Críticas',       value: alertas.filter(a => a.severidad === 'critica').length, color: '#E8A0C4', filtro: 'critica' as FiltroSeveridad },
    { label: 'Altas',          value: alertas.filter(a => a.severidad === 'alta').length, color: '#C4B5E8', filtro: 'alta' as FiltroSeveridad },
    { label: 'Medias / Bajas', value: alertas.filter(a => ['media', 'baja'].includes(a.severidad)).length, color: '#A0C4B5', filtro: 'media' as FiltroSeveridad },
  ]

  const filtros: { key: FiltroSeveridad; label: string; color: string }[] = [
    { key: 'todas',   label: 'Todas',    color: '#9B8EC4' },
    { key: 'critica', label: 'Críticas', color: '#E8A0C4' },
    { key: 'alta',    label: 'Altas',    color: '#9B8EC4' },
    { key: 'media',   label: 'Medias',   color: '#C4B5E8' },
    { key: 'baja',    label: 'Bajas',    color: '#A0C4B5' },
  ]

  return (
    <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: 'var(--void)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <Aurora colorStops={['#9B8EC4', '#7C6FBF', '#C4B5E8']} amplitude={0.5} speed={0.15} />
      </div>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.03, backgroundImage: 'linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      <div style={{ position: 'relative', zIndex: 10, padding: '32px 48px', maxWidth: 1600, margin: '0 auto' }}>

        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <motion.div
              style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              animate={{ boxShadow: ['0 0 16px rgba(155,142,196,0.3)', '0 0 36px rgba(155,142,196,0.6)', '0 0 16px rgba(155,142,196,0.3)'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <ShieldIcon />
            </motion.div>
            <div>
              <p className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>Vigía</p>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 2 }}>{user?.clinica_nombre || 'Panel de control'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <motion.button onClick={ejecutarMotor} disabled={motorLoading}
              whileHover={{ scale: motorLoading ? 1 : 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 22px', borderRadius: 14, background: 'linear-gradient(135deg, #7AB5A3, var(--success))', color: 'white', fontSize: 15, fontWeight: 600, border: 'none', cursor: motorLoading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 20px rgba(160,196,181,0.3)', opacity: motorLoading ? 0.7 : 1 }}>
              {motorLoading
                ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%' }} />
                : <BoltIcon />}
              {motorLoading ? 'Analizando...' : 'Ejecutar análisis'}
            </motion.button>

            <motion.button onClick={() => router.push('/dashboard/notificaciones')}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, padding: '13px 22px', borderRadius: 14, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
              <BellIcon />
              Notificaciones
              <AnimatePresence>
                {notifPendientes > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    style={{ position: 'absolute', top: -6, right: -6, minWidth: 22, height: 22, borderRadius: 11, background: 'var(--danger)', boxShadow: '0 0 12px rgba(232,160,196,0.6)', color: 'white', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }}>
                    {notifPendientes}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button onClick={() => router.push('/dashboard/kpis')}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 22px', borderRadius: 14, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              KPIs
            </motion.button>

            <motion.button onClick={() => router.push('/dashboard/configuracion')}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{display: 'flex', alignItems: 'center', gap: 10, padding: '13px 22px', borderRadius: 14, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"> 
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
            </svg>
            Configuración
          </motion.button>

          <motion.button
  onClick={() => router.push('/dashboard/pacientes')}
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.97 }}
  style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '13px 22px', borderRadius: 14,
    background: 'var(--glass)', backdropFilter: 'blur(20px)',
    border: '1px solid var(--border)',
    color: 'var(--text)', fontSize: 15, fontWeight: 500, cursor: 'pointer',
  }}
>
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
  Pacientes
</motion.button>

          <motion.button
  onClick={() => router.push('/dashboard/citas')}
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.97 }}
  style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '13px 22px', borderRadius: 14,
    background: 'var(--glass)', backdropFilter: 'blur(20px)',
    border: '1px solid var(--border)',
    color: 'var(--text)', fontSize: 15, fontWeight: 500, cursor: 'pointer',
  }}
>
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
  Citas
</motion.button>

            <ThemeToggle />

            <motion.button onClick={handleLogout} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 20px', borderRadius: 14, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
              <LogoutIcon /> Salir
            </motion.button>

            <div style={{ textAlign: 'right', marginLeft: 8 }}>
              <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', textTransform: 'capitalize' }}>
                {new Date().toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Panel de control</p>
            </div>
          </div>
        </motion.div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 36 }}>
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              onClick={() => { setFiltroSev(s.filtro); setVistaAlertas('activas'); setOcultarTodas(false) }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{
                padding: '28px', borderRadius: 24, cursor: 'pointer',
                background: filtroSev === s.filtro ? `${s.color}18` : 'var(--glass)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${filtroSev === s.filtro ? s.color + '50' : 'var(--border)'}`,
                transition: 'all 0.2s',
              }}>
              <p className="font-display" style={{ fontSize: 48, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 10 }}>
                <CountUp to={s.value} duration={1} />
              </p>
              <p style={{ fontSize: 15, color: 'var(--muted)', fontWeight: 500 }}>{s.label}</p>
              <div style={{ marginTop: 16, height: 3, borderRadius: 4, background: `${s.color}20` }}>
                <motion.div initial={{ width: 0 }} animate={{ width: s.value > 0 ? '100%' : '0%' }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  style={{ height: '100%', borderRadius: 4, background: s.color }} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 24 }}>

          {/* ALERTAS */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
            <GlowingCard className="p-8">

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
                  {vistaAlertas === 'activas' ? 'Alertas Activas' : 'Historial de Alertas'}
                </h2>
                <span style={{ fontSize: 13, fontWeight: 500, padding: '5px 14px', borderRadius: 20, background: 'rgba(155,142,196,0.12)', color: 'var(--primary)', border: '1px solid rgba(155,142,196,0.2)' }}>
                  {listaActual.length} {vistaAlertas === 'activas' ? 'activas' : 'registros'}
                </span>
              </div>

              {/* Controles */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {/* Tabs vista */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, padding: 3 }}>
                  {(['activas', 'historial'] as const).map(v => (
                    <motion.button key={v} onClick={() => setVistaAlertas(v)} whileTap={{ scale: 0.97 }}
                      style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', position: 'relative', overflow: 'hidden', background: 'transparent', color: vistaAlertas === v ? 'white' : 'var(--muted)' }}>
                      {vistaAlertas === v && (
                        <motion.div layoutId="alertaTab"
                          style={{ position: 'absolute', inset: 0, borderRadius: 10, background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} />
                      )}
                      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {v === 'historial' && <HistoryIcon />}
                        {v === 'activas' ? 'Activas' : 'Historial'}
                      </span>
                    </motion.button>
                  ))}
                </div>

                {/* Filtros severidad */}
                {filtros.map(f => (
                  <motion.button key={f.key} onClick={() => setFiltroSev(f.key)}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    style={{
                      padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                      cursor: 'pointer', border: 'none',
                      background: filtroSev === f.key ? `${f.color}25` : 'rgba(255,255,255,0.03)',
                      color: filtroSev === f.key ? f.color : 'var(--muted)',
                      borderWidth: 1, borderStyle: 'solid',
                      borderColor: filtroSev === f.key ? `${f.color}50` : 'var(--border)',
                      transition: 'all 0.2s',
                    }}>
                    {f.label}
                  </motion.button>
                ))}

                {/* Acciones rápidas */}
                {vistaAlertas === 'activas' && alertas.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                    <motion.button onClick={() => setOcultarTodas(!ocultarTodas)}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border)', background: ocultarTodas ? 'rgba(155,142,196,0.15)' : 'rgba(255,255,255,0.03)', color: ocultarTodas ? 'var(--primary)' : 'var(--muted)' }}>
                      <EyeOffIcon />
                      {ocultarTodas ? 'Mostrar' : 'Ocultar'}
                    </motion.button>
                    <motion.button onClick={resolverTodas}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid rgba(160,196,181,0.3)', background: 'rgba(160,196,181,0.08)', color: 'var(--success)' }}>
                      <ResolveAllIcon />
                      Revisar todas
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Lista */}
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[1, 2, 3].map(i => (
                    <motion.div key={i} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      style={{ height: 100, borderRadius: 20, background: 'rgba(255,255,255,0.04)' }} />
                  ))}
                </div>
              ) : ocultarTodas ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '48px 0' }}>
                  <p style={{ fontSize: 16, color: 'var(--muted)', marginBottom: 16 }}>Alertas ocultas</p>
                  <motion.button onClick={() => setOcultarTodas(false)} whileHover={{ scale: 1.03 }}
                    style={{ padding: '10px 24px', borderRadius: 12, background: 'rgba(155,142,196,0.12)', color: 'var(--primary)', border: '1px solid rgba(155,142,196,0.2)', cursor: 'pointer', fontSize: 14 }}>
                    Mostrar alertas
                  </motion.button>
                </motion.div>
              ) : listaActual.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '64px 0' }}>
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
                    style={{ color: 'var(--success)', display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                    <CheckCircleIcon />
                  </motion.div>
                  <p className="font-display" style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
                    {vistaAlertas === 'historial' ? 'Sin historial' : 'Todo en orden'}
                  </p>
                  <p style={{ fontSize: 15, color: 'var(--muted)' }}>
                    {vistaAlertas === 'historial' ? 'No hay alertas en el historial' : 'No hay alertas activas en este momento'}
                  </p>
                </motion.div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 600, overflowY: 'auto', paddingRight: 4 }}>
                  <AnimatePresence>
                    {listaActual.map((a, i) => {
                      const cfg = sevConfig[a.severidad] || sevConfig.baja
                      return (
                        <motion.div key={a.id}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 16, height: 0 }}
                          transition={{ delay: i * 0.03 }}
                          style={{ padding: '20px 22px', borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: `1px solid ${cfg.color}30` }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                            <div style={{ marginTop: 6, flexShrink: 0 }}>
                              <div style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color, boxShadow: `0 0 8px ${cfg.color}` }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 13, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                                  {cfg.label}
                                </span>
                                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
                                  {kpiLabel[a.tipo_kpi] || a.tipo_kpi}
                                </span>
                                {vistaAlertas === 'historial' && (
                                  <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', color: 'var(--muted)', border: '1px solid var(--border)', marginLeft: 'auto' }}>
                                    {a.estado}
                                  </span>
                                )}
                              </div>
                              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text)', opacity: 0.85, marginBottom: 12 }}>
                                {a.mensaje}
                              </p>
                              {a.recomendacion && (
                                <div style={{ padding: '12px 16px', borderRadius: 14, marginBottom: 12, background: 'rgba(155,142,196,0.07)', border: '1px solid rgba(155,142,196,0.15)', fontSize: 13, lineHeight: 1.7, color: 'var(--glow)' }}>
                                  {a.recomendacion}
                                </div>
                              )}
                              <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                                {new Date(a.creada_en).toLocaleString('es-CR')}
                              </p>
                            </div>

                            {/* Acciones — solo en vista activas */}
                            {vistaAlertas === 'activas' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                                <motion.button onClick={() => marcarRevisada(a.id)}
                                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                                  <CheckIcon /> Revisada
                                </motion.button>
                                <div style={{ display: 'flex', gap: 8 }}>
                                  {feedbackDado[a.id] ? (
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                      style={{
                                        padding: '9px 14px', borderRadius: 12, fontSize: 12, fontWeight: 500,
                                        background: feedbackDado[a.id] === 'util' ? 'rgba(160,196,181,0.15)' : 'rgba(232,160,196,0.1)',
                                        color: feedbackDado[a.id] === 'util' ? 'var(--success)' : 'var(--danger)',
                                        border: `1px solid ${feedbackDado[a.id] === 'util' ? 'rgba(160,196,181,0.3)' : 'rgba(232,160,196,0.2)'}`,
                                      }}>
                                      {feedbackDado[a.id] === 'util' ? '✓ Útil' : '✗ No útil'}
                                    </motion.div>
                                  ) : (
                                    <>
                                      <motion.button onClick={() => marcarFeedback(a.id, true)}
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 12px', borderRadius: 12, background: 'rgba(160,196,181,0.12)', color: 'var(--success)', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer' }}>
                                        <ThumbUpIcon /> Útil
                                      </motion.button>
                                      <motion.button onClick={() => marcarFeedback(a.id, false)}
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        style={{ padding: '9px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', color: 'var(--muted)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                        <ThumbDownIcon />
                                      </motion.button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}
            </GlowingCard>
          </motion.div>

          {/* SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* User card */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
              onClick={() => router.push('/dashboard/configuracion')}
              whileHover={{ scale: 1.02, borderColor: 'rgba(155,142,196,0.45)' }}
              whileTap={{ scale: 0.98 }}
              style={{ padding: '24px', borderRadius: 24, background: 'linear-gradient(135deg, rgba(155,142,196,0.15), rgba(124,111,191,0.08))', border: '1px solid rgba(155,142,196,0.25)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, flexShrink: 0, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 700 }}>
                  {user?.nombre?.[0] || 'U'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.nombre || 'Usuario'}</p>
                  <p style={{ fontSize: 13, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 500, padding: '5px 14px', borderRadius: 20, background: 'rgba(155,142,196,0.2)', color: 'var(--primary)' }}>
                  {user?.rol || 'admin'}
                </span>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>{user?.clinica_nombre}</span>
              </div>
            </motion.div>

            {/* Médicos */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ flex: 1 }}>
              <GlowingCard className="p-8">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h2 className="font-display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Médicos</h2>
                  <motion.button onClick={() => router.push('/dashboard/medicos')}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    style={{ fontSize: 12, padding: '5px 12px', borderRadius: 20, background: 'rgba(155,142,196,0.1)', color: 'var(--primary)', border: '1px solid rgba(155,142,196,0.2)', cursor: 'pointer' }}>
                    Ver todos
                  </motion.button>
                </div>
                <MedicosList clinicaId={clinicaId} />
              </GlowingCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}