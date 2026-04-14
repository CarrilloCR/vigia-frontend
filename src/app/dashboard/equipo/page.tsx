'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../lib/axios'
import { useAuthStore } from '../../../store/auth'
import { useToastStore } from '../../../store/toast'
import GlowingCard from '../../../components/reactbits/GlowingCard'
import SpotlightCard from '../../../components/reactbits/SpotlightCard'
import ScrollReveal from '../../../components/reactbits/ScrollReveal'
import GradientText from '../../../components/reactbits/GradientText'
import Magnet from '../../../components/reactbits/Magnet'
import ConfirmModal from '../../../components/ui/ConfirmModal'

type Rol = 'admin' | 'gerente' | 'medico' | 'viewer'

const ROLES: { key: Rol; label: string; desc: string }[] = [
  { key: 'admin',   label: 'Administrador', desc: 'Acceso completo, gestiona usuarios y configuración' },
  { key: 'gerente', label: 'Gerente',        desc: 'Reportes, equipo y alertas. Sin cambios de sistema' },
  { key: 'medico',  label: 'Personal Médico',desc: 'Ve sus alertas y KPIs asociados' },
  { key: 'viewer',  label: 'Visualizador',   desc: 'Solo lectura del dashboard' },
]

const ROL_STYLE: Record<Rol, { bg: string; color: string; border: string }> = {
  admin:   { bg: 'rgba(155,142,196,0.15)', color: '#9B8EC4', border: 'rgba(155,142,196,0.3)' },
  gerente: { bg: 'rgba(124,181,232,0.12)', color: '#7CB5E8', border: 'rgba(124,181,232,0.25)' },
  medico:  { bg: 'rgba(160,196,181,0.12)', color: '#A0C4B5', border: 'rgba(160,196,181,0.25)' },
  viewer:  { bg: 'rgba(139,137,160,0.1)',  color: '#8B89A0', border: 'rgba(139,137,160,0.2)' },
}

const PlusIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const UserMinusIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="8.5" cy="7" r="4"/>
    <line x1="23" y1="11" x2="17" y2="11"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const XIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '13px 16px', borderRadius: 12,
  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
  color: 'var(--text)', fontSize: 15, outline: 'none',
  transition: 'border-color 0.2s', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 500,
  textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block',
}

export default function EquipoPage() {
  const { user } = useAuthStore()
  const toast = useToastStore()
  const { activeClinicaId } = useAuthStore(); const clinicaId = activeClinicaId || 1
  const esAdmin = user?.rol === 'admin' || user?.rol === 'gerente'

  const [usuarios, setUsuarios] = useState<any[]>([])
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvitar, setShowInvitar] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: '', nombre: '', rol: 'viewer' as Rol })
  const [savingInvite, setSavingInvite] = useState(false)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [confirmDesactivar, setConfirmDesactivar] = useState<{ open: boolean; id: number; nombre: string }>({ open: false, id: 0, nombre: '' })
  // For non-admin: request role change
  const [showSolicitud, setShowSolicitud] = useState(false)
  const [solicitudForm, setSolicitudForm] = useState({ rol_solicitado: 'gerente' as Rol, motivo: '' })
  const [savingSolicitud, setSavingSolicitud] = useState(false)

  useEffect(() => {
    fetchUsuarios()
    fetchSolicitudes()
  }, [])

  const fetchUsuarios = async () => {
    try {
      const res = await api.get(`/usuarios/?clinica=${clinicaId}`)
      const data = res.data.results || res.data
      setUsuarios(data.filter((u: any) => !String(u.email || '').startsWith('INACTIVO')))
    } catch {
      toast.error('Error al cargar el equipo')
    } finally { setLoading(false) }
  }

  const fetchSolicitudes = async () => {
    try {
      // admin ve todas las solicitudes (todas las clínicas), gerente solo la suya
      const url = user?.rol === 'admin'
        ? `/solicitudes-rol/?estado=pendiente`
        : `/solicitudes-rol/?clinica=${clinicaId}&estado=pendiente`
      const res = await api.get(url)
      setSolicitudes(res.data.results || res.data)
    } catch { /* silent */ }
  }

  const handleInvitar = async () => {
    if (!inviteForm.email) return toast.error('El email es requerido')
    setSavingInvite(true)
    try {
      const res = await api.post('/usuarios/invitar/', {
        email: inviteForm.email, nombre: inviteForm.nombre,
        rol: inviteForm.rol, clinica_id: clinicaId,
      })
      setTempPassword(res.data.temp_password || null)
      setInviteForm({ email: '', nombre: '', rol: 'viewer' })
      setShowInvitar(false)
      await fetchUsuarios()
      toast.success('Usuario invitado correctamente')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al invitar usuario')
    } finally { setSavingInvite(false) }
  }

  const handleCambiarRol = async (id: number, rol: Rol) => {
    try {
      await api.post(`/usuarios/${id}/cambiar_rol/`, { rol })
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, rol } : u))
      toast.success('Rol actualizado')
    } catch {
      toast.error('Error al cambiar el rol')
    }
  }

  const handleDesactivar = async (id: number) => {
    try {
      await api.post(`/usuarios/${id}/desactivar/`)
      setUsuarios(prev => prev.filter(u => u.id !== id))
      toast.success('Usuario desactivado')
    } catch {
      toast.error('Error al desactivar el usuario')
    }
    setConfirmDesactivar({ open: false, id: 0, nombre: '' })
  }

  const handleAprobar = async (solicitudId: number) => {
    try {
      await api.post(`/solicitudes-rol/${solicitudId}/aprobar/`, { revisor_id: user?.id })
      setSolicitudes(prev => prev.filter(s => s.id !== solicitudId))
      await fetchUsuarios()
      toast.success('Solicitud aprobada — rol actualizado')
    } catch {
      toast.error('Error al aprobar la solicitud')
    }
  }

  const handleRechazar = async (solicitudId: number) => {
    try {
      await api.post(`/solicitudes-rol/${solicitudId}/rechazar/`, { revisor_id: user?.id })
      setSolicitudes(prev => prev.filter(s => s.id !== solicitudId))
      toast.success('Solicitud rechazada')
    } catch {
      toast.error('Error al rechazar la solicitud')
    }
  }

  const handleSolicitarRol = async () => {
    if (!solicitudForm.motivo.trim()) return toast.error('El motivo es requerido')
    setSavingSolicitud(true)
    try {
      await api.post('/solicitudes-rol/', {
        usuario: user?.id,
        rol_solicitado: solicitudForm.rol_solicitado,
        motivo: solicitudForm.motivo,
      })
      setShowSolicitud(false)
      setSolicitudForm({ rol_solicitado: 'gerente', motivo: '' })
      toast.success('Solicitud enviada — un administrador la revisará')
    } catch {
      toast.error('Error al enviar la solicitud')
    } finally { setSavingSolicitud(false) }
  }

  return (
    <>
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}
      >
        <div>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}><GradientText text="Equipo" className="font-display" /></h1>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>Gestiona los usuarios con acceso a la plataforma</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {!esAdmin && (
            <motion.button
              onClick={() => setShowSolicitud(v => !v)}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px',
                borderRadius: 14, background: 'rgba(124,181,232,0.1)', border: '1px solid rgba(124,181,232,0.3)',
                color: '#7CB5E8', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Solicitar cambio de rol
            </motion.button>
          )}
          {esAdmin && (
            <Magnet strength={0.3}>
              <motion.button
                onClick={() => setShowInvitar(v => !v)}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px',
                  borderRadius: 14, background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(155,142,196,0.3)',
                }}
              >
                <PlusIcon /> Invitar miembro
              </motion.button>
            </Magnet>
          )}
        </div>
      </motion.div>

      {/* Temp password banner */}
      <AnimatePresence>
        {tempPassword && (
          <motion.div
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            style={{ marginBottom: 24, padding: '20px 24px', borderRadius: 20, background: 'rgba(160,196,181,0.1)', border: '1px solid rgba(160,196,181,0.3)' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--success)', marginBottom: 6 }}>Usuario creado. Contraseña temporal:</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 8 }}>{tempPassword}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>Comparte esto con el usuario — solo se muestra una vez.</p>
              </div>
              <motion.button onClick={() => setTempPassword(null)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 20, padding: 4 }}>×</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Solicitudes pendientes — visible para admin/gerente */}
      <AnimatePresence>
        {esAdmin && solicitudes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            style={{ marginBottom: 24 }}
          >
            <GlowingCard className="p-6 sm:p-8">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#E8C4A0', display: 'inline-block' }} />
                <h3 className="font-display" style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>
                  Solicitudes de cambio de rol
                </h3>
                <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(232,196,160,0.15)', color: '#E8C4A0', border: '1px solid rgba(232,196,160,0.3)' }}>
                  {solicitudes.length} pendiente{solicitudes.length > 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {solicitudes.map(s => {
                  const rolStyle = ROL_STYLE[s.rol_solicitado as Rol] || ROL_STYLE.viewer
                  return (
                    <div key={s.id} style={{
                      display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                      padding: '14px 18px', borderRadius: 14,
                      background: 'rgba(232,196,160,0.05)', border: '1px solid rgba(232,196,160,0.15)',
                    }}>
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                          {s.usuario_nombre || s.usuario_email}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--muted)' }}>{s.usuario_email}</p>
                        {user?.rol === 'admin' && s.clinica_nombre && (
                          <p style={{ fontSize: 11, color: 'var(--primary)', marginTop: 2 }}>{s.clinica_nombre}</p>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Solicita →</span>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: rolStyle.bg, color: rolStyle.color, border: `1px solid ${rolStyle.border}` }}>
                          {ROLES.find(r => r.key === s.rol_solicitado)?.label || s.rol_solicitado}
                        </span>
                      </div>
                      {s.motivo && (
                        <p style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', flex: '1 1 200px' }}>"{s.motivo}"</p>
                      )}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <motion.button
                          onClick={() => handleAprobar(s.id)}
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(160,196,181,0.15)', border: '1px solid rgba(160,196,181,0.3)', color: '#A0C4B5', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                        >
                          <CheckIcon /> Aprobar
                        </motion.button>
                        <motion.button
                          onClick={() => handleRechazar(s.id)}
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(232,160,196,0.1)', border: '1px solid rgba(232,160,196,0.2)', color: '#E8A0C4', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                        >
                          <XIcon /> Rechazar
                        </motion.button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </GlowingCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulario solicitar rol (para no-admins) */}
      <AnimatePresence>
        {showSolicitud && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: 24 }}
          >
            <GlowingCard className="p-6 sm:p-8">
              <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>
                Solicitar cambio de rol
              </h3>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Rol solicitado</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {ROLES.filter(r => r.key !== user?.rol).map(r => {
                    const rs = ROL_STYLE[r.key]
                    return (
                      <motion.button key={r.key}
                        onClick={() => setSolicitudForm({ ...solicitudForm, rol_solicitado: r.key })}
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        style={{
                          padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                          cursor: 'pointer', border: '2px solid',
                          background: solicitudForm.rol_solicitado === r.key ? rs.bg : 'rgba(255,255,255,0.04)',
                          borderColor: solicitudForm.rol_solicitado === r.key ? rs.color : 'var(--border)',
                          color: solicitudForm.rol_solicitado === r.key ? rs.color : 'var(--muted)',
                          transition: 'all 0.2s',
                        }}
                      >
                        {r.label}
                      </motion.button>
                    )
                  })}
                </div>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
                  {ROLES.find(r => r.key === solicitudForm.rol_solicitado)?.desc}
                </p>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Motivo *</label>
                <textarea
                  value={solicitudForm.motivo}
                  onChange={e => setSolicitudForm({ ...solicitudForm, motivo: e.target.value })}
                  placeholder="Explica brevemente por qué necesitas este rol..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 90 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <motion.button onClick={() => setShowSolicitud(false)}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ padding: '11px 22px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 14, cursor: 'pointer' }}>
                  Cancelar
                </motion.button>
                <motion.button onClick={handleSolicitarRol} disabled={savingSolicitud}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ padding: '11px 28px', borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: savingSolicitud ? 'not-allowed' : 'pointer', opacity: savingSolicitud ? 0.7 : 1 }}>
                  {savingSolicitud ? 'Enviando...' : 'Enviar solicitud'}
                </motion.button>
              </div>
            </GlowingCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite form */}
      <AnimatePresence>
        {showInvitar && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: 24 }}
          >
            <GlowingCard className="p-6 sm:p-8">
              <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>
                Invitar nuevo miembro
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Correo electrónico *</label>
                  <input type="email" value={inviteForm.email}
                    onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
                    placeholder="usuario@clinica.com"
                    onKeyDown={e => e.key === 'Enter' && handleInvitar()}
                    style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Nombre (opcional)</label>
                  <input value={inviteForm.nombre}
                    onChange={e => setInviteForm({ ...inviteForm, nombre: e.target.value })}
                    placeholder="Dr. Nombre Apellido"
                    onKeyDown={e => e.key === 'Enter' && handleInvitar()}
                    style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Rol inicial</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {ROLES.map(r => {
                    const rs = ROL_STYLE[r.key]
                    return (
                      <motion.button key={r.key}
                        onClick={() => setInviteForm({ ...inviteForm, rol: r.key })}
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        style={{
                          padding: '9px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                          cursor: 'pointer', border: '2px solid',
                          background: inviteForm.rol === r.key ? rs.bg : 'rgba(255,255,255,0.04)',
                          borderColor: inviteForm.rol === r.key ? rs.color : 'var(--border)',
                          color: inviteForm.rol === r.key ? rs.color : 'var(--muted)',
                          transition: 'all 0.2s',
                        }}
                      >
                        {r.label}
                      </motion.button>
                    )
                  })}
                </div>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
                  {ROLES.find(r => r.key === inviteForm.rol)?.desc}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <motion.button onClick={() => setShowInvitar(false)}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ padding: '11px 22px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 14, cursor: 'pointer' }}>
                  Cancelar
                </motion.button>
                <motion.button onClick={handleInvitar} disabled={savingInvite}
                  whileHover={{ scale: savingInvite ? 1 : 1.02 }} whileTap={{ scale: savingInvite ? 1 : 0.98 }}
                  style={{ padding: '11px 28px', borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: savingInvite ? 'not-allowed' : 'pointer', opacity: savingInvite ? 0.7 : 1 }}>
                  {savingInvite ? 'Invitando...' : 'Invitar'}
                </motion.button>
              </div>
            </GlowingCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users list */}
      <ScrollReveal delay={0.2} direction="up">
        <SpotlightCard className="p-6 sm:p-8 lg:p-10" spotlightColor="rgba(155,142,196,0.12)" from="bottom">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>Miembros del equipo</h2>
            <span style={{ fontSize: 14, fontWeight: 500, padding: '6px 16px', borderRadius: 20, background: 'rgba(155,142,196,0.12)', color: 'var(--primary)', border: '1px solid rgba(155,142,196,0.2)' }}>
              {usuarios.length} usuarios
            </span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[1,2,3].map(i => (
                <motion.div key={i} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  style={{ height: 72, borderRadius: 18, background: 'rgba(255,255,255,0.04)' }} />
              ))}
            </div>
          ) : usuarios.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p style={{ fontSize: 14, color: 'var(--muted)' }}>No hay usuarios en el equipo</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <AnimatePresence>
                {usuarios.map((u, i) => {
                  const rol: Rol = (u.rol as Rol) || 'viewer'
                  const rolStyle = ROL_STYLE[rol] || ROL_STYLE.viewer
                  const rolLabel = ROLES.find(r => r.key === rol)?.label || rol
                  const esYo = u.id === user?.id
                  const nombre = u.nombre || u.email || `Usuario #${u.id}`
                  const email = u.email || ''
                  const inicial = nombre[0].toUpperCase()

                  return (
                    <motion.div key={u.id}
                      initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                      transition={{ delay: i * 0.04 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                        padding: '16px 20px', borderRadius: 18,
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${esYo ? 'rgba(155,142,196,0.3)' : 'var(--border)'}`,
                      }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                        background: `linear-gradient(135deg, ${rolStyle.color}44, ${rolStyle.color}22)`,
                        border: `1px solid ${rolStyle.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, fontWeight: 700, color: rolStyle.color,
                      }}>
                        {inicial}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
                          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{nombre}</p>
                          {esYo && (
                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'rgba(155,142,196,0.12)', color: 'var(--primary)', border: '1px solid rgba(155,142,196,0.2)' }}>Tú</span>
                          )}
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</p>
                      </div>

                      {/* Rol badge */}
                      <span style={{ fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 20, background: rolStyle.bg, color: rolStyle.color, border: `1px solid ${rolStyle.border}`, flexShrink: 0 }}>
                        {rolLabel}
                      </span>

                      {/* Cambiar rol (admin/gerente only, not self) */}
                      {esAdmin && !esYo && (
                        <select
                          value={rol}
                          onChange={e => handleCambiarRol(u.id, e.target.value as Rol)}
                          style={{
                            padding: '7px 12px', borderRadius: 10, fontSize: 13,
                            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                            color: 'var(--text)', cursor: 'pointer', outline: 'none', flexShrink: 0,
                          }}
                        >
                          {ROLES.map(r => (
                            <option key={r.key} value={r.key}>{r.label}</option>
                          ))}
                        </select>
                      )}

                      {/* Desactivar */}
                      {esAdmin && !esYo && (
                        <motion.button
                          onClick={() => setConfirmDesactivar({ open: true, id: u.id, nombre })}
                          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          style={{
                            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                            background: 'rgba(232,160,196,0.1)', border: '1px solid rgba(232,160,196,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'var(--danger)',
                          }}
                        >
                          <UserMinusIcon />
                        </motion.button>
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </SpotlightCard>
      </ScrollReveal>

      {/* Confirm deactivate modal */}
      <ConfirmModal
        open={confirmDesactivar.open}
        title="Desactivar usuario"
        message={`¿Estás seguro de que quieres desactivar a ${confirmDesactivar.nombre}? El usuario ya no podrá acceder a la plataforma.`}
        confirmLabel="Desactivar"
        variant="danger"
        onConfirm={() => handleDesactivar(confirmDesactivar.id)}
        onCancel={() => setConfirmDesactivar({ open: false, id: 0, nombre: '' })}
      />
    </>
  )
}
