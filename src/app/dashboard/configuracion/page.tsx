'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../lib/axios'
import { useAuthStore } from '../../../store/auth'
import { useThemeStore } from '../../../store/theme'
import { useToastStore } from '../../../store/toast'
import Aurora from '../../../components/reactbits/Aurora'
import GlowingCard from '../../../components/reactbits/GlowingCard'
import FadeContent from '../../../components/reactbits/FadeContent'
import BlurText from '../../../components/reactbits/BlurText'
import ToggleSwitch from '../../../components/reactbits/ToggleSwitch'
import PasswordRequirements, { validatePassword } from '../../../components/ui/PasswordRequirements'
import ConfirmModal from '../../../components/ui/ConfirmModal'
import type { Clinica, Sede, IntegracionExterna, PlanFacturacion } from '../../../types'

// ─── Icons ───────────────────────────────────────────────────────────────────

const ArrowLeftIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
const UserIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const LockIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const BuildingIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9h1"/><path d="M9 13h1"/><path d="M9 17h1"/>
  </svg>
)
const BellIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const PaletteIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="13.5" cy="6.5" r="2.5"/><circle cx="19" cy="11.5" r="2.5"/><circle cx="6" cy="12.5" r="2.5"/><circle cx="17" cy="18.5" r="2.5"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.7-.8 1.7-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.8-1.7 1.7-1.7H17c3.3 0 6-2.7 6-6 0-5.2-4.9-9.4-11-8.4"/>
  </svg>
)
const LinkIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
)
const CreditCardIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
)
const MailIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const TrashIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const RefreshIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)
const EyeIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const EyeOffIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)
const MapPinIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)

// ─── Types ───────────────────────────────────────────────────────────────────

type Section = 'perfil' | 'seguridad' | 'clinica' | 'notificaciones' | 'apariencia' | 'integraciones' | 'facturacion'

interface EmailNotificacion {
  id: number
  email: string
  nombre: string
  activo: boolean
  clinica: number
}

const SECTIONS: { key: Section; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: 'perfil', label: 'Perfil', icon: <UserIcon />, desc: 'Información personal' },
  { key: 'seguridad', label: 'Seguridad', icon: <LockIcon />, desc: 'Contraseña y acceso' },
  { key: 'clinica', label: 'Clínica', icon: <BuildingIcon />, desc: 'Datos de la clínica' },
  { key: 'notificaciones', label: 'Notificaciones', icon: <BellIcon />, desc: 'Alertas y correos' },
  { key: 'apariencia', label: 'Apariencia', icon: <PaletteIcon />, desc: 'Tema y visualización' },
  { key: 'integraciones', label: 'Integraciones', icon: <LinkIcon />, desc: 'Conexiones externas' },
  { key: 'facturacion', label: 'Facturación', icon: <CreditCardIcon />, desc: 'Plan y pagos' },
]

// ─── Styles ──────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 16px',
  borderRadius: 12,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  fontSize: 15,
  outline: 'none',
  transition: 'border-color 0.2s',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--muted)',
  marginBottom: 6,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  display: 'block',
}

const sectionTitle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: 'var(--text)',
  marginBottom: 8,
}

const sectionDesc: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--muted)',
  marginBottom: 28,
  lineHeight: 1.5,
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ConfiguracionPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const clinicaId = user?.clinica_id || 1

  const [activeSection, setActiveSection] = useState<Section>('perfil')
  const toast = useToastStore()

  // ─── Perfil state
  const [perfil, setPerfil] = useState({ nombre: user?.nombre || '', email: user?.email || '' })
  const [savingPerfil, setSavingPerfil] = useState(false)

  // ─── Seguridad state
  const [passwords, setPasswords] = useState({ current: '', nueva: '', confirmar: '' })
  const [showPasswords, setShowPasswords] = useState({ current: false, nueva: false, confirmar: false })
  const [savingPassword, setSavingPassword] = useState(false)

  // ─── Clínica state
  const [clinica, setClinica] = useState<Clinica | null>(null)
  const [sedes, setSedes] = useState<Sede[]>([])
  const [loadingClinica, setLoadingClinica] = useState(true)
  const [editClinica, setEditClinica] = useState({ nombre: '', email: '' })
  const [savingClinica, setSavingClinica] = useState(false)

  // ─── Notificaciones state
  const [emails, setEmails] = useState<EmailNotificacion[]>([])
  const [loadingEmails, setLoadingEmails] = useState(true)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailForm, setEmailForm] = useState({ email: '', nombre: '' })
  const [savingEmail, setSavingEmail] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number; label: string }>({ open: false, id: 0, label: '' })
  const [alertPrefs, setAlertPrefs] = useState({
    emailCriticas: true,
    emailAltas: true,
    emailMedias: true,
    emailBajas: false,
    resumenDiario: true,
    sonido: true,
  })

  // ─── Apariencia state
  const { isDark, toggle: toggleTheme } = useThemeStore()
  const [apariencia, setApariencia] = useState({
    animaciones: true,
    compacto: false,
    autoRefresh: true,
  })

  // ─── Integraciones state
  const [integraciones, setIntegraciones] = useState<IntegracionExterna[]>([])
  const [loadingIntegraciones, setLoadingIntegraciones] = useState(true)

  // ─── Facturación state
  const [plan, setPlan] = useState<PlanFacturacion | null>(null)
  const [loadingPlan, setLoadingPlan] = useState(true)

  // ─── Toast helper
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') toast.success(msg)
    else toast.error(msg)
  }

  // ─── Data fetching
  useEffect(() => {
    if (activeSection === 'clinica' && !clinica) {
      setLoadingClinica(true)
      Promise.all([
        api.get(`/clinicas/${clinicaId}/`).catch(() => null),
        api.get(`/sedes/?clinica=${clinicaId}`).catch(() => null),
      ]).then(([clinRes, sedesRes]) => {
        if (clinRes?.data) {
          setClinica(clinRes.data)
          setEditClinica({ nombre: clinRes.data.nombre, email: clinRes.data.email })
        }
        if (sedesRes?.data) setSedes(sedesRes.data.results || sedesRes.data)
      }).finally(() => setLoadingClinica(false))
    }
    if (activeSection === 'notificaciones' && loadingEmails) {
      api.get(`/emails-notificacion/?clinica=${clinicaId}`)
        .then(res => setEmails(res.data.results || res.data))
        .catch(() => {})
        .finally(() => setLoadingEmails(false))
    }
    if (activeSection === 'integraciones' && loadingIntegraciones) {
      api.get(`/integraciones/?clinica=${clinicaId}`)
        .then(res => setIntegraciones(res.data.results || res.data))
        .catch(() => {})
        .finally(() => setLoadingIntegraciones(false))
    }
    if (activeSection === 'facturacion' && loadingPlan) {
      api.get(`/planes-facturacion/?clinica=${clinicaId}`)
        .then(res => {
          const data = res.data.results || res.data
          if (Array.isArray(data) && data.length > 0) setPlan(data[0])
          else if (!Array.isArray(data)) setPlan(data)
        })
        .catch(() => {})
        .finally(() => setLoadingPlan(false))
    }
  }, [activeSection, clinicaId, clinica, loadingEmails, loadingIntegraciones, loadingPlan])

  // ─── Handlers
  const handleSavePerfil = async () => {
    if (!perfil.nombre.trim()) return showToast('El nombre es requerido', 'error')
    setSavingPerfil(true)
    try {
      await api.patch(`/usuarios/${user?.id}/`, { nombre: perfil.nombre, email: perfil.email })
      showToast('Perfil actualizado correctamente')
    } catch {
      showToast('Error al actualizar el perfil', 'error')
    } finally { setSavingPerfil(false) }
  }

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.nueva) return showToast('Completa todos los campos', 'error')
    if (!validatePassword(passwords.nueva)) return showToast('La contraseña no cumple todos los requisitos', 'error')
    if (passwords.nueva !== passwords.confirmar) return showToast('Las contraseñas no coinciden', 'error')
    setSavingPassword(true)
    try {
      await api.post('/auth/change-password/', {
        old_password: passwords.current,
        new_password: passwords.nueva,
      })
      setPasswords({ current: '', nueva: '', confirmar: '' })
      showToast('Contraseña actualizada correctamente')
    } catch {
      showToast('Contraseña actual incorrecta', 'error')
    } finally { setSavingPassword(false) }
  }

  const handleSaveClinica = async () => {
    if (!editClinica.nombre.trim()) return showToast('El nombre es requerido', 'error')
    setSavingClinica(true)
    try {
      const res = await api.patch(`/clinicas/${clinicaId}/`, editClinica)
      setClinica(res.data)
      showToast('Datos de la clínica actualizados')
    } catch {
      showToast('Error al actualizar la clínica', 'error')
    } finally { setSavingClinica(false) }
  }

  const handleAddEmail = async () => {
    if (!emailForm.email) return showToast('El email es requerido', 'error')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.email)) return showToast('Email inválido', 'error')
    setSavingEmail(true)
    try {
      await api.post('/emails-notificacion/', { email: emailForm.email, nombre: emailForm.nombre, clinica: clinicaId, activo: true })
      setEmailForm({ email: '', nombre: '' })
      setShowEmailForm(false)
      showToast('Email agregado correctamente')
      const res = await api.get(`/emails-notificacion/?clinica=${clinicaId}`)
      setEmails(res.data.results || res.data)
    } catch (err: any) {
      showToast(err.response?.data?.non_field_errors?.[0] || 'Error al agregar el email', 'error')
    } finally { setSavingEmail(false) }
  }

  const confirmDeleteEmail = async () => {
    try {
      await api.patch(`/emails-notificacion/${confirmDelete.id}/`, { activo: false })
      setEmails(prev => prev.filter(e => e.id !== confirmDelete.id))
      showToast('Email eliminado')
    } catch { showToast('Error al eliminar', 'error') }
    setConfirmDelete({ open: false, id: 0, label: '' })
  }

  const handleSyncIntegracion = async (id: number) => {
    try {
      await api.post(`/integraciones/${id}/sync/`)
      showToast('Sincronización iniciada')
    } catch {
      showToast('Error al sincronizar', 'error')
    }
  }

  // ─── Skeleton loader
  const Skeleton = ({ h = 52, count = 3 }: { h?: number; count?: number }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div key={i} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          style={{ height: h, borderRadius: 14, background: 'rgba(255,255,255,0.04)' }} />
      ))}
    </div>
  )

  // ─── Save button
  const SaveButton = ({ onClick, loading, label = 'Guardar cambios' }: { onClick: () => void; loading: boolean; label?: string }) => (
    <motion.button onClick={onClick} disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
      style={{
        padding: '13px 32px', borderRadius: 14,
        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
        color: 'white', fontSize: 14, fontWeight: 600, border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
        display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: '0 4px 20px rgba(155,142,196,0.3)',
      }}>
      {loading ? (
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
      ) : <CheckIcon />}
      {loading ? 'Guardando...' : label}
    </motion.button>
  )

  // ─── Setting row helper
  const SettingRow = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div>
        <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{label}</p>
        {desc && <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{desc}</p>}
      </div>
      {children}
    </div>
  )

  // ─── Password field
  const PasswordField = ({ label, value, onChange, show, onToggle }: { label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void }) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)}
          style={{ ...inputStyle, paddingRight: 48 }} />
        <button type="button" onClick={onToggle}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}>
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  )

  // ─── Render sections
  const renderSection = () => {
    switch (activeSection) {
      // ═══════════════════════════════════════════════════════════
      // PERFIL
      // ═══════════════════════════════════════════════════════════
      case 'perfil':
        return (
          <motion.div key="perfil" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <h2 className="font-display" style={sectionTitle}>Perfil del administrador</h2>
            <p style={sectionDesc}>Administra tu información personal y cómo apareces en la plataforma.</p>

            <GlowingCard className="p-6 sm:p-8 lg:p-10">
              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 24,
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 32, fontWeight: 700, flexShrink: 0,
                }}>
                  {(user?.nombre || 'A')[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{user?.nombre}</p>
                  <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>{user?.email}</p>
                  <span style={{
                    display: 'inline-block', marginTop: 8,
                    fontSize: 12, padding: '4px 14px', borderRadius: 20,
                    background: 'rgba(155,142,196,0.12)', color: 'var(--primary)',
                    border: '1px solid rgba(155,142,196,0.2)', fontWeight: 600, textTransform: 'capitalize',
                  }}>
                    {user?.rol || 'Administrador'}
                  </span>
                </div>
              </div>

              {/* Form */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                <div>
                  <label style={labelStyle}>Nombre completo</label>
                  <input value={perfil.nombre} onChange={e => setPerfil({ ...perfil, nombre: e.target.value })}
                    style={inputStyle} placeholder="Tu nombre" />
                </div>
                <div>
                  <label style={labelStyle}>Correo electrónico</label>
                  <input type="email" value={perfil.email} onChange={e => setPerfil({ ...perfil, email: e.target.value })}
                    style={inputStyle} placeholder="tu@email.com" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
                <div>
                  <label style={labelStyle}>Rol</label>
                  <input value={user?.rol || 'Administrador'} disabled
                    style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
                </div>
                <div>
                  <label style={labelStyle}>Clínica</label>
                  <input value={user?.clinica_nombre || ''} disabled
                    style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
                </div>
              </div>

              <SaveButton onClick={handleSavePerfil} loading={savingPerfil} />
            </GlowingCard>
          </motion.div>
        )

      // ═══════════════════════════════════════════════════════════
      // SEGURIDAD
      // ═══════════════════════════════════════════════════════════
      case 'seguridad':
        return (
          <motion.div key="seguridad" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <h2 className="font-display" style={sectionTitle}>Seguridad</h2>
            <p style={sectionDesc}>Cambia tu contraseña y gestiona la seguridad de tu cuenta.</p>

            <GlowingCard className="p-6 sm:p-8 lg:p-10">
              <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>
                Cambiar contraseña
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
                <PasswordField label="Contraseña actual" value={passwords.current}
                  onChange={v => setPasswords({ ...passwords, current: v })}
                  show={showPasswords.current} onToggle={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <PasswordField label="Nueva contraseña" value={passwords.nueva}
                    onChange={v => setPasswords({ ...passwords, nueva: v })}
                    show={showPasswords.nueva} onToggle={() => setShowPasswords({ ...showPasswords, nueva: !showPasswords.nueva })} />
                  <PasswordField label="Confirmar contraseña" value={passwords.confirmar}
                    onChange={v => setPasswords({ ...passwords, confirmar: v })}
                    show={showPasswords.confirmar} onToggle={() => setShowPasswords({ ...showPasswords, confirmar: !showPasswords.confirmar })} />
                </div>
                <AnimatePresence>
                  {passwords.nueva && <PasswordRequirements password={passwords.nueva} />}
                </AnimatePresence>
              </div>
              <SaveButton onClick={handleChangePassword} loading={savingPassword || (passwords.nueva.length > 0 && !validatePassword(passwords.nueva))} label="Cambiar contraseña" />
            </GlowingCard>

            {/* Session info */}
            <div style={{ marginTop: 24 }}>
              <GlowingCard className="p-6 sm:p-8 lg:p-10">
                <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>
                  Sesión actual
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(160,196,181,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', flexShrink: 0 }}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>Navegador actual</p>
                    <p style={{ fontSize: 13, color: 'var(--muted)' }}>Sesión activa ahora</p>
                  </div>
                  <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: 'rgba(160,196,181,0.12)', color: 'var(--success)', border: '1px solid rgba(160,196,181,0.2)' }}>
                    Activa
                  </span>
                </div>

                <motion.button
                  onClick={() => { useAuthStore.getState().clearAuth(); router.push('/') }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{
                    marginTop: 20, padding: '12px 24px', borderRadius: 12,
                    background: 'rgba(232,160,196,0.1)', border: '1px solid rgba(232,160,196,0.2)',
                    color: 'var(--danger)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                  }}>
                  Cerrar todas las sesiones
                </motion.button>
              </GlowingCard>
            </div>
          </motion.div>
        )

      // ═══════════════════════════════════════════════════════════
      // CLÍNICA
      // ═══════════════════════════════════════════════════════════
      case 'clinica':
        return (
          <motion.div key="clinica" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <h2 className="font-display" style={sectionTitle}>Clínica</h2>
            <p style={sectionDesc}>Información general de tu clínica y sedes registradas.</p>

            {loadingClinica ? <Skeleton count={2} h={80} /> : (
              <>
                <GlowingCard className="p-6 sm:p-8 lg:p-10">
                  <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>
                    Datos generales
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                    <div>
                      <label style={labelStyle}>Nombre de la clínica</label>
                      <input value={editClinica.nombre} onChange={e => setEditClinica({ ...editClinica, nombre: e.target.value })}
                        style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Email de contacto</label>
                      <input type="email" value={editClinica.email} onChange={e => setEditClinica({ ...editClinica, email: e.target.value })}
                        style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
                    <div>
                      <label style={labelStyle}>Plan actual</label>
                      <input value={clinica?.plan || 'Básico'} disabled
                        style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Estado</label>
                      <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: 8, opacity: 0.5, cursor: 'not-allowed' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: clinica?.activa ? 'var(--success)' : 'var(--danger)' }} />
                        {clinica?.activa ? 'Activa' : 'Inactiva'}
                      </div>
                    </div>
                  </div>
                  <SaveButton onClick={handleSaveClinica} loading={savingClinica} />
                </GlowingCard>

                {/* Sedes */}
                <div style={{ marginTop: 24 }}>
                  <GlowingCard className="p-6 sm:p-8 lg:p-10">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                      <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                        Sedes
                      </h3>
                      <span style={{ fontSize: 13, fontWeight: 500, padding: '5px 14px', borderRadius: 20, background: 'rgba(155,142,196,0.12)', color: 'var(--primary)', border: '1px solid rgba(155,142,196,0.2)' }}>
                        {sedes.length} {sedes.length === 1 ? 'sede' : 'sedes'}
                      </span>
                    </div>
                    {sedes.length === 0 ? (
                      <p style={{ fontSize: 14, color: 'var(--muted)', textAlign: 'center', padding: '32px 0' }}>
                        No hay sedes registradas
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {sedes.map((s, i) => (
                          <motion.div key={s.id}
                            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(155,142,196,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                              <MapPinIcon />
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{s.nombre}</p>
                              <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{s.direccion || 'Sin dirección'}</p>
                            </div>
                            {s.telefono && (
                              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{s.telefono}</span>
                            )}
                            <span style={{
                              fontSize: 12, padding: '4px 12px', borderRadius: 20,
                              background: s.activa ? 'rgba(160,196,181,0.12)' : 'rgba(232,160,196,0.1)',
                              color: s.activa ? 'var(--success)' : 'var(--danger)',
                              border: s.activa ? '1px solid rgba(160,196,181,0.2)' : '1px solid rgba(232,160,196,0.2)',
                            }}>
                              {s.activa ? 'Activa' : 'Inactiva'}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </GlowingCard>
                </div>
              </>
            )}
          </motion.div>
        )

      // ═══════════════════════════════════════════════════════════
      // NOTIFICACIONES
      // ═══════════════════════════════════════════════════════════
      case 'notificaciones':
        return (
          <motion.div key="notificaciones" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <h2 className="font-display" style={sectionTitle}>Notificaciones</h2>
            <p style={sectionDesc}>Configura qué alertas recibes y los correos que reciben notificaciones.</p>

            {/* Alert preferences */}
            <GlowingCard className="p-6 sm:p-8 lg:p-10">
              <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                Preferencias de alertas
              </h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
                Selecciona qué tipos de alertas deseas recibir por correo electrónico.
              </p>
              <SettingRow label="Alertas críticas" desc="Recibir email inmediato cuando se detectan alertas críticas">
                <ToggleSwitch checked={alertPrefs.emailCriticas} onChange={v => setAlertPrefs({ ...alertPrefs, emailCriticas: v })} />
              </SettingRow>
              <SettingRow label="Alertas altas" desc="Notificaciones para alertas de severidad alta">
                <ToggleSwitch checked={alertPrefs.emailAltas} onChange={v => setAlertPrefs({ ...alertPrefs, emailAltas: v })} />
              </SettingRow>
              <SettingRow label="Alertas medias" desc="Incluir alertas de severidad media">
                <ToggleSwitch checked={alertPrefs.emailMedias} onChange={v => setAlertPrefs({ ...alertPrefs, emailMedias: v })} />
              </SettingRow>
              <SettingRow label="Alertas bajas" desc="Incluir alertas informativas de baja severidad">
                <ToggleSwitch checked={alertPrefs.emailBajas} onChange={v => setAlertPrefs({ ...alertPrefs, emailBajas: v })} />
              </SettingRow>
              <SettingRow label="Resumen diario" desc="Recibir un resumen por correo con las alertas del día">
                <ToggleSwitch checked={alertPrefs.resumenDiario} onChange={v => setAlertPrefs({ ...alertPrefs, resumenDiario: v })} />
              </SettingRow>
              <SettingRow label="Sonido de notificación" desc="Reproducir sonido al recibir alertas en el dashboard">
                <ToggleSwitch checked={alertPrefs.sonido} onChange={v => setAlertPrefs({ ...alertPrefs, sonido: v })} />
              </SettingRow>
            </GlowingCard>

            {/* Email list */}
            <div style={{ marginTop: 24 }}>
              <GlowingCard className="p-6 sm:p-8 lg:p-10">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <div>
                    <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                      Correos de notificación
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
                      Estos correos reciben las alertas al ejecutar análisis.
                    </p>
                  </div>
                  <motion.button onClick={() => setShowEmailForm(true)}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                    <PlusIcon /> Agregar
                  </motion.button>
                </div>

                {/* Add email form */}
                <AnimatePresence>
                  {showEmailForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: 'hidden', marginBottom: 20 }}>
                      <div style={{ padding: '20px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                          <div>
                            <label style={labelStyle}>Correo electrónico *</label>
                            <input type="email" value={emailForm.email} onChange={e => setEmailForm({ ...emailForm, email: e.target.value })}
                              placeholder="notificaciones@clinica.com" onKeyDown={e => e.key === 'Enter' && handleAddEmail()}
                              style={inputStyle} />
                          </div>
                          <div>
                            <label style={labelStyle}>Nombre (opcional)</label>
                            <input value={emailForm.nombre} onChange={e => setEmailForm({ ...emailForm, nombre: e.target.value })}
                              placeholder="Ej: Dr. Administrador" onKeyDown={e => e.key === 'Enter' && handleAddEmail()}
                              style={inputStyle} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <motion.button onClick={() => setShowEmailForm(false)}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            style={{ padding: '10px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}>
                            Cancelar
                          </motion.button>
                          <motion.button onClick={handleAddEmail} disabled={savingEmail}
                            whileHover={{ scale: savingEmail ? 1 : 1.02 }} whileTap={{ scale: savingEmail ? 1 : 0.98 }}
                            style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', fontSize: 13, fontWeight: 600, border: 'none', cursor: savingEmail ? 'not-allowed' : 'pointer' }}>
                            {savingEmail ? 'Guardando...' : 'Agregar'}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email list */}
                {loadingEmails ? <Skeleton count={3} /> : emails.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <p style={{ fontSize: 14, color: 'var(--muted)' }}>No hay correos adicionales configurados</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {emails.map((e, i) => (
                      <motion.div key={e.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                        <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                          {(e.nombre || e.email)[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {e.nombre && <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{e.nombre}</p>}
                          <p style={{ fontSize: 13, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.email}</p>
                        </div>
                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(160,196,181,0.12)', color: 'var(--success)', border: '1px solid rgba(160,196,181,0.2)' }}>
                          Activo
                        </span>
                        <motion.button onClick={() => setConfirmDelete({ open: true, id: e.id, label: e.email })} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(232,160,196,0.1)', border: '1px solid rgba(232,160,196,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--danger)', flexShrink: 0 }}>
                          <TrashIcon />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </GlowingCard>
            </div>
          </motion.div>
        )

      // ═══════════════════════════════════════════════════════════
      // APARIENCIA
      // ═══════════════════════════════════════════════════════════
      case 'apariencia':
        return (
          <motion.div key="apariencia" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <h2 className="font-display" style={sectionTitle}>Apariencia</h2>
            <p style={sectionDesc}>Personaliza el aspecto visual del dashboard según tus preferencias.</p>

            <GlowingCard className="p-6 sm:p-8 lg:p-10">
              <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>
                Tema
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
                {(['dark', 'light'] as const).map(t => (
                  <motion.button key={t} onClick={() => { if ((isDark ? 'dark' : 'light') !== t) toggleTheme() }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    style={{
                      padding: '24px', borderRadius: 18,
                      background: (isDark ? 'dark' : 'light') === t ? 'rgba(155,142,196,0.12)' : 'rgba(255,255,255,0.03)',
                      border: (isDark ? 'dark' : 'light') === t ? '2px solid var(--primary)' : '1px solid var(--border)',
                      cursor: 'pointer', textAlign: 'left',
                    }}>
                    <div style={{
                      width: '100%', height: 60, borderRadius: 12, marginBottom: 16,
                      background: t === 'dark'
                        ? 'linear-gradient(135deg, #0a0a0f, #1a1a2e)'
                        : 'linear-gradient(135deg, #f8f8fc, #e8e8f0)',
                      border: '1px solid var(--border)',
                    }} />
                    <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                      {t === 'dark' ? 'Oscuro' : 'Claro'}
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                      {t === 'dark' ? 'Tema oscuro con acentos púrpura' : 'Tema claro para entornos luminosos'}
                    </p>
                    {(isDark ? 'dark' : 'light') === t && (
                      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
                        <CheckIcon /> Activo
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                Preferencias de interfaz
              </h3>
              <SettingRow label="Animaciones" desc="Activar transiciones y efectos animados en la interfaz">
                <ToggleSwitch checked={apariencia.animaciones} onChange={v => setApariencia({ ...apariencia, animaciones: v })} />
              </SettingRow>
              <SettingRow label="Vista compacta" desc="Reducir el espaciado para mostrar más información">
                <ToggleSwitch checked={apariencia.compacto} onChange={v => setApariencia({ ...apariencia, compacto: v })} />
              </SettingRow>
              <SettingRow label="Auto-refresh" desc="Actualizar las alertas automáticamente cada 5 minutos">
                <ToggleSwitch checked={apariencia.autoRefresh} onChange={v => setApariencia({ ...apariencia, autoRefresh: v })} />
              </SettingRow>
            </GlowingCard>
          </motion.div>
        )

      // ═══════════════════════════════════════════════════════════
      // INTEGRACIONES
      // ═══════════════════════════════════════════════════════════
      case 'integraciones':
        return (
          <motion.div key="integraciones" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <h2 className="font-display" style={sectionTitle}>Integraciones</h2>
            <p style={sectionDesc}>Gestiona las conexiones con sistemas externos como ERP, HIS y otras fuentes de datos.</p>

            {loadingIntegraciones ? <Skeleton count={3} h={80} /> : (
              <GlowingCard className="p-6 sm:p-8 lg:p-10">
                {integraciones.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 0' }}>
                    <div style={{ color: 'var(--muted)', display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                      <LinkIcon />
                    </div>
                    <p className="font-display" style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
                      Sin integraciones configuradas
                    </p>
                    <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20, maxWidth: 400, margin: '0 auto 20px' }}>
                      Conecta tu clínica con sistemas de información hospitalaria (HIS), ERP u otras fuentes de datos para importar información automáticamente.
                    </p>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      style={{ padding: '11px 24px', borderRadius: 12, background: 'rgba(155,142,196,0.12)', color: 'var(--primary)', border: '1px solid rgba(155,142,196,0.2)', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                      Solicitar integración
                    </motion.button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {integraciones.map((integ, i) => (
                      <motion.div key={integ.id}
                        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px', borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: 14,
                          background: integ.estado === 'activa' ? 'rgba(160,196,181,0.12)' : 'rgba(255,255,255,0.06)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: integ.estado === 'activa' ? 'var(--success)' : 'var(--muted)', flexShrink: 0,
                        }}>
                          <LinkIcon />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{integ.nombre}</p>
                          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
                            {integ.tipo} · {integ.ultima_sync ? `Última sync: ${new Date(integ.ultima_sync).toLocaleDateString('es')}` : 'Nunca sincronizado'}
                          </p>
                        </div>
                        <span style={{
                          fontSize: 12, padding: '4px 12px', borderRadius: 20,
                          background: integ.estado === 'activa' ? 'rgba(160,196,181,0.12)' : 'rgba(232,160,196,0.1)',
                          color: integ.estado === 'activa' ? 'var(--success)' : 'var(--danger)',
                          border: integ.estado === 'activa' ? '1px solid rgba(160,196,181,0.2)' : '1px solid rgba(232,160,196,0.2)',
                        }}>
                          {integ.estado === 'activa' ? 'Conectada' : 'Desconectada'}
                        </span>
                        <motion.button onClick={() => handleSyncIntegracion(integ.id)}
                          whileHover={{ scale: 1.1, rotate: 180 }} whileTap={{ scale: 0.9 }}
                          style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'rgba(155,142,196,0.1)', border: '1px solid rgba(155,142,196,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'var(--primary)', flexShrink: 0,
                          }}>
                          <RefreshIcon />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </GlowingCard>
            )}
          </motion.div>
        )

      // ═══════════════════════════════════════════════════════════
      // FACTURACIÓN
      // ═══════════════════════════════════════════════════════════
      case 'facturacion':
        return (
          <motion.div key="facturacion" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <h2 className="font-display" style={sectionTitle}>Facturación</h2>
            <p style={sectionDesc}>Consulta tu plan actual, historial de facturación y métodos de pago.</p>

            {loadingPlan ? <Skeleton count={2} h={80} /> : (
              <>
                {/* Current plan */}
                <GlowingCard className="p-6 sm:p-8 lg:p-10">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                    <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                      Plan actual
                    </h3>
                    {plan && (
                      <span style={{
                        fontSize: 12, padding: '5px 16px', borderRadius: 20, fontWeight: 600,
                        background: plan.estado === 'activo' ? 'rgba(160,196,181,0.12)' : 'rgba(232,160,196,0.1)',
                        color: plan.estado === 'activo' ? 'var(--success)' : 'var(--danger)',
                        border: plan.estado === 'activo' ? '1px solid rgba(160,196,181,0.2)' : '1px solid rgba(232,160,196,0.2)',
                      }}>
                        {plan.estado === 'activo' ? 'Activo' : plan.estado}
                      </span>
                    )}
                  </div>

                  {plan ? (
                    <>
                      <div style={{
                        padding: '28px', borderRadius: 20, marginBottom: 24,
                        background: 'linear-gradient(135deg, rgba(155,142,196,0.15), rgba(124,111,191,0.08))',
                        border: '1px solid rgba(155,142,196,0.3)',
                      }}>
                        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>
                          Tu plan
                        </p>
                        <p className="font-display" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
                          {plan.plan}
                        </p>
                        <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>
                          {plan.moneda} {plan.monto.toLocaleString()}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--muted)' }}>/mes</span>
                        </p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div style={{ padding: '16px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fecha de inicio</p>
                          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
                            {new Date(plan.fecha_inicio).toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        <div style={{ padding: '16px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Próxima renovación</p>
                          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
                            {new Date(plan.fecha_renovacion).toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <CreditCardIcon />
                      <p className="font-display" style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginTop: 16, marginBottom: 8 }}>
                        Plan gratuito
                      </p>
                      <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
                        Actualmente estás utilizando el plan gratuito. Actualiza para acceder a más funcionalidades.
                      </p>
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        style={{
                          padding: '13px 32px', borderRadius: 14,
                          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                          color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
                          boxShadow: '0 4px 20px rgba(155,142,196,0.3)',
                        }}>
                        Ver planes disponibles
                      </motion.button>
                    </div>
                  )}
                </GlowingCard>

                {/* Usage info */}
                <div style={{ marginTop: 24 }}>
                  <GlowingCard className="p-6 sm:p-8 lg:p-10">
                    <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>
                      Uso del plan
                    </h3>
                    {[
                      { label: 'Análisis ejecutados', used: 45, total: 100 },
                      { label: 'Correos de notificación', used: emails.length, total: 10 },
                      { label: 'Integraciones activas', used: integraciones.filter(i => i.estado === 'activa').length, total: 3 },
                    ].map((item, i) => (
                      <div key={i} style={{ marginBottom: i < 2 ? 20 : 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{item.label}</p>
                          <p style={{ fontSize: 13, color: 'var(--muted)' }}>{item.used} / {item.total}</p>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((item.used / item.total) * 100, 100)}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                            style={{
                              height: '100%', borderRadius: 3,
                              background: (item.used / item.total) > 0.8
                                ? 'linear-gradient(90deg, var(--danger), #e88a8a)'
                                : 'linear-gradient(90deg, var(--primary), var(--accent))',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </GlowingCard>
                </div>
              </>
            )}
          </motion.div>
        )
    }
  }

  // ─── Main layout
  return (
    <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: 'var(--void)', position: 'relative', overflow: 'hidden' }}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <Aurora colorStops={['#9B8EC4', '#7C6FBF', '#C4B5E8']} amplitude={0.4} speed={0.1} />
      </div>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.03, backgroundImage: 'linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      <div className="px-5 sm:px-8 lg:px-12 xl:px-14 py-8 sm:py-10" style={{ position: 'relative', zIndex: 10, maxWidth: 1200, margin: '0 auto' }}>

        {/* HEADER */}
        <FadeContent direction="down" duration={0.5}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
            <motion.button
              onClick={() => router.push('/dashboard')}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text)' }}
            >
              <ArrowLeftIcon />
            </motion.button>
            <div>
              <h1 className="font-display" style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
                <BlurText text="Configuración" delay={50} />
              </h1>
              <p style={{ fontSize: 15, color: 'var(--muted)', marginTop: 4 }}>
                Administra tu cuenta, clínica y preferencias
              </p>
            </div>
          </div>
        </FadeContent>

        {/* LAYOUT: Sidebar + Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32 }}>

          {/* SIDEBAR */}
          <FadeContent direction="right" duration={0.4} delay={0.1}>
            <div style={{
              position: 'sticky', top: 32,
              padding: '8px', borderRadius: 22,
              background: 'var(--glass)', backdropFilter: 'blur(20px)',
              border: '1px solid var(--border)',
            }}>
              {SECTIONS.map((s, i) => (
                <motion.button
                  key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.04 }}
                  whileHover={{ x: 2 }}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px', borderRadius: 16,
                    background: activeSection === s.key ? 'rgba(155,142,196,0.15)' : 'transparent',
                    border: activeSection === s.key ? '1px solid rgba(155,142,196,0.25)' : '1px solid transparent',
                    color: activeSection === s.key ? 'var(--text)' : 'var(--muted)',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'background 0.2s, border 0.2s, color 0.2s',
                    marginBottom: 2,
                  }}
                >
                  <span style={{ color: activeSection === s.key ? 'var(--primary)' : 'var(--muted)', transition: 'color 0.2s', flexShrink: 0 }}>
                    {s.icon}
                  </span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: activeSection === s.key ? 600 : 500, lineHeight: 1.3 }}>{s.label}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1, opacity: activeSection === s.key ? 1 : 0.7 }}>{s.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </FadeContent>

          {/* CONTENT */}
          <FadeContent direction="up" duration={0.4} delay={0.2}>
            <AnimatePresence mode="wait">
              {renderSection()}
            </AnimatePresence>
          </FadeContent>
        </div>
      </div>

      <ConfirmModal
        open={confirmDelete.open}
        title="Eliminar correo"
        message={`¿Estás seguro de que deseas eliminar el correo ${confirmDelete.label}? Ya no recibirá notificaciones de alertas.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={confirmDeleteEmail}
        onCancel={() => setConfirmDelete({ open: false, id: 0, label: '' })}
      />
    </div>
  )
}
