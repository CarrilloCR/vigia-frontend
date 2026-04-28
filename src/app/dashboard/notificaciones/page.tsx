'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../lib/axios'
import { Notificacion } from '../../../types'
import { useToastStore } from '../../../store/toast'
import { useAuthStore } from '../../../store/auth'
import GlowingCard from '../../../components/reactbits/GlowingCard'
import SedeSelector from '../../../components/ui/SedeSelector'
import SpotlightCard from '../../../components/reactbits/SpotlightCard'
import ScrollReveal from '../../../components/reactbits/ScrollReveal'
import GradientText from '../../../components/reactbits/GradientText'
import TiltedCard from '../../../components/reactbits/TiltedCard'
import BorderGlow from '../../../components/reactbits/BorderGlow'
import StarBorder from '../../../components/reactbits/StarBorder'
import GlareHover from '../../../components/reactbits/GlareHover'

const estadoConfig: Record<string, { color: string; bg: string; label: string }> = {
  pendiente:  { color: '#4A9EF0', bg: 'rgba(176,110,245,0.12)', label: 'Pendiente' },
  enviada:    { color: '#00C9A7', bg: 'rgba(0,201,167,0.12)', label: 'Enviada' },
  entregada:  { color: '#00C9A7', bg: 'rgba(0,201,167,0.12)', label: 'Entregada' },
  leida:      { color: '#00C9A7', bg: 'rgba(0,201,167,0.12)', label: 'Leída' },
  fallida:    { color: '#FF6B6B', bg: 'rgba(255,107,107,0.12)', label: 'Fallida' },
}

const MailIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)

const WhatsappIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
)

const SmsIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)

const BellOffIcon = () => (
  <svg width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    <path d="M18.63 13A17.89 17.89 0 0 1 18 8"/>
    <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/>
    <path d="M18 8a6 6 0 0 0-9.33-5"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

const canalIcon: Record<string, React.ReactNode> = {
  email:    <MailIcon />,
  whatsapp: <WhatsappIcon />,
  sms:      <SmsIcon />,
}

export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<string>('todos')
  const [filtroKpi, setFiltroKpi] = useState('')
  const [selectedSede, setSelectedSede] = useState<number | null>(null)
  const { user } = useAuthStore()
  const { activeClinicaId } = useAuthStore(); const clinicaId = activeClinicaId || 1
  const toast = useToastStore()

  useEffect(() => {
    fetchNotificaciones()
  }, [selectedSede])

  const fetchNotificaciones = async () => {
    try {
      const params = `/notificaciones/?clinica=${clinicaId}${selectedSede ? `&sede=${selectedSede}` : ''}`
      const res = await api.get(params)
      setNotificaciones(res.data.results || res.data)
    } catch {
      useToastStore.getState().error('Error al cargar notificaciones', 'No se pudieron obtener las notificaciones.')
    } finally {
      setLoading(false)
    }
  }

  const marcarTodasLeidas = async () => {
    try {
      await api.post('/notificaciones/marcar_todas_leidas/', { clinica_id: clinicaId })
      await fetchNotificaciones()
      toast.success('Notificaciones actualizadas')
    } catch { toast.error('Error al actualizar notificaciones') }
  }

  const filtradas = notificaciones
    .filter(n => filtro === 'todos' || n.estado === filtro)
    .filter(n => filtroKpi === '' || (n as any).alerta_tipo_kpi === filtroKpi)

  const stats = [
    { label: 'Total',      value: notificaciones.length,                                          color: '#00C9A7' },
    { label: 'Pendientes', value: notificaciones.filter(n => n.estado === 'pendiente').length,    color: '#4A9EF0' },
    { label: 'Enviadas',   value: notificaciones.filter(n => n.estado === 'enviada').length,      color: '#00C9A7' },
    { label: 'Fallidas',   value: notificaciones.filter(n => n.estado === 'fallida').length,      color: '#FF6B6B' },
  ]

  const filtros = ['todos', 'pendiente', 'enviada', 'entregada', 'fallida']

  return (
    <>
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}
        >
          <div>
            <h1 className="font-display" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>
              <GradientText text="Notificaciones" className="font-display" />
            </h1>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
              Historial completo de notificaciones enviadas
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SedeSelector clinicaId={clinicaId} value={selectedSede} onChange={setSelectedSede} compact />
            <motion.button
              onClick={marcarTodasLeidas}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', border: 'none',
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                color: 'white',
              }}
            >
              Marcar todas leídas
            </motion.button>
          </div>
        </motion.div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 36 }}>
          {stats.map((s, i) => (
            <ScrollReveal key={i} delay={i * 0.08} direction="up">
              <TiltedCard tiltAmount={6} scaleOnHover={1.03}>
                <motion.div
                  onClick={() => setFiltro(i === 0 ? 'todos' : ['todos', 'pendiente', 'enviada', 'fallida'][i])}
                  style={{
                    padding: '28px 28px', borderRadius: 24,
                    background: 'var(--glass)', backdropFilter: 'blur(20px)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <p className="font-display" style={{ fontSize: 48, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 10 }}>
                    {s.value}
                  </p>
                  <p style={{ fontSize: 15, color: 'var(--muted)', fontWeight: 500 }}>{s.label}</p>
                  <div style={{ marginTop: 16, height: 3, borderRadius: 4, background: `${s.color}20` }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: s.value > 0 ? '100%' : '0%' }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      style={{ height: '100%', borderRadius: 4, background: s.color }}
                    />
                  </div>
                </motion.div>
              </TiltedCard>
            </ScrollReveal>
          ))}
        </div>

        {/* FILTROS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}
        >
          {filtros.map(f => (
            <motion.button
              key={f}
              onClick={() => setFiltro(f)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '10px 20px', borderRadius: 12,
                fontSize: 14, fontWeight: 500, cursor: 'pointer', border: 'none',
                background: filtro === f
                  ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                  : 'var(--glass)',
                backdropFilter: 'blur(20px)',
                borderWidth: 1, borderStyle: 'solid',
                borderColor: filtro === f ? 'transparent' : 'var(--border)',
                color: filtro === f ? 'white' : 'var(--muted)',
                transition: 'all 0.2s',
              }}
            >
              {f === 'todos' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
            </motion.button>
          ))}
        </motion.div>

        {/* LISTA */}
        <ScrollReveal delay={0.2} direction="up">
          <BorderGlow className="p-6 sm:p-8 lg:p-10" colors={['#7dd3fc','#9b8ec4','#a0c4b5']} backgroundColor="var(--glass, rgba(255,255,255,0.03))" borderRadius={18}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
                Historial
              </h2>
              <span style={{
                fontSize: 14, fontWeight: 500, padding: '6px 16px', borderRadius: 20,
                background: 'rgba(0,201,167,0.12)', color: 'var(--primary)',
                border: '1px solid rgba(0,201,167,0.2)',
              }}>
                {filtradas.length} registros
              </span>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[1, 2, 3, 4].map(i => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    style={{ height: 80, borderRadius: 20, background: 'rgba(255,255,255,0.04)' }}
                  />
                ))}
              </div>
            ) : filtradas.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ textAlign: 'center', padding: '64px 0' }}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{ color: 'var(--muted)', display: 'flex', justifyContent: 'center', marginBottom: 20 }}
                >
                  <BellOffIcon />
                </motion.div>
                <p className="font-display" style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
                  Sin notificaciones
                </p>
                <p style={{ fontSize: 15, color: 'var(--muted)' }}>
                  No hay notificaciones que coincidan con el filtro seleccionado
                </p>
              </motion.div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <AnimatePresence>
                  {filtradas.map((notif, i) => {
                    const cfg = estadoConfig[notif.estado] || estadoConfig.pendiente
                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 16 }}
                        transition={{ delay: i * 0.03 }}
                        style={{
                          padding: '20px 24px', borderRadius: 20,
                          background: 'rgba(255,255,255,0.03)',
                          border: `1px solid ${cfg.color}28`,
                          display: 'flex', alignItems: 'center', gap: 20,
                        }}
                      >
                        {/* Canal icon */}
                        <div style={{
                          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                          background: `${cfg.color}15`,
                          border: `1px solid ${cfg.color}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: cfg.color,
                        }}>
                          {canalIcon[notif.canal] || <MailIcon />}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
                              {notif.destinatario}
                            </p>
                            <span style={{
                              fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 20,
                              background: cfg.bg, color: cfg.color,
                              border: `1px solid ${cfg.color}30`,
                            }}>
                              {cfg.label}
                            </span>
                          </div>
                          <p style={{ fontSize: 14, color: 'var(--muted)' }}>
                            Alerta #{notif.alerta} · Canal: {notif.canal.toUpperCase()}
                          </p>
                        </div>

                        {/* Fecha */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          {notif.enviada_en ? (
                            <>
                              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>
                                {new Date(notif.enviada_en).toLocaleDateString('es-CR')}
                              </p>
                              <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                                {new Date(notif.enviada_en).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </>
                          ) : (
                            <p style={{ fontSize: 14, color: 'var(--muted)' }}>Pendiente</p>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </BorderGlow>
        </ScrollReveal>
    </>
  )
}