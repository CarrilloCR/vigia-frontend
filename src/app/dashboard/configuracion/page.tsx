'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../lib/axios'
import { useAuthStore } from '../../../store/auth'
import { useThemeStore } from '../../../store/theme'
import { usePrefsStore } from '../../../store/prefs'
import { IDIOMAS } from '../../../lib/i18n'
import { useToastStore } from '../../../store/toast'
import GlowingCard from '../../../components/reactbits/GlowingCard'
import FadeContent from '../../../components/reactbits/FadeContent'
import BlurText from '../../../components/reactbits/BlurText'
import ToggleSwitch from '../../../components/reactbits/ToggleSwitch'
import PasswordRequirements, { validatePassword } from '../../../components/ui/PasswordRequirements'
import ConfirmModal from '../../../components/ui/ConfirmModal'
import CreditCard3D, { type CardData } from '../../../components/ui/CreditCard3D'
import type { Clinica, Sede, IntegracionExterna, PlanFacturacion } from '../../../types'
import StarBorder from '../../../components/reactbits/StarBorder'
import GlareHover from '../../../components/reactbits/GlareHover'

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
const AutoIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
  </svg>
)
const SparklesIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M5 3l.7 2.1L7.8 6l-2.1.7L5 8.8l-.7-2.1L2.2 6l2.1-.7z"/><path d="M19 15l.7 2.1 2.1.7-2.1.7L19 20.5l-.7-2.1-2.1-.7 2.1-.7z"/>
  </svg>
)
const ClockIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const SlidersIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
    <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
    <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
  </svg>
)
const TeamIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const XIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const UserMinusIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/>
  </svg>
)

// ─── Types ───────────────────────────────────────────────────────────────────

type Section = 'perfil' | 'seguridad' | 'clinica' | 'notificaciones' | 'automatizacion' | 'alertas' | 'apariencia' | 'integraciones' | 'facturacion' | 'superadmin' | 'equipo'

type EquipoRol = 'admin' | 'gerente' | 'medico' | 'viewer'
const EQUIPO_ROLES: { key: EquipoRol; label: string; desc: string }[] = [
  { key: 'admin',   label: 'Administrador', desc: 'Acceso completo, gestiona usuarios y configuración' },
  { key: 'gerente', label: 'Gerente',        desc: 'Reportes, equipo y alertas. Sin cambios de sistema' },
  { key: 'medico',  label: 'Personal Médico',desc: 'Ve sus alertas y KPIs asociados' },
  { key: 'viewer',  label: 'Visualizador',   desc: 'Solo lectura del dashboard' },
]
const EQUIPO_ROL_STYLE: Record<EquipoRol, { bg: string; color: string; border: string }> = {
  admin:   { bg: 'rgba(0,214,178,0.15)', color: '#00D6B2', border: 'rgba(0,214,178,0.3)' },
  gerente: { bg: 'rgba(74,158,240,0.12)', color: '#4A9EF0', border: 'rgba(74,158,240,0.25)' },
  medico:  { bg: 'rgba(0,214,178,0.12)', color: '#00D6B2', border: 'rgba(0,214,178,0.25)' },
  viewer:  { bg: 'rgba(139,137,160,0.1)',  color: '#8B89A0', border: 'rgba(139,137,160,0.2)' },
}

interface EmailNotificacion {
  id: number
  email: string
  nombre: string
  activo: boolean
  clinica: number
}

interface ConfigAlerta {
  id?: number
  tipo_kpi: string
  canal: 'email' | 'whatsapp'
  umbral_sensibilidad: number
  activa: boolean
  clinica: number
}

const KPI_TIPOS: { key: string; label: string }[] = [
  { key: 'tasa_cancelacion',   label: 'Tasa de Cancelación' },
  { key: 'tasa_noshow',        label: 'Tasa de No Show' },
  { key: 'ocupacion_agenda',   label: 'Ocupación de Agenda' },
  { key: 'tiempo_espera',      label: 'Tiempo Promedio de Espera' },
  { key: 'ingresos_dia',       label: 'Ingresos por Día' },
  { key: 'ticket_promedio',    label: 'Ticket Promedio' },
  { key: 'pacientes_nuevos',   label: 'Pacientes Nuevos vs Recurrentes' },
  { key: 'retencion_90',       label: 'Retención a 90 Días' },
  { key: 'cancelaciones_medico', label: 'Cancelaciones por Médico' },
  { key: 'citas_reagendadas',  label: 'Citas Reagendadas' },
  { key: 'nps',                label: 'Net Promoter Score' },
]

const SECTIONS: { key: Section; label: string; icon: React.ReactNode; desc: string; superadminOnly?: boolean; roles?: string[] }[] = [
  { key: 'perfil', label: 'Perfil', icon: <UserIcon />, desc: 'Información personal' },
  { key: 'seguridad', label: 'Seguridad', icon: <LockIcon />, desc: 'Contraseña y acceso' },
  { key: 'apariencia', label: 'Apariencia', icon: <PaletteIcon />, desc: 'Tema y visualización' },
  { key: 'clinica', label: 'Clínica', icon: <BuildingIcon />, desc: 'Datos de la clínica', roles: ['superadmin', 'admin', 'gerente'] },
  { key: 'notificaciones', label: 'Notificaciones', icon: <BellIcon />, desc: 'Alertas y correos', roles: ['superadmin', 'admin', 'gerente'] },
  { key: 'automatizacion', label: 'Automatización', icon: <AutoIcon />, desc: 'Motor y análisis IA', roles: ['superadmin', 'admin'] },
  { key: 'alertas', label: 'Reglas de Alertas', icon: <SlidersIcon />, desc: 'Umbrales por KPI', roles: ['superadmin', 'admin', 'gerente'] },
  { key: 'integraciones', label: 'Integraciones', icon: <LinkIcon />, desc: 'Conexiones externas', roles: ['superadmin', 'admin', 'gerente'] },
  { key: 'facturacion', label: 'Facturación', icon: <CreditCardIcon />, desc: 'Plan y pagos', roles: ['superadmin', 'admin'] },
  { key: 'equipo', label: 'Equipo', icon: <TeamIcon />, desc: 'Usuarios y roles de acceso', roles: ['superadmin', 'admin', 'gerente'] },
  { key: 'superadmin', label: 'Super Admin', icon: <BuildingIcon />, desc: 'Gestión global de clínicas', superadminOnly: true },
]

const SECTION_GROUPS: { label: string; keys: Section[] }[] = [
  { label: 'Cuenta',  keys: ['perfil', 'seguridad', 'apariencia'] },
  { label: 'Clínica', keys: ['clinica', 'notificaciones', 'automatizacion', 'alertas'] },
  { label: 'Sistema', keys: ['integraciones', 'facturacion', 'equipo'] },
  { label: 'Global',  keys: ['superadmin'] },
]

// ─── Styles ──────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 15px',
  borderRadius: 'var(--r-md)',
  background: 'var(--sunken)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  fontSize: 14.5,
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--sub)',
  marginBottom: 7,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.09em',
  display: 'block',
}

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Syne, sans-serif',
  fontSize: 16,
  fontWeight: 700,
  color: 'var(--text)',
  marginBottom: 6,
  letterSpacing: '-0.01em',
}

const sectionDesc: React.CSSProperties = {
  fontSize: 13.5,
  color: 'var(--muted)',
  marginBottom: 24,
  lineHeight: 1.6,
}

// ─── Sub-components (defined outside to prevent remount on parent re-render) ──

function Skeleton({ h = 52, count = 3 }: { h?: number; count?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div key={i} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          style={{ height: h, borderRadius: 14, background: 'var(--sunken)' }} />
      ))}
    </div>
  )
}

function SaveButton({ onClick, loading, label = 'Guardar cambios' }: { onClick: () => void; loading: boolean; label?: string }) {
  return (
    <motion.button onClick={onClick} disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
      style={{
        padding: '13px 30px', borderRadius: 'var(--r-md)',
        background: 'linear-gradient(135deg, var(--jade), #06B79B)',
        color: '#03130F', fontSize: 14, fontWeight: 700, border: '1px solid rgba(0,214,178,0.5)',
        cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
        display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: 'var(--shadow-brand)',
      }}>
      {loading
        ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ width: 16, height: 16, border: '2px solid rgba(3,19,15,0.35)', borderTopColor: '#03130F', borderRadius: '50%' }} />
        : <CheckIcon />}
      {loading ? 'Guardando...' : label}
    </motion.button>
  )
}

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--sunken)' }}>
      <div>
        <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{label}</p>
        {desc && <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{desc}</p>}
      </div>
      {children}
    </div>
  )
}

function PasswordField({ label, value, onChange, show, onToggle }: { label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void }) {
  return (
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
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ConfiguracionPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { activeClinicaId } = useAuthStore(); const clinicaId = activeClinicaId || 1

  const [activeSection, setActiveSection] = useState<Section>('perfil')
  const toast = useToastStore()

  // ─── Perfil state
  const [perfil, setPerfil] = useState({ nombre: user?.nombre || '', email: user?.email || '' })
  const [savingPerfil, setSavingPerfil] = useState(false)
  const [avatarBase64, setAvatarBase64] = useState<string>('')
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // ─── Seguridad state
  const [passwords, setPasswords] = useState({ current: '', nueva: '', confirmar: '' })
  const [showPasswords, setShowPasswords] = useState({ current: false, nueva: false, confirmar: false })
  const [savingPassword, setSavingPassword] = useState(false)

  // ─── Clínica state
  const [clinica, setClinica] = useState<Clinica | null>(null)
  const [sedes, setSedes] = useState<Sede[]>([])
  const [loadingClinica, setLoadingClinica] = useState(true)
  const [miembrosCount, setMiembrosCount] = useState(0)
  const [editClinica, setEditClinica] = useState({ nombre: '', email: '', descripcion: '', ciudad: '', especialidad: '', color_acento: '', logo: '' })
  const [savingClinica, setSavingClinica] = useState(false)

  // ─── Sede CRUD state
  const [showNuevaSede, setShowNuevaSede] = useState(false)
  const [nuevaSedeForm, setNuevaSedeForm] = useState({ nombre: '', direccion: '', telefono: '' })
  const [savingSede, setSavingSede] = useState(false)
  const [editandoSede, setEditandoSede] = useState<number | null>(null)
  const [editSedeForm, setEditSedeForm] = useState({ nombre: '', direccion: '', telefono: '' })
  const [confirmDeleteSede, setConfirmDeleteSede] = useState<{ open: boolean; id: number; nombre: string }>({ open: false, id: 0, nombre: '' })

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
  })
  // Guarda las severidades notificables en la clínica (backend real).
  const guardarSeveridades = async (next: typeof alertPrefs) => {
    setAlertPrefs(next)
    const sev = [
      next.emailCriticas && 'critica', next.emailAltas && 'alta',
      next.emailMedias && 'media', next.emailBajas && 'baja',
    ].filter(Boolean).join(',')
    try {
      const res = await api.patch(`/clinicas/${clinicaId}/`, { notif_severidades: sev })
      setClinica(res.data)
    } catch { showToast('No se pudo guardar la preferencia', 'error') }
  }

  // ─── WhatsApp state
  const [whatsappNumero, setWhatsappNumero] = useState('')
  const [savingWhatsapp, setSavingWhatsapp] = useState(false)

  // ─── Automatización state
  const [motorConfig, setMotorConfig] = useState({
    motor_automatico: false,
    motor_intervalo_horas: 1 as 1 | 6 | 12 | 24,
    claude_activo: true,
  })
  const [savingMotor, setSavingMotor] = useState(false)

  // ─── Config Alertas state
  const [configAlertas, setConfigAlertas] = useState<Record<string, ConfigAlerta>>({})
  const [loadingConfigAlertas, setLoadingConfigAlertas] = useState(true)
  const [savingConfigAlertas, setSavingConfigAlertas] = useState(false)

  // ─── Apariencia state
  const { isDark, toggle: toggleTheme } = useThemeStore()
  const { animaciones, compacto, autoRefresh, cursorCustom, sonido, idioma, fontSize, set: setPrefs } = usePrefsStore()
  const prefs = { animaciones, compacto, autoRefresh, cursorCustom, sonido }

  // ─── Integraciones state
  const [integraciones, setIntegraciones] = useState<IntegracionExterna[]>([])
  const [loadingIntegraciones, setLoadingIntegraciones] = useState(true)

  // ─── Super Admin state
  const [todasClinicas, setTodasClinicas] = useState<Clinica[]>([])
  const [loadingTodasClinicas, setLoadingTodasClinicas] = useState(false)
  const [nuevaClinicaForm, setNuevaClinicaForm] = useState({ nombre: '', email: '', plan: 'gratis' })
  const [savingNuevaClinica, setSavingNuevaClinica] = useState(false)
  const [confirmDeleteClinica, setConfirmDeleteClinica] = useState<{ open: boolean; id: number; nombre: string }>({ open: false, id: 0, nombre: '' })
  const [deletingClinica, setDeletingClinica] = useState(false)
  const [expandedClinica, setExpandedClinica] = useState<number | null>(null)
  const [sedesPorClinica, setSedesPorClinica] = useState<Record<number, Sede[]>>({})
  const [loadingSedesClinica, setLoadingSedesClinica] = useState<Record<number, boolean>>({})

  // ─── CSV state
  const [csvTipo, setCsvTipo] = useState<'kpi' | 'citas'>('kpi')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvSedeId, setCsvSedeId] = useState<string>('')
  const [csvLoading, setCsvLoading] = useState(false)
  const [csvResult, setCsvResult] = useState<{ creados: number; errores: string[]; total_filas: number } | null>(null)

  // ─── Equipo state
  const esAdmin = user?.rol === 'admin' || user?.rol === 'gerente' || user?.rol === 'superadmin'
  const [equipoUsuarios, setEquipoUsuarios] = useState<any[]>([])
  const [equipoSolicitudes, setEquipoSolicitudes] = useState<any[]>([])
  const [loadingEquipo, setLoadingEquipo] = useState(true)
  const [showInvitar, setShowInvitar] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: '', nombre: '', rol: 'viewer' as EquipoRol })
  const [savingInvite, setSavingInvite] = useState(false)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [confirmDesactivar, setConfirmDesactivar] = useState<{ open: boolean; id: number; nombre: string }>({ open: false, id: 0, nombre: '' })
  const [showSolicitud, setShowSolicitud] = useState(false)
  const [solicitudForm, setSolicitudForm] = useState({ rol_solicitado: 'gerente' as EquipoRol, motivo: '' })
  const [savingSolicitud, setSavingSolicitud] = useState(false)

  // ─── Facturación state
  const [plan, setPlan] = useState<PlanFacturacion | null>(null)
  const [loadingPlan, setLoadingPlan] = useState(true)
  const [pagoModal, setPagoModal] = useState(false)
  const [planElegido, setPlanElegido] = useState<string | null>(null)
  const [cardData, setCardData] = useState<CardData>({ numero: '', nombre: '', expiry: '', cvv: '' })
  const [cardFocused, setCardFocused] = useState<string | null>(null)
  const [procesandoPago, setProcesandoPago] = useState(false)

  // ─── Super admin: solicitudes de administrador pendientes (cross-clínica)
  const [adminsPend, setAdminsPend] = useState<Array<{ id: number; nombre: string; email: string; clinica_nombre?: string; clinica?: number }>>([])
  const [loadingAdminsPend, setLoadingAdminsPend] = useState(false)
  // ─── Super admin: solicitudes de plan Enterprise
  const [solicitudesPlan, setSolicitudesPlan] = useState<Array<{ id: number; clinica_nombre?: string; solicitante_nombre?: string; solicitante_email?: string; mensaje: string }>>([])
  // ─── Admin: solicitar Enterprise
  const [enterpriseModal, setEnterpriseModal] = useState(false)
  const [enterpriseMsg, setEnterpriseMsg] = useState('')
  const [enviandoEnterprise, setEnviandoEnterprise] = useState(false)
  // ─── Cerrar otras sesiones (requiere contraseña)
  const [cerrarSesModal, setCerrarSesModal] = useState(false)
  const [cerrarSesPass, setCerrarSesPass] = useState('')
  const [cerrandoSes, setCerrandoSes] = useState(false)
  // ─── Sincronización con HIS externo
  const [syncingHis, setSyncingHis] = useState(false)
  // ─── Wizard de conexión HIS
  const [hisModal, setHisModal] = useState(false)
  const [hisForm, setHisForm] = useState({ nombre: '', url: '', key: '' })
  const [hisProbando, setHisProbando] = useState(false)
  const [hisResumen, setHisResumen] = useState<any>(null)
  const [hisMapeo, setHisMapeo] = useState<Record<string, string> | null>(null)
  const [hisConectando, setHisConectando] = useState(false)
  // ─── Abandonar clínica / borrar perfil
  const [abandonarModal, setAbandonarModal] = useState(false)
  const [abandonarPass, setAbandonarPass] = useState('')
  const [abandonando, setAbandonando] = useState(false)
  const [borrandoPerfil, setBorrandoPerfil] = useState(false)

  // ─── Toast helper
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') toast.success(msg)
    else toast.error(msg)
  }

  // Solo admin/superadmin editan la info de la clínica y sus sedes.
  const puedeEditarClinica = user?.rol === 'admin' || user?.rol === 'superadmin'
  // Límites del plan actual (cupos de miembros/sedes).
  const PLAN_LIMITES: Record<string, { usuarios: number; sedes: number; label: string }> = {
    gratis: { usuarios: 5, sedes: 1, label: 'Gratis' },
    basico: { usuarios: 20, sedes: 2, label: 'Básico' },
    profesional: { usuarios: 100, sedes: 4, label: 'Profesional' },
    enterprise: { usuarios: 100000, sedes: 100000, label: 'Enterprise' },
  }
  const limitesPlan = PLAN_LIMITES[clinica?.plan ?? 'gratis'] ?? PLAN_LIMITES.gratis

  // ─── Data fetching
  useEffect(() => {
    if ((activeSection === 'clinica' || activeSection === 'automatizacion' || activeSection === 'notificaciones') && !clinica) {
      setLoadingClinica(true)
      Promise.all([
        api.get(`/clinicas/${clinicaId}/`).catch(() => null),
        api.get(`/sedes/?clinica=${clinicaId}`).catch(() => null),
      ]).then(([clinRes, sedesRes]) => {
        if (clinRes?.data) {
          setClinica(clinRes.data)
          setEditClinica({
            nombre: clinRes.data.nombre || '', email: clinRes.data.email || '',
            descripcion: clinRes.data.descripcion || '', ciudad: clinRes.data.ciudad || '',
            especialidad: clinRes.data.especialidad || '', color_acento: clinRes.data.color_acento || '',
            logo: clinRes.data.logo || '',
          })
          setWhatsappNumero(clinRes.data.whatsapp_numero || '')
          const sev = String(clinRes.data.notif_severidades || 'critica,alta,media,baja')
          setAlertPrefs({
            emailCriticas: sev.includes('critica'), emailAltas: sev.includes('alta'),
            emailMedias: sev.includes('media'), emailBajas: sev.includes('baja'),
          })
          setMotorConfig({
            motor_automatico: clinRes.data.motor_automatico ?? false,
            motor_intervalo_horas: clinRes.data.motor_intervalo_horas ?? 1,
            claude_activo: clinRes.data.claude_activo ?? true,
          })
        }
        if (sedesRes?.data) setSedes(sedesRes.data.results || sedesRes.data)
      }).finally(() => setLoadingClinica(false))
      // Conteo de miembros activos aprobados (cupo del plan)
      api.get(`/usuarios/?clinica=${clinicaId}&estado=aprobado`)
        .then(res => {
          const data = res.data.results || res.data
          setMiembrosCount((data as any[]).filter(u => !String(u.email || '').startsWith('INACTIVO')).length)
        })
        .catch(() => {})
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
      api.get(`/planes/?clinica=${clinicaId}`)
        .then(res => {
          const data = res.data.results || res.data
          if (Array.isArray(data) && data.length > 0) setPlan(data[0])
          else if (!Array.isArray(data)) setPlan(data)
        })
        .catch(() => {})
        .finally(() => setLoadingPlan(false))
    }
    if (activeSection === 'superadmin' && user?.rol === 'superadmin' && !loadingTodasClinicas && todasClinicas.length === 0) {
      setLoadingTodasClinicas(true)
      api.get('/clinicas/').then(res => setTodasClinicas(res.data.results || res.data)).catch(() => {}).finally(() => setLoadingTodasClinicas(false))
    }
    if (activeSection === 'superadmin' && user?.rol === 'superadmin') {
      setLoadingAdminsPend(true)
      api.get('/usuarios/?estado=pendiente&rol=admin')
        .then(res => setAdminsPend(res.data.results || res.data))
        .catch(() => {})
        .finally(() => setLoadingAdminsPend(false))
      api.get('/facturacion/solicitudes-plan/?estado=pendiente')
        .then(res => setSolicitudesPlan(res.data.results || res.data))
        .catch(() => {})
    }
    if (activeSection === 'equipo' && loadingEquipo) {
      Promise.all([
        api.get(`/usuarios/?clinica=${clinicaId}`).catch(() => null),
        api.get(user?.rol === 'admin' || user?.rol === 'superadmin'
          ? `/solicitudes-rol/?estado=pendiente`
          : `/solicitudes-rol/?clinica=${clinicaId}&estado=pendiente`
        ).catch(() => null),
      ]).then(([uRes, sRes]) => {
        if (uRes?.data) {
          const data = uRes.data.results || uRes.data
          setEquipoUsuarios(data.filter((u: any) => !String(u.email || '').startsWith('INACTIVO')))
        }
        if (sRes?.data) setEquipoSolicitudes(sRes.data.results || sRes.data)
      }).finally(() => setLoadingEquipo(false))
    }
    if (activeSection === 'alertas' && loadingConfigAlertas) {
      api.get(`/configuraciones/?clinica=${clinicaId}`)
        .then(res => {
          const data: ConfigAlerta[] = res.data.results || res.data
          const map: Record<string, ConfigAlerta> = {}
          // Inicializar todos los KPIs con defaults
          KPI_TIPOS.forEach(k => {
            map[k.key] = { tipo_kpi: k.key, canal: 'email', umbral_sensibilidad: 20, activa: true, clinica: clinicaId }
          })
          // Sobreescribir con valores reales
          data.forEach(c => { map[c.tipo_kpi] = c })
          setConfigAlertas(map)
        })
        .catch(() => {})
        .finally(() => setLoadingConfigAlertas(false))
    }
    if (activeSection === 'perfil' && user?.id && !avatarBase64) {
      api.get(`/usuarios/${user.id}/`).then(res => {
        if (res.data.avatar) {
          setAvatarBase64(res.data.avatar)
          // Sync into store so header updates everywhere
          useAuthStore.setState(s => ({ user: s.user ? { ...s.user, avatar: res.data.avatar } : null }))
        }
      }).catch(() => {})
    }
  }, [activeSection, clinicaId, clinica, loadingEmails, loadingIntegraciones, loadingPlan, loadingConfigAlertas, loadingTodasClinicas, todasClinicas.length])

  // ─── Handlers
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) return showToast('La imagen no puede superar 2 MB', 'error')
    const reader = new FileReader()
    reader.onload = () => setAvatarBase64(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSavePerfil = async () => {
    if (!perfil.nombre.trim()) return showToast('El nombre es requerido', 'error')
    setSavingPerfil(true)
    try {
      await api.patch(`/usuarios/${user?.id}/`, {
        nombre: perfil.nombre,
        email: perfil.email,
        ...(avatarBase64 ? { avatar: avatarBase64 } : {}),
      })
      // Sync avatar into auth store so header/sidebar update immediately
      if (avatarBase64) {
        useAuthStore.setState(s => ({ user: s.user ? { ...s.user, avatar: avatarBase64 } : null }))
      }
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
      await api.put('/auth/cambiar-password/', {
        password_actual: passwords.current,
        password_nuevo: passwords.nueva,
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

  const handleCrearSede = async () => {
    if (!nuevaSedeForm.nombre.trim()) return showToast('El nombre es requerido', 'error')
    setSavingSede(true)
    try {
      const res = await api.post('/sedes/', { ...nuevaSedeForm, clinica: clinicaId, activa: true })
      setSedes(prev => [...prev, res.data])
      setNuevaSedeForm({ nombre: '', direccion: '', telefono: '' })
      setShowNuevaSede(false)
      showToast('Sede creada correctamente')
    } catch {
      showToast('Error al crear la sede', 'error')
    } finally { setSavingSede(false) }
  }

  const handleEditarSede = async (id: number) => {
    if (!editSedeForm.nombre.trim()) return showToast('El nombre es requerido', 'error')
    setSavingSede(true)
    try {
      const res = await api.patch(`/sedes/${id}/`, editSedeForm)
      setSedes(prev => prev.map(s => s.id === id ? res.data : s))
      setEditandoSede(null)
      showToast('Sede actualizada')
    } catch {
      showToast('Error al actualizar la sede', 'error')
    } finally { setSavingSede(false) }
  }

  const handleToggleActiva = async (sede: Sede) => {
    try {
      const res = await api.patch(`/sedes/${sede.id}/`, { activa: !sede.activa })
      setSedes(prev => prev.map(s => s.id === sede.id ? res.data : s))
      showToast(`Sede ${res.data.activa ? 'activada' : 'desactivada'}`)
    } catch {
      showToast('Error al cambiar el estado', 'error')
    }
  }

  const handleEliminarSede = async (id: number) => {
    try {
      await api.delete(`/sedes/${id}/`)
      setSedes(prev => prev.filter(s => s.id !== id))
      setConfirmDeleteSede({ open: false, id: 0, nombre: '' })
      showToast('Sede eliminada')
    } catch {
      showToast('No se puede eliminar — tiene datos asociados', 'error')
    }
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

  const handleSaveMotorConfig = async () => {
    setSavingMotor(true)
    try {
      const res = await api.patch(`/clinicas/${clinicaId}/`, motorConfig)
      setClinica(res.data)
      setMotorConfig({
        motor_automatico: res.data.motor_automatico,
        motor_intervalo_horas: res.data.motor_intervalo_horas,
        claude_activo: res.data.claude_activo,
      })
      showToast('Configuración de automatización guardada')
    } catch {
      showToast('Error al guardar la configuración', 'error')
    } finally { setSavingMotor(false) }
  }

  const handleSyncIntegracion = async (id: number) => {
    try {
      await api.post(`/integraciones/${id}/sync/`)
      showToast('Sincronización iniciada')
    } catch {
      showToast('Error al sincronizar', 'error')
    }
  }

  const handleImportarCSV = async () => {
    if (!csvFile) return showToast('Selecciona un archivo', 'error')
    setCsvLoading(true)
    const form = new FormData()
    form.append('clinica_id', String(clinicaId))
    if (csvSedeId) form.append('sede_id', csvSedeId)
    form.append('tipo', csvTipo)
    form.append('file', csvFile)
    try {
      const res = await api.post('/integraciones/importar_csv/', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setCsvResult(res.data)
      showToast(`${res.data.creados} registros importados correctamente`)
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Error al importar', 'error')
    } finally { setCsvLoading(false) }
  }

  const handleSaveWhatsapp = async () => {
    setSavingWhatsapp(true)
    try {
      await api.patch(`/clinicas/${clinicaId}/`, { whatsapp_numero: whatsappNumero })
      showToast('Número de WhatsApp guardado')
    } catch { showToast('Error al guardar', 'error') }
    finally { setSavingWhatsapp(false) }
  }

  const handleSaveConfigAlertas = async () => {
    setSavingConfigAlertas(true)
    try {
      await Promise.all(
        Object.values(configAlertas).map(cfg =>
          cfg.id
            ? api.patch(`/configuraciones/${cfg.id}/`, cfg)
            : api.post(`/configuraciones/`, { ...cfg, clinica: clinicaId })
        )
      )
      // Recargar para obtener IDs de los nuevos registros
      const res = await api.get(`/configuraciones/?clinica=${clinicaId}`)
      const data: ConfigAlerta[] = res.data.results || res.data
      const map: Record<string, ConfigAlerta> = { ...configAlertas }
      data.forEach(c => { map[c.tipo_kpi] = c })
      setConfigAlertas(map)
      showToast('Reglas de alertas guardadas')
    } catch { showToast('Error al guardar', 'error') }
    finally { setSavingConfigAlertas(false) }
  }

  // ─── Equipo handlers
  const fetchEquipo = async () => {
    try {
      const [uRes, sRes] = await Promise.all([
        api.get(`/usuarios/?clinica=${clinicaId}`),
        api.get(user?.rol === 'admin' || user?.rol === 'superadmin'
          ? `/solicitudes-rol/?estado=pendiente`
          : `/solicitudes-rol/?clinica=${clinicaId}&estado=pendiente`
        ),
      ])
      const data = uRes.data.results || uRes.data
      setEquipoUsuarios(data.filter((u: any) => !String(u.email || '').startsWith('INACTIVO')))
      setEquipoSolicitudes(sRes.data.results || sRes.data)
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
      await fetchEquipo()
      toast.success('Usuario invitado correctamente')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al invitar usuario')
    } finally { setSavingInvite(false) }
  }

  const handleCambiarRol = async (id: number, rol: EquipoRol) => {
    try {
      await api.post(`/usuarios/${id}/cambiar_rol/`, { rol })
      setEquipoUsuarios(prev => prev.map(u => u.id === id ? { ...u, rol } : u))
      toast.success('Rol actualizado')
    } catch { toast.error('Error al cambiar el rol') }
  }

  const handleDesactivar = async (id: number) => {
    try {
      await api.post(`/usuarios/${id}/desactivar/`)
      setEquipoUsuarios(prev => prev.filter(u => u.id !== id))
      toast.success('Usuario desactivado')
    } catch { toast.error('Error al desactivar el usuario') }
    setConfirmDesactivar({ open: false, id: 0, nombre: '' })
  }

  const handleAprobarSolicitud = async (solicitudId: number) => {
    try {
      await api.post(`/solicitudes-rol/${solicitudId}/aprobar/`, { revisor_id: user?.id })
      setEquipoSolicitudes(prev => prev.filter(s => s.id !== solicitudId))
      await fetchEquipo()
      toast.success('Solicitud aprobada — rol actualizado')
    } catch { toast.error('Error al aprobar la solicitud') }
  }

  const handleRechazarSolicitud = async (solicitudId: number) => {
    try {
      await api.post(`/solicitudes-rol/${solicitudId}/rechazar/`, { revisor_id: user?.id })
      setEquipoSolicitudes(prev => prev.filter(s => s.id !== solicitudId))
      toast.success('Solicitud rechazada')
    } catch { toast.error('Error al rechazar la solicitud') }
  }

  const handleSolicitarRol = async () => {
    if (!solicitudForm.motivo.trim()) return toast.error('El motivo es requerido')
    setSavingSolicitud(true)
    try {
      await api.post('/solicitudes-rol/', {
        usuario: user?.id, rol_solicitado: solicitudForm.rol_solicitado, motivo: solicitudForm.motivo,
      })
      setShowSolicitud(false)
      setSolicitudForm({ rol_solicitado: 'gerente', motivo: '' })
      toast.success('Solicitud enviada — un administrador la revisará')
    } catch { toast.error('Error al enviar la solicitud') }
    finally { setSavingSolicitud(false) }
  }

  // ─── Render sections
  const renderSection = () => {
    switch (activeSection) {
      // ═══════════════════════════════════════════════════════════
      // PERFIL
      // ═══════════════════════════════════════════════════════════
      case 'perfil':
        return (
          <motion.div key="perfil" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <p style={sectionDesc}>Administra tu información personal y cómo apareces en la plataforma.</p>

            <GlowingCard className="p-6 sm:p-8 lg:p-10">
              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                <motion.div
                  onClick={() => avatarInputRef.current?.click()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: 80, height: 80, borderRadius: 24, flexShrink: 0,
                    background: avatarBase64
                      ? 'transparent'
                      : 'linear-gradient(135deg, var(--primary), var(--accent))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 32, fontWeight: 700,
                    cursor: 'pointer', overflow: 'hidden', position: 'relative',
                    border: '2px solid rgba(0,214,178,0.3)',
                  }}
                  title="Cambiar foto"
                >
                  {avatarBase64 ? (
                    <img src={avatarBase64} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (user?.nombre || 'A')[0].toUpperCase()
                  )}
                  {/* Hover overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0.45)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </motion.div>
                </motion.div>
                <div>
                  <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{user?.nombre}</p>
                  <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>{user?.email}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                    <span style={{
                      fontSize: 12, padding: '4px 14px', borderRadius: 20,
                      background: 'rgba(0,214,178,0.12)', color: 'var(--primary)',
                      border: '1px solid rgba(0,214,178,0.2)', fontWeight: 600, textTransform: 'capitalize',
                    }}>
                      {user?.rol || 'Administrador'}
                    </span>
                    <motion.button
                      onClick={() => avatarInputRef.current?.click()}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      style={{ fontSize: 12, padding: '4px 14px', borderRadius: 20, background: 'var(--sunken)', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer' }}
                    >
                      {avatarBase64 ? 'Cambiar foto' : 'Subir foto'}
                    </motion.button>
                    {avatarBase64 && (
                      <motion.button
                        onClick={() => setAvatarBase64('')}
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        style={{ fontSize: 12, padding: '4px 14px', borderRadius: 20, background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', color: 'var(--danger)', cursor: 'pointer' }}
                      >
                        Quitar
                      </motion.button>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>JPG, PNG o GIF · máx. 2 MB</p>
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

            {/* Zona de peligro */}
            <div style={{ marginTop: 24 }}>
              <GlowingCard className="p-6 sm:p-8 lg:p-10" style={{ border: '1px solid rgba(232,93,93,0.25)' }}>
                <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Zona de peligro</h3>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>Acciones irreversibles sobre tu cuenta.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '14px 18px', borderRadius: 14, background: 'var(--sunken)', border: '1px solid var(--border)' }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Borrar datos de perfil</p>
                      <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '2px 0 0' }}>Elimina tu foto de perfil. Tu cuenta se conserva.</p>
                    </div>
                    <button disabled={borrandoPerfil}
                      onClick={async () => {
                        setBorrandoPerfil(true)
                        try {
                          await api.post('/auth/borrar-perfil/')
                          setAvatarBase64('')
                          useAuthStore.setState(s => ({ user: s.user ? { ...s.user, avatar: undefined } : null }))
                          showToast('Datos de perfil borrados')
                        } catch { showToast('No se pudo borrar', 'error') } finally { setBorrandoPerfil(false) }
                      }}
                      style={{ padding: '9px 18px', borderRadius: 11, background: 'var(--glass)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      {borrandoPerfil ? 'Borrando…' : 'Borrar'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '14px 18px', borderRadius: 14, background: 'rgba(232,93,93,0.06)', border: '1px solid rgba(232,93,93,0.2)' }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--danger)', margin: 0 }}>Abandonar la clínica</p>
                      <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '2px 0 0' }}>Sales de la clínica y se elimina tu cuenta. No se puede deshacer.</p>
                    </div>
                    <button onClick={() => { setAbandonarPass(''); setAbandonarModal(true) }}
                      style={{ padding: '9px 18px', borderRadius: 11, background: 'rgba(232,93,93,0.12)', border: '1px solid rgba(232,93,93,0.3)', color: 'var(--danger)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      Abandonar
                    </button>
                  </div>
                </div>
              </GlowingCard>
            </div>

            {/* Modal abandonar clínica */}
            <AnimatePresence>
              {abandonarModal && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={(e) => { if (e.target === e.currentTarget) setAbandonarModal(false) }}
                  style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(6,4,18,0.82)', backdropFilter: 'blur(12px)', padding: 20 }}>
                  <motion.div initial={{ opacity: 0, scale: 0.93, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                    style={{ width: '100%', maxWidth: 440, borderRadius: 22, background: 'var(--bg)', border: '1px solid rgba(232,93,93,0.3)', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
                    <div style={{ padding: '24px 26px 16px' }}>
                      <h2 className="font-display" style={{ fontSize: 19, fontWeight: 700, color: 'var(--danger)', margin: 0 }}>Abandonar la clínica</h2>
                      <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>
                        Esta acción elimina tu cuenta y no se puede deshacer. Confirma tu contraseña.
                      </p>
                    </div>
                    <div style={{ padding: '0 26px 8px' }}>
                      <input type="password" value={abandonarPass} onChange={e => setAbandonarPass(e.target.value)} placeholder="Tu contraseña" style={inputStyle} autoFocus />
                    </div>
                    <div style={{ padding: '14px 26px 22px', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                      <button onClick={() => setAbandonarModal(false)}
                        style={{ padding: '11px 20px', borderRadius: 12, background: 'var(--glass)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                        Cancelar
                      </button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        disabled={!abandonarPass || abandonando}
                        onClick={async () => {
                          setAbandonando(true)
                          try {
                            await api.post('/auth/abandonar-clinica/', { password: abandonarPass })
                            useAuthStore.getState().clearAuth()
                            router.push('/')
                          } catch (err: any) {
                            showToast(err.response?.data?.error || 'No se pudo abandonar la clínica', 'error')
                            setAbandonando(false)
                          }
                        }}
                        style={{ padding: '11px 22px', borderRadius: 12, border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: (!abandonarPass || abandonando) ? 'not-allowed' : 'pointer', opacity: (!abandonarPass || abandonando) ? 0.45 : 1, background: 'linear-gradient(135deg, #E85D5D, #d84a4a)' }}>
                        {abandonando ? 'Saliendo…' : 'Sí, abandonar'}
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )

      // ═══════════════════════════════════════════════════════════
      // SEGURIDAD
      // ═══════════════════════════════════════════════════════════
      case 'seguridad':
        return (
          <motion.div key="seguridad" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 16, background: 'var(--sunken)', border: '1px solid var(--border)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,214,178,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', flexShrink: 0 }}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>Navegador actual</p>
                    <p style={{ fontSize: 13, color: 'var(--muted)' }}>Sesión activa ahora</p>
                  </div>
                  <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: 'rgba(0,214,178,0.12)', color: 'var(--success)', border: '1px solid rgba(0,214,178,0.2)' }}>
                    Activa
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
                  <motion.button
                    onClick={() => { setCerrarSesPass(''); setCerrarSesModal(true) }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    style={{ padding: '12px 24px', borderRadius: 12, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', color: 'var(--danger)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                    Cerrar otras sesiones
                  </motion.button>
                  <motion.button
                    onClick={() => { useAuthStore.getState().clearAuth(); router.push('/') }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    style={{ padding: '12px 24px', borderRadius: 12, background: 'var(--sunken)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                    Salir de esta sesión
                  </motion.button>
                </div>
              </GlowingCard>
            </div>

            {/* Modal cerrar otras sesiones */}
            <AnimatePresence>
              {cerrarSesModal && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={(e) => { if (e.target === e.currentTarget) setCerrarSesModal(false) }}
                  style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(6,4,18,0.82)', backdropFilter: 'blur(12px)', padding: 20 }}>
                  <motion.div initial={{ opacity: 0, scale: 0.93, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                    style={{ width: '100%', maxWidth: 440, borderRadius: 22, background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
                    <div style={{ padding: '24px 26px 16px' }}>
                      <h2 className="font-display" style={{ fontSize: 19, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Cerrar otras sesiones</h2>
                      <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>
                        Esto cerrará la sesión en todos los demás dispositivos. Confirma tu contraseña para continuar.
                      </p>
                    </div>
                    <div style={{ padding: '0 26px 8px' }}>
                      <input type="password" value={cerrarSesPass} onChange={e => setCerrarSesPass(e.target.value)}
                        placeholder="Tu contraseña" style={inputStyle} autoFocus />
                    </div>
                    <div style={{ padding: '14px 26px 22px', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                      <button onClick={() => setCerrarSesModal(false)}
                        style={{ padding: '11px 20px', borderRadius: 12, background: 'var(--glass)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                        Cancelar
                      </button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        disabled={!cerrarSesPass || cerrandoSes}
                        onClick={async () => {
                          setCerrandoSes(true)
                          try {
                            const keep = useAuthStore.getState().refreshToken || ''
                            const res = await api.post('/auth/cerrar-sesiones/', { password: cerrarSesPass, keep_refresh: keep })
                            setCerrarSesModal(false)
                            showToast(res.data?.message || 'Sesiones cerradas')
                          } catch (err: any) {
                            showToast(err.response?.data?.error || 'No se pudieron cerrar las sesiones', 'error')
                          } finally { setCerrandoSes(false) }
                        }}
                        style={{ padding: '11px 22px', borderRadius: 12, border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: (!cerrarSesPass || cerrandoSes) ? 'not-allowed' : 'pointer', opacity: (!cerrarSesPass || cerrandoSes) ? 0.45 : 1, background: 'linear-gradient(135deg, #E85D5D, #d84a4a)' }}>
                        {cerrandoSes ? 'Cerrando…' : 'Cerrar sesiones'}
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )

      // ═══════════════════════════════════════════════════════════
      // CLÍNICA
      // ═══════════════════════════════════════════════════════════
      case 'clinica':
        return (
          <motion.div key="clinica" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <p style={sectionDesc}>Información general de tu clínica y sedes registradas.</p>

            {loadingClinica ? <Skeleton count={2} h={80} /> : (
              <>
                {/* ── Identidad de la clínica (resumen vivo) ── */}
                <GlowingCard className="p-6 sm:p-8 lg:p-10" style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
                    <div style={{ width: 64, height: 64, borderRadius: 18, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: editClinica.logo ? 'transparent' : `linear-gradient(135deg, ${editClinica.color_acento || 'var(--primary)'}, var(--accent))`, border: '1px solid var(--border)' }}>
                      {editClinica.logo
                        ? <img src={editClinica.logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span className="font-display" style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>{(editClinica.nombre || 'V').charAt(0).toUpperCase()}</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <h3 className="font-display" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{editClinica.nombre || 'Tu clínica'}</h3>
                      <p style={{ fontSize: 13, color: 'var(--muted)', margin: '4px 0 0' }}>
                        {[editClinica.especialidad, editClinica.ciudad].filter(Boolean).join(' · ') || 'Sin especialidad ni ciudad definidas'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {[
                        { k: limitesPlan.label, v: 'Plan' },
                        { k: `${miembrosCount}/${limitesPlan.usuarios > 9999 ? '∞' : limitesPlan.usuarios}`, v: 'Miembros' },
                        { k: `${sedes.length}/${limitesPlan.sedes > 9999 ? '∞' : limitesPlan.sedes}`, v: 'Sedes' },
                      ].map(chip => (
                        <div key={chip.v} style={{ textAlign: 'center', padding: '8px 16px', borderRadius: 14, background: 'var(--sunken)', border: '1px solid var(--border)' }}>
                          <p className="font-display" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{chip.k}</p>
                          <p style={{ fontSize: 11, color: 'var(--muted)', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{chip.v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlowingCard>

                <GlowingCard className="p-6 sm:p-8 lg:p-10">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 8 }}>
                    <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Perfil de la clínica</h3>
                    {!puedeEditarClinica && (
                      <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: 'var(--sunken)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                        Solo lectura · edita el administrador
                      </span>
                    )}
                  </div>
                  <fieldset disabled={!puedeEditarClinica} style={{ border: 'none', padding: 0, margin: 0, opacity: puedeEditarClinica ? 1 : 0.7 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                    <div>
                      <label style={labelStyle}>Nombre de la clínica</label>
                      <input value={editClinica.nombre} onChange={e => setEditClinica({ ...editClinica, nombre: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Email de contacto</label>
                      <input type="email" value={editClinica.email} onChange={e => setEditClinica({ ...editClinica, email: e.target.value })} style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                    <div>
                      <label style={labelStyle}>Especialidad</label>
                      <input value={editClinica.especialidad} onChange={e => setEditClinica({ ...editClinica, especialidad: e.target.value })} placeholder="Ej: Medicina general" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Ciudad</label>
                      <input value={editClinica.ciudad} onChange={e => setEditClinica({ ...editClinica, ciudad: e.target.value })} placeholder="Ej: San José, CR" style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Descripción</label>
                    <textarea value={editClinica.descripcion} onChange={e => setEditClinica({ ...editClinica, descripcion: e.target.value })}
                      placeholder="Breve descripción o misión de la clínica" rows={3}
                      style={{ ...inputStyle, resize: 'vertical', minHeight: 80, fontFamily: 'inherit' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28, alignItems: 'end' }}>
                    <div>
                      <label style={labelStyle}>Color de acento</label>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <input type="color" value={editClinica.color_acento || '#00D6B2'} onChange={e => setEditClinica({ ...editClinica, color_acento: e.target.value })}
                          style={{ width: 48, height: 42, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--sunken)', cursor: puedeEditarClinica ? 'pointer' : 'not-allowed', padding: 2 }} />
                        <input value={editClinica.color_acento} onChange={e => setEditClinica({ ...editClinica, color_acento: e.target.value })} placeholder="#00D6B2" style={{ ...inputStyle, flex: 1 }} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Logo de la clínica</label>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <label style={{ padding: '10px 16px', borderRadius: 10, background: 'var(--sunken)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 13, fontWeight: 500, cursor: puedeEditarClinica ? 'pointer' : 'not-allowed' }}>
                          Subir imagen
                          <input type="file" accept="image/*" style={{ display: 'none' }} disabled={!puedeEditarClinica}
                            onChange={e => {
                              const file = e.target.files?.[0]; if (!file) return
                              if (file.size > 1024 * 1024) return showToast('El logo no puede superar 1 MB', 'error')
                              const reader = new FileReader()
                              reader.onload = () => setEditClinica(c => ({ ...c, logo: String(reader.result) }))
                              reader.readAsDataURL(file)
                            }} />
                        </label>
                        {editClinica.logo && (
                          <button onClick={() => setEditClinica(c => ({ ...c, logo: '' }))}
                            style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--sunken)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}>
                            Quitar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {puedeEditarClinica && <SaveButton onClick={handleSaveClinica} loading={savingClinica} />}
                  </fieldset>
                </GlowingCard>

                {/* Sedes */}
                <div style={{ marginTop: 24 }}>
                  <GlowingCard className="p-6 sm:p-8 lg:p-10">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                      <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                        Sedes
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, padding: '5px 14px', borderRadius: 20, background: 'rgba(0,214,178,0.12)', color: 'var(--primary)', border: '1px solid rgba(0,214,178,0.2)' }}>
                          {sedes.length} / {limitesPlan.sedes > 9999 ? '∞' : limitesPlan.sedes} {sedes.length === 1 ? 'sede' : 'sedes'}
                        </span>
                        {puedeEditarClinica && (
                          <motion.button
                            onClick={() => {
                              if (sedes.length >= limitesPlan.sedes) { showToast(`Tu plan ${limitesPlan.label} permite ${limitesPlan.sedes} sede(s). Mejora el plan para agregar más.`, 'error'); return }
                              setShowNuevaSede(v => !v); setEditandoSede(null)
                            }}
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                              borderRadius: 10, background: showNuevaSede ? 'rgba(0,214,178,0.2)' : 'rgba(0,214,178,0.1)',
                              border: '1px solid rgba(0,214,178,0.3)', color: 'var(--primary)',
                              fontSize: 13, fontWeight: 500, cursor: 'pointer',
                            }}>
                            <PlusIcon /> Nueva sede
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Create form */}
                    <AnimatePresence>
                      {showNuevaSede && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          style={{ overflow: 'hidden', marginBottom: 20 }}>
                          <div style={{ padding: '20px', borderRadius: 16, background: 'rgba(0,214,178,0.06)', border: '1px solid rgba(0,214,178,0.2)', marginBottom: 4 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', marginBottom: 16 }}>Nueva sede</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
                              <div>
                                <label style={labelStyle}>Nombre *</label>
                                <input value={nuevaSedeForm.nombre} onChange={e => setNuevaSedeForm({ ...nuevaSedeForm, nombre: e.target.value })}
                                  placeholder="Ej: Sede Norte" style={inputStyle} />
                              </div>
                              <div>
                                <label style={labelStyle}>Dirección</label>
                                <input value={nuevaSedeForm.direccion} onChange={e => setNuevaSedeForm({ ...nuevaSedeForm, direccion: e.target.value })}
                                  placeholder="Dirección física" style={inputStyle} />
                              </div>
                              <div>
                                <label style={labelStyle}>Teléfono</label>
                                <input value={nuevaSedeForm.telefono} onChange={e => setNuevaSedeForm({ ...nuevaSedeForm, telefono: e.target.value })}
                                  placeholder="Teléfono de contacto" style={inputStyle} />
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                              <motion.button onClick={handleCrearSede} disabled={savingSede}
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                style={{ padding: '9px 20px', borderRadius: 10, background: 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', opacity: savingSede ? 0.7 : 1 }}>
                                {savingSede ? 'Guardando...' : 'Crear sede'}
                              </motion.button>
                              <motion.button onClick={() => setShowNuevaSede(false)}
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                style={{ padding: '9px 20px', borderRadius: 10, background: 'var(--lift)', color: 'var(--muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border)' }}>
                                Cancelar
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {sedes.length === 0 ? (
                      <p style={{ fontSize: 14, color: 'var(--muted)', textAlign: 'center', padding: '32px 0' }}>
                        No hay sedes registradas. Crea la primera sede de tu clínica.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <AnimatePresence>
                          {sedes.map((s, i) => (
                            <motion.div key={s.id}
                              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                              transition={{ delay: i * 0.04 }}
                              style={{ borderRadius: 16, background: 'var(--sunken)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                              {/* Row */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,214,178,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                                  <MapPinIcon />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{s.nombre}</p>
                                  <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
                                    {s.direccion || 'Sin dirección'}{s.telefono ? ` · ${s.telefono}` : ''}
                                  </p>
                                </div>
                                {/* Status toggle */}
                                <motion.button onClick={() => { if (puedeEditarClinica) handleToggleActiva(s) }}
                                  whileHover={puedeEditarClinica ? { scale: 1.04 } : {}} whileTap={puedeEditarClinica ? { scale: 0.96 } : {}}
                                  title={s.activa ? 'Sede activa' : 'Sede inactiva'}
                                  style={{
                                    fontSize: 12, padding: '4px 12px', borderRadius: 20, cursor: puedeEditarClinica ? 'pointer' : 'default',
                                    background: s.activa ? 'rgba(0,214,178,0.12)' : 'rgba(255,107,107,0.1)',
                                    color: s.activa ? 'var(--success)' : 'var(--danger)',
                                    border: s.activa ? '1px solid rgba(0,214,178,0.2)' : '1px solid rgba(255,107,107,0.2)',
                                  }}>
                                  {s.activa ? 'Activa' : 'Inactiva'}
                                </motion.button>
                                {puedeEditarClinica && <>
                                {/* Edit */}
                                <motion.button
                                  onClick={() => { setEditandoSede(editandoSede === s.id ? null : s.id); setEditSedeForm({ nombre: s.nombre, direccion: s.direccion || '', telefono: s.telefono || '' }); setShowNuevaSede(false) }}
                                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                  style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: editandoSede === s.id ? 'rgba(0,214,178,0.2)' : 'var(--lift)', border: '1px solid var(--border)', color: 'var(--primary)', cursor: 'pointer' }}>
                                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                </motion.button>
                                {/* Delete */}
                                <motion.button
                                  onClick={() => setConfirmDeleteSede({ open: true, id: s.id, nombre: s.nombre })}
                                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                  style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.15)', color: 'var(--danger)', cursor: 'pointer' }}>
                                  <TrashIcon />
                                </motion.button>
                                </>}
                              </div>

                              {/* Inline edit form */}
                              <AnimatePresence>
                                {editandoSede === s.id && (
                                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    style={{ overflow: 'hidden' }}>
                                    <div style={{ padding: '16px 20px 20px', borderTop: '1px solid var(--border)', background: 'rgba(0,214,178,0.04)' }}>
                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                                        <div>
                                          <label style={labelStyle}>Nombre *</label>
                                          <input value={editSedeForm.nombre} onChange={e => setEditSedeForm({ ...editSedeForm, nombre: e.target.value })} style={inputStyle} />
                                        </div>
                                        <div>
                                          <label style={labelStyle}>Dirección</label>
                                          <input value={editSedeForm.direccion} onChange={e => setEditSedeForm({ ...editSedeForm, direccion: e.target.value })} style={inputStyle} />
                                        </div>
                                        <div>
                                          <label style={labelStyle}>Teléfono</label>
                                          <input value={editSedeForm.telefono} onChange={e => setEditSedeForm({ ...editSedeForm, telefono: e.target.value })} style={inputStyle} />
                                        </div>
                                      </div>
                                      <div style={{ display: 'flex', gap: 10 }}>
                                        <motion.button onClick={() => handleEditarSede(s.id)} disabled={savingSede}
                                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 10, background: 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', opacity: savingSede ? 0.7 : 1 }}>
                                          <CheckIcon /> Guardar
                                        </motion.button>
                                        <motion.button onClick={() => setEditandoSede(null)}
                                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                          style={{ padding: '8px 18px', borderRadius: 10, background: 'var(--lift)', color: 'var(--muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border)' }}>
                                          Cancelar
                                        </motion.button>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </GlowingCard>
                </div>

                {/* Confirm delete sede */}
                <ConfirmModal
                  open={confirmDeleteSede.open}
                  title="Eliminar sede"
                  message={`¿Eliminar la sede "${confirmDeleteSede.nombre}"? Esta acción no se puede deshacer.`}
                  confirmLabel="Eliminar"
                  variant="danger"
                  onConfirm={() => handleEliminarSede(confirmDeleteSede.id)}
                  onCancel={() => setConfirmDeleteSede({ open: false, id: 0, nombre: '' })}
                />
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
            <p style={sectionDesc}>Configura qué alertas recibes y los correos que reciben notificaciones.</p>

            {/* Estado del correo según el plan */}
            {(() => {
              const correoActivo = clinica?.plan && clinica.plan !== 'gratis'
              return (
                <div style={{ marginBottom: 20, padding: '14px 18px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                  background: correoActivo ? 'rgba(0,214,178,0.08)' : 'rgba(245,197,24,0.08)',
                  border: `1px solid ${correoActivo ? 'rgba(0,214,178,0.22)' : 'rgba(245,197,24,0.25)'}` }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: correoActivo ? 'var(--primary)' : '#E8C490' }}>
                    {correoActivo ? '✓ Notificaciones por correo activas' : '⚠ Correo desactivado en plan Gratis'}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                    · {emails.length} correo(s) configurado(s) · plan {limitesPlan.label}
                  </span>
                  {!correoActivo && (
                    <span style={{ fontSize: 12.5, color: 'var(--muted)', marginLeft: 'auto' }}>
                      Mejora a Básico para enviar alertas por correo.
                    </span>
                  )}
                </div>
              )
            })()}

            {/* Alert preferences */}
            <GlowingCard className="p-6 sm:p-8 lg:p-10">
              <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                Preferencias de alertas
              </h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
                Selecciona qué tipos de alertas deseas recibir por correo electrónico.
              </p>
              <SettingRow label="Alertas críticas" desc="Enviar por correo las alertas de severidad crítica">
                <ToggleSwitch checked={alertPrefs.emailCriticas} onChange={v => guardarSeveridades({ ...alertPrefs, emailCriticas: v })} />
              </SettingRow>
              <SettingRow label="Alertas altas" desc="Enviar por correo las alertas de severidad alta">
                <ToggleSwitch checked={alertPrefs.emailAltas} onChange={v => guardarSeveridades({ ...alertPrefs, emailAltas: v })} />
              </SettingRow>
              <SettingRow label="Alertas medias" desc="Enviar por correo las alertas de severidad media">
                <ToggleSwitch checked={alertPrefs.emailMedias} onChange={v => guardarSeveridades({ ...alertPrefs, emailMedias: v })} />
              </SettingRow>
              <SettingRow label="Alertas bajas" desc="Enviar por correo las alertas informativas de baja severidad">
                <ToggleSwitch checked={alertPrefs.emailBajas} onChange={v => guardarSeveridades({ ...alertPrefs, emailBajas: v })} />
              </SettingRow>
              <SettingRow label="Sonido de notificación" desc="Reproducir un sonido al recibir alertas nuevas en el dashboard">
                <ToggleSwitch checked={prefs.sonido} onChange={v => setPrefs({ sonido: v })} />
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
                      <div style={{ padding: '20px', borderRadius: 16, background: 'var(--sunken)', border: '1px solid var(--border)' }}>
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
                            style={{ padding: '10px 20px', borderRadius: 10, background: 'var(--sunken)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}>
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
                        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 14, background: 'var(--sunken)', border: '1px solid var(--border)' }}>
                        <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                          {(e.nombre || e.email)[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {e.nombre && <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{e.nombre}</p>}
                          <p style={{ fontSize: 13, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.email}</p>
                        </div>
                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(0,214,178,0.12)', color: 'var(--success)', border: '1px solid rgba(0,214,178,0.2)' }}>
                          Activo
                        </span>
                        <motion.button onClick={() => setConfirmDelete({ open: true, id: e.id, label: e.email })} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--danger)', flexShrink: 0 }}>
                          <TrashIcon />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </GlowingCard>
            </div>

            {/* WhatsApp */}
            <div style={{ marginTop: 24 }}>
              <GlowingCard className="p-6 sm:p-8 lg:p-10">
                <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                  WhatsApp
                </h3>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
                  Configura los números de WhatsApp para recibir notificaciones de alertas.
                </p>
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Números de teléfono</label>
                  <input
                    value={whatsappNumero}
                    onChange={e => setWhatsappNumero(e.target.value)}
                    placeholder="+50688888888, +50699999999"
                    style={inputStyle}
                  />
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
                    Formato internacional. Separa múltiples números con coma. Requiere Twilio.
                  </p>
                </div>
                <SaveButton onClick={handleSaveWhatsapp} loading={savingWhatsapp} label="Guardar número" />
              </GlowingCard>
            </div>
          </motion.div>
        )

      // ═══════════════════════════════════════════════════════════
      // AUTOMATIZACIÓN
      // ═══════════════════════════════════════════════════════════
      case 'automatizacion':
        return (
          <motion.div key="automatizacion" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <p style={sectionDesc}>
              Controla si el motor de análisis corre automáticamente y si Claude genera recomendaciones.
              Desactiva cuando no necesites monitoreo activo para evitar costos innecesarios.
            </p>

            {(clinica?.plan === 'gratis') && (
              <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 12, background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.25)', fontSize: 13, color: '#E8C490' }}>
                ⚠ El motor automático y las recomendaciones de IA requieren plan Básico o superior. En Gratis puedes ejecutar el análisis manualmente.
              </div>
            )}
            {loadingClinica ? <Skeleton count={2} h={80} /> : (
              <>
                {/* Motor automático */}
                <GlowingCard className="p-6 sm:p-8 lg:p-10">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: motorConfig.motor_automatico ? 'rgba(0,214,178,0.15)' : 'var(--sunken)', border: `1px solid ${motorConfig.motor_automatico ? 'rgba(0,214,178,0.3)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: motorConfig.motor_automatico ? 'var(--success)' : 'var(--muted)', flexShrink: 0, transition: 'all 0.25s' }}>
                      <AutoIcon />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                        Motor automático
                      </h3>
                      <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 }}>
                        Cuando está activo, Celery Beat corre el análisis de anomalías automáticamente
                        según el intervalo configurado, sin que tengas que hacerlo manualmente.
                      </p>
                    </div>
                  </div>

                  <SettingRow
                    label="Activar motor automático"
                    desc="El análisis se ejecutará en segundo plano según el intervalo definido"
                  >
                    <ToggleSwitch
                      checked={motorConfig.motor_automatico}
                      onChange={v => setMotorConfig(p => ({ ...p, motor_automatico: v }))}
                    />
                  </SettingRow>

                  {/* Intervalo — solo visible si está activo */}
                  <AnimatePresence>
                    {motorConfig.motor_automatico && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ padding: '20px 0 8px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                            <ClockIcon />
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Intervalo de análisis</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                            {([1, 6, 12, 24] as const).map(h => (
                              <motion.button
                                key={h}
                                onClick={() => setMotorConfig(p => ({ ...p, motor_intervalo_horas: h }))}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                style={{
                                  padding: '14px 8px',
                                  borderRadius: 14,
                                  background: motorConfig.motor_intervalo_horas === h
                                    ? 'rgba(0,214,178,0.15)' : 'var(--sunken)',
                                  border: motorConfig.motor_intervalo_horas === h
                                    ? '2px solid var(--primary)' : '1px solid var(--border)',
                                  color: motorConfig.motor_intervalo_horas === h ? 'var(--primary)' : 'var(--muted)',
                                  fontSize: 13, fontWeight: motorConfig.motor_intervalo_horas === h ? 700 : 500,
                                  cursor: 'pointer', textAlign: 'center',
                                  transition: 'all 0.2s',
                                }}
                              >
                                {h === 1 ? 'Cada hora' : `Cada ${h}h`}
                              </motion.button>
                            ))}
                          </div>
                          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, opacity: 0.7 }}>
                            Celery Beat verifica cada hora; solo dispara el motor si ya pasó el intervalo configurado.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Último run */}
                  {clinica?.ultimo_motor_en && (
                    <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 12, background: 'var(--sunken)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <ClockIcon />
                      <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                        Último análisis:{' '}
                        <strong style={{ color: 'var(--text)' }}>
                          {new Date(clinica.ultimo_motor_en).toLocaleString('es-CR', { dateStyle: 'short', timeStyle: 'short' })}
                        </strong>
                      </span>
                    </div>
                  )}
                </GlowingCard>

                {/* Claude IA */}
                <div style={{ marginTop: 24 }}>
                  <GlowingCard className="p-6 sm:p-8 lg:p-10">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: motorConfig.claude_activo ? 'rgba(74,158,240,0.12)' : 'var(--sunken)', border: `1px solid ${motorConfig.claude_activo ? 'rgba(74,158,240,0.25)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: motorConfig.claude_activo ? '#4A9EF0' : 'var(--muted)', flexShrink: 0, transition: 'all 0.25s' }}>
                        <SparklesIcon />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                          Recomendaciones con Claude IA
                        </h3>
                        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 }}>
                          Cuando hay alertas de severidad alta o crítica, Claude genera una recomendación
                          en lenguaje natural. Cada llamada consume tokens de la API de Anthropic.
                        </p>
                      </div>
                    </div>

                    <SettingRow
                      label="Activar recomendaciones IA"
                      desc="Solo se activa en alertas altas y críticas para minimizar el uso"
                    >
                      <ToggleSwitch
                        checked={motorConfig.claude_activo}
                        onChange={v => setMotorConfig(p => ({ ...p, claude_activo: v }))}
                      />
                    </SettingRow>

                    {/* Billing warning */}
                    <AnimatePresence>
                      {motorConfig.claude_activo && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{ marginTop: 16, padding: '14px 18px', borderRadius: 14, background: 'rgba(232,200,100,0.06)', border: '1px solid rgba(232,200,100,0.2)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <svg width="16" height="16" fill="none" stroke="#E8C864" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                            <p style={{ fontSize: 12, color: 'rgba(232,200,100,0.9)', lineHeight: 1.6 }}>
                              Activo. Cada análisis con alertas alta/crítica consume ~200 tokens por alerta (claude-sonnet-4-6).
                              Desactiva si no necesitas recomendaciones para reducir costos de API.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlowingCard>
                </div>

                {/* Save */}
                <div style={{ marginTop: 28 }}>
                  <SaveButton onClick={handleSaveMotorConfig} loading={savingMotor} label="Guardar automatización" />
                </div>
              </>
            )}
          </motion.div>
        )

      // ═══════════════════════════════════════════════════════════
      // REGLAS DE ALERTAS
      // ═══════════════════════════════════════════════════════════
      case 'alertas':
        return (
          <motion.div key="alertas" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <p style={sectionDesc}>
              Configura qué KPIs generan alertas, la sensibilidad del umbral y el canal de notificación.
              Umbral bajo (10–15%) = más sensible. Umbral alto (40–50%) = solo anomalías graves.
            </p>

            {/* Botón configuración recomendada */}
            <div style={{ marginBottom: 20 }}>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => {
                  const recomendados: Record<string, number> = {
                    tasa_cancelacion: 15, tasa_noshow: 15, ingresos_dia: 15,
                    ocupacion_agenda: 20, ticket_promedio: 20, cancelaciones_medico: 20, citas_reagendadas: 20,
                    tiempo_espera: 25, pacientes_nuevos: 25,
                    retencion_90: 30, nps: 30,
                  }
                  setConfigAlertas(prev => {
                    const next = { ...prev }
                    KPI_TIPOS.forEach(k => {
                      next[k.key] = { ...(next[k.key] || { tipo_kpi: k.key, canal: 'email' as const, clinica: clinicaId }), umbral_sensibilidad: recomendados[k.key] ?? 20, activa: true }
                    })
                    return next
                  })
                  showToast('Configuración recomendada aplicada — guarda para conservar los cambios')
                }}
                style={{
                  padding: '10px 18px', borderRadius: 10, border: '1px solid rgba(0,214,178,0.4)',
                  background: 'rgba(0,214,178,0.1)', color: 'var(--primary)', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <SparklesIcon /> Aplicar configuración recomendada
              </motion.button>
            </div>

            {loadingConfigAlertas ? (
              <Skeleton count={6} h={88} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {KPI_TIPOS.map(kpi => {
                  const cfg = configAlertas[kpi.key] || { tipo_kpi: kpi.key, canal: 'email' as const, umbral_sensibilidad: 20, activa: true, clinica: clinicaId }
                  const umbral = cfg.umbral_sensibilidad
                  const sens = umbral <= 20 ? { c: '#00D6B2', word: 'Sensible' } : umbral <= 40 ? { c: '#FFD166', word: 'Balanceado' } : { c: '#4A9EF0', word: 'Conservador' }
                  const umbralColor = sens.c
                  return (
                    <div key={kpi.key} style={{ opacity: cfg.activa ? 1 : 0.5, transition: 'opacity 0.2s' }}>
                    <GlowingCard className="p-0 overflow-hidden">
                      {/* Fila principal: nombre + toggle */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{kpi.label}</span>
                        <ToggleSwitch
                          checked={cfg.activa}
                          onChange={v => setConfigAlertas(prev => ({ ...prev, [kpi.key]: { ...(prev[kpi.key] || cfg), activa: v } }))}
                        />
                      </div>
                      {/* Fila secundaria: slider + canal */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 18px' }}>
                        {/* Slider umbral */}
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Umbral</span>
                          <input
                            type="range" min={5} max={80} step={5}
                            className="range-jade"
                            value={umbral}
                            disabled={!cfg.activa}
                            onChange={e => setConfigAlertas(prev => ({ ...prev, [kpi.key]: { ...(prev[kpi.key] || cfg), umbral_sensibilidad: Number(e.target.value) } }))}
                            style={{ flex: 1, cursor: cfg.activa ? 'pointer' : 'not-allowed' }}
                          />
                          <span className="tnum" style={{ fontSize: 13, fontWeight: 700, color: umbralColor, minWidth: 38, textAlign: 'right' }}>{umbral}%</span>
                          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: umbralColor, background: `${umbralColor}18`, border: `1px solid ${umbralColor}33`, borderRadius: 100, padding: '2px 8px', whiteSpace: 'nowrap' }}>{sens.word}</span>
                        </div>
                        {/* Canal */}
                        <select
                          value={cfg.canal}
                          disabled={!cfg.activa}
                          onChange={e => setConfigAlertas(prev => ({ ...prev, [kpi.key]: { ...(prev[kpi.key] || cfg), canal: e.target.value as 'email' | 'whatsapp' } }))}
                          style={{
                            padding: '7px 10px', borderRadius: 8,
                            background: 'var(--sunken)', border: '1px solid var(--border)',
                            color: 'var(--text)', fontSize: 13, cursor: cfg.activa ? 'pointer' : 'not-allowed',
                            minWidth: 120,
                          }}
                        >
                          <option value="email">Email</option>
                          <option value="whatsapp">WhatsApp</option>
                        </select>
                      </div>
                    </GlowingCard>
                    </div>
                  )
                })}

                {/* Guardar */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <SaveButton onClick={handleSaveConfigAlertas} loading={savingConfigAlertas} label="Guardar reglas" />
                </div>
              </div>
            )}
          </motion.div>
        )

      // ═══════════════════════════════════════════════════════════
      // APARIENCIA
      // ═══════════════════════════════════════════════════════════
      case 'apariencia':
        return (
          <motion.div key="apariencia" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <p style={sectionDesc}>Personaliza el aspecto visual del dashboard según tus preferencias.</p>

            <GlowingCard className="p-6 sm:p-8 lg:p-10">
              <h3 className="font-display" style={sectionTitle}>Tema</h3>
              <p style={sectionDesc}>Vista previa en vivo de cada tema.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
                {([
                  { key: 'dark', label: 'Oscuro', desc: 'Sala de mando, acentos jade', p: { bg: '#05090F', surface: '#0A111B', card: '#0F1926', line: 'rgba(255,255,255,0.07)', sub: '#9CC7C0', accent: '#00D6B2', signal: '#FF6B6B', gold: '#FFD166' } },
                  { key: 'light', label: 'Claro', desc: 'Entornos luminosos, clínico', p: { bg: '#F2F7F6', surface: '#F8FBFB', card: '#FFFFFF', line: 'rgba(0,40,34,0.10)', sub: '#2A5751', accent: '#009E82', signal: '#E24A4A', gold: '#C88A00' } },
                ] as const).map(th => {
                  const active = (isDark ? 'dark' : 'light') === th.key
                  const p = th.p
                  return (
                    <motion.button key={th.key} onClick={() => { if (!active) toggleTheme() }}
                      whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}
                      style={{ padding: 14, borderRadius: 'var(--r-lg)', background: active ? 'rgba(0,214,178,0.10)' : 'var(--sunken)', border: `1px solid ${active ? 'var(--jade)' : 'var(--border)'}`, boxShadow: active ? 'var(--shadow-brand)' : 'none', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.2s, box-shadow 0.2s' }}>
                      {/* mini UI mock in the target theme palette */}
                      <div style={{ width: '100%', borderRadius: 10, overflow: 'hidden', border: `1px solid ${p.line}`, background: p.bg, marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 9px', background: p.surface, borderBottom: `1px solid ${p.line}` }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.signal }} />
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.gold }} />
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.accent }} />
                          <span style={{ marginLeft: 8, height: 4, width: 44, borderRadius: 2, background: p.sub, opacity: 0.4 }} />
                        </div>
                        <div style={{ display: 'flex', gap: 7, padding: 9 }}>
                          <div style={{ flex: 1, height: 46, borderRadius: 7, background: p.card, border: `1px solid ${p.line}`, padding: 8, position: 'relative', overflow: 'hidden' }}>
                            <span style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 2, background: p.accent }} />
                            <div style={{ width: '38%', height: 8, borderRadius: 2, background: p.accent, marginLeft: 4 }} />
                            <div style={{ width: '68%', height: 4, borderRadius: 2, background: p.sub, opacity: 0.4, marginTop: 6, marginLeft: 4 }} />
                            <div style={{ width: '52%', height: 4, borderRadius: 2, background: p.sub, opacity: 0.3, marginTop: 4, marginLeft: 4 }} />
                          </div>
                          <div style={{ width: 40, height: 46, borderRadius: 7, background: p.card, border: `1px solid ${p.line}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 18, height: 18, borderRadius: '50%', background: `${p.accent}22`, border: `1px solid ${p.accent}` }} />
                            <span style={{ width: 22, height: 3, borderRadius: 2, background: p.sub, opacity: 0.4 }} />
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{th.label}</p>
                          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{th.desc}</p>
                        </div>
                        {active && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: 'var(--jade)' }}><CheckIcon /> Activo</span>}
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                Preferencias de interfaz
              </h3>
              <SettingRow label="Animaciones" desc="Activar transiciones y efectos animados en la interfaz">
                <ToggleSwitch checked={prefs.animaciones} onChange={v => setPrefs({ animaciones: v })} />
              </SettingRow>
              <SettingRow label="Vista compacta" desc="Reducir el espaciado para mostrar más información">
                <ToggleSwitch checked={prefs.compacto} onChange={v => setPrefs({ compacto: v })} />
              </SettingRow>
              <SettingRow label="Auto-refresh" desc="Actualizar los datos del dashboard automáticamente cada 60s">
                <ToggleSwitch checked={prefs.autoRefresh} onChange={v => setPrefs({ autoRefresh: v })} />
              </SettingRow>
              <SettingRow label="Cursor personalizado" desc="Usar el puntero animado de Vigía (desactívalo para el cursor normal del sistema)">
                <ToggleSwitch checked={prefs.cursorCustom} onChange={v => setPrefs({ cursorCustom: v })} />
              </SettingRow>
              <SettingRow label="Tamaño de fuente" desc="Escala toda la interfaz para mejorar la accesibilidad">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {([
                    { id: 'sm', label: 'A', px: 13 },
                    { id: 'md', label: 'A', px: 15 },
                    { id: 'lg', label: 'A', px: 18 },
                    { id: 'xl', label: 'A', px: 22 },
                  ] as const).map(o => (
                    <button key={o.id} onClick={() => setPrefs({ fontSize: o.id })} title={o.id.toUpperCase()}
                      style={{ width: 40, height: 40, borderRadius: 10, fontWeight: 700, cursor: 'pointer', lineHeight: 1,
                        fontSize: o.px,
                        background: fontSize === o.id ? 'rgba(0,214,178,0.15)' : 'var(--sunken)',
                        border: `1px solid ${fontSize === o.id ? 'var(--primary)' : 'var(--border)'}`,
                        color: fontSize === o.id ? 'var(--primary)' : 'var(--muted)' }}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </SettingRow>
              <SettingRow label="Idioma" desc="Idioma de la interfaz de Vigía">
                <div style={{ display: 'flex', gap: 8 }}>
                  {IDIOMAS.map(l => (
                    <button key={l.id} onClick={() => setPrefs({ idioma: l.id })}
                      style={{ padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        background: idioma === l.id ? 'rgba(0,214,178,0.15)' : 'var(--sunken)',
                        border: `1px solid ${idioma === l.id ? 'var(--primary)' : 'var(--border)'}`,
                        color: idioma === l.id ? 'var(--primary)' : 'var(--muted)' }}>
                      {l.flag} {l.label}
                    </button>
                  ))}
                </div>
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
            <p style={sectionDesc}>Gestiona las conexiones con sistemas externos como ERP, HIS y otras fuentes de datos.</p>

            {/* Sistema HIS/ERP externo — conectar vs re-sincronizar */}
            {(() => {
              const hisConn = (integraciones as any[]).find(i => i.tipo === 'his')
              return (
                <GlowingCard className="p-6 sm:p-8 lg:p-10" style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                    <div style={{ maxWidth: 480 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <h3 className="font-display" style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Sistema HIS/ERP externo</h3>
                        {hisConn && (() => {
                          const err = hisConn.estado === 'error'
                          return (
                            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                              background: err ? 'rgba(232,93,93,0.12)' : 'rgba(0,214,178,0.12)',
                              color: err ? 'var(--danger)' : 'var(--primary)',
                              border: `1px solid ${err ? 'rgba(232,93,93,0.3)' : 'rgba(0,214,178,0.25)'}` }}>
                              {err ? '● Con error de conexión' : '● Conectado'}
                            </span>
                          )
                        })()}
                      </div>
                      {hisConn ? (
                        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>
                          {hisConn.nombre} · {hisConn.api_url}
                          {hisConn.ultima_sync ? ` · última sync ${new Date(hisConn.ultima_sync).toLocaleString('es')}` : ''}
                        </p>
                      ) : (
                        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>
                          Conecta el sistema HIS/ERP de tu clínica para traer datos reales (pacientes, citas, facturación) y reemplazar el generador.
                        </p>
                      )}
                    </div>
                    {hisConn ? (
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <motion.button
                          onClick={async () => {
                            setSyncingHis(true)
                            try {
                              const res = await api.post('/integraciones/sync-his/', { clinica_id: clinicaId })
                              showToast(res.data?.detalle || 'Sincronización completada')
                              const ir = await api.get(`/integraciones/?clinica=${clinicaId}`)
                              setIntegraciones(ir.data.results || ir.data)
                            } catch (err: any) {
                              showToast(err.response?.data?.error || 'No se pudo sincronizar', 'error')
                            } finally { setSyncingHis(false) }
                          }}
                          disabled={syncingHis}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          style={{ padding: '12px 22px', borderRadius: 12, border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: syncingHis ? 'not-allowed' : 'pointer', opacity: syncingHis ? 0.6 : 1, background: 'linear-gradient(135deg, var(--primary), var(--accent))', whiteSpace: 'nowrap' }}>
                          {syncingHis ? 'Sincronizando…' : 'Sincronizar ahora'}
                        </motion.button>
                        <motion.button
                          onClick={async () => {
                            if (!hisConn?.id) return
                            try {
                              await api.delete(`/integraciones/${hisConn.id}/`)
                              showToast('Integración desconectada')
                              const ir = await api.get(`/integraciones/?clinica=${clinicaId}`)
                              setIntegraciones(ir.data.results || ir.data)
                            } catch { showToast('No se pudo desconectar', 'error') }
                          }}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          style={{ padding: '12px 20px', borderRadius: 12, background: 'rgba(232,93,93,0.1)', border: '1px solid rgba(232,93,93,0.25)', color: 'var(--danger)', fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          Desconectar
                        </motion.button>
                      </div>
                    ) : (
                      <motion.button
                        onClick={() => { setHisForm({ nombre: '', url: '', key: '' }); setHisResumen(null); setHisMapeo(null); setHisModal(true) }}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        style={{ padding: '12px 22px', borderRadius: 12, border: '1px solid rgba(0,214,178,0.3)', color: 'var(--primary)', background: 'rgba(0,214,178,0.1)', fontSize: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        Conectar integración →
                      </motion.button>
                    )}
                  </div>
                </GlowingCard>
              )
            })()}

            {/* ══ WIZARD CONECTAR HIS ══ */}
            <AnimatePresence>
              {hisModal && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={(e) => { if (e.target === e.currentTarget) setHisModal(false) }}
                  style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(6,4,18,0.82)', backdropFilter: 'blur(12px)', padding: 20 }}>
                  <motion.div initial={{ opacity: 0, scale: 0.93, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                    style={{ width: '100%', maxWidth: 560, borderRadius: 24, background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
                    <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid var(--border)' }}>
                      <p className="eyebrow" style={{ color: 'var(--primary)', marginBottom: 8 }}>Sistema externo</p>
                      <h2 className="font-display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Conectar HIS/ERP</h2>
                      <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>
                        La <strong>URL</strong> y la <strong>clave de acceso</strong> las provee tu sistema HIS/ERP (el proveedor o el área de TI de la clínica). Vigía se conectará a él para traer los datos.
                      </p>
                    </div>
                    <div style={{ padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <button
                        onClick={() => setHisForm({ nombre: 'HIS de demostración', url: 'http://127.0.0.1:8001', key: 'his-demo-key-vigia-2026' })}
                        style={{ alignSelf: 'flex-start', padding: '7px 14px', borderRadius: 10, background: 'var(--sunken)', border: '1px dashed var(--border)', color: 'var(--muted)', fontSize: 12.5, cursor: 'pointer' }}>
                        ⚡ Usar el HIS de demostración (rellena los datos)
                      </button>
                      <div>
                        <label style={labelStyle}>Nombre del sistema</label>
                        <input value={hisForm.nombre} onChange={e => setHisForm({ ...hisForm, nombre: e.target.value })} placeholder="Ej: HIS Clínica Central" style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Dirección (URL)</label>
                        <input value={hisForm.url} onChange={e => setHisForm({ ...hisForm, url: e.target.value })} placeholder="http://127.0.0.1:8001" style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Clave de acceso (API key)</label>
                        <input value={hisForm.key} onChange={e => setHisForm({ ...hisForm, key: e.target.value })} placeholder="his-demo-key-vigia-2026" style={inputStyle} />
                      </div>

                      {hisResumen && (
                        <div style={{ padding: '14px 16px', borderRadius: 14, background: 'rgba(0,214,178,0.07)', border: '1px solid rgba(0,214,178,0.22)' }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', margin: 0 }}>✓ Conexión establecida con el sistema externo</p>
                          <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '6px 0 0' }}>
                            Encontrado: {hisResumen.sedes} sedes · {hisResumen.medicos} médicos · {hisResumen.pacientes} pacientes
                          </p>
                          {hisResumen.columnas_detectadas?.length > 0 && (
                            <p style={{ fontSize: 11.5, color: 'var(--muted)', margin: '6px 0 0', opacity: 0.85 }}>
                              Columnas detectadas: {hisResumen.columnas_detectadas.slice(0, 8).join(', ')}…
                            </p>
                          )}
                        </div>
                      )}

                      {hisMapeo && Object.keys(hisMapeo).length > 0 && (
                        <div style={{ padding: '14px 16px', borderRadius: 14, background: 'rgba(176,110,245,0.07)', border: '1px solid rgba(176,110,245,0.25)' }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#B06EF5', margin: '0 0 8px' }}>✦ La IA adaptó las columnas a Vigía</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {Object.entries(hisMapeo).map(([campo, col]) => (
                              <div key={campo} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                                <code style={{ color: 'var(--muted)' }}>{col}</code>
                                <span style={{ color: '#B06EF5' }}>→</span>
                                <strong style={{ color: 'var(--text)' }}>{campo}</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '0 28px 24px', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                      <button onClick={() => setHisModal(false)}
                        style={{ padding: '11px 20px', borderRadius: 12, background: 'var(--glass)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                        Cancelar
                      </button>
                      {!hisResumen ? (
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          disabled={!hisForm.url || !hisForm.key || hisProbando}
                          onClick={async () => {
                            setHisProbando(true)
                            try {
                              const res = await api.post('/integraciones/his/probar/', { url: hisForm.url, key: hisForm.key })
                              setHisResumen(res.data.resumen)
                              // La IA mapea las columnas del sistema externo → campos de Vigía
                              const cols = res.data.resumen?.columnas_detectadas || []
                              if (cols.length) {
                                try {
                                  const m = await api.post('/integraciones/his/mapear/', { columnas: cols })
                                  setHisMapeo(m.data.mapeo || null)
                                } catch { /* mapeo opcional */ }
                              }
                            } catch (err: any) {
                              const st = err.response?.status
                              const msg = st === 401 ? 'Tu sesión venció. Cierra sesión y vuelve a entrar.'
                                : err.response?.data?.error || err.response?.data?.detail || `No se pudo conectar (${st || 'sin respuesta'})`
                              showToast(msg, 'error')
                            } finally { setHisProbando(false) }
                          }}
                          style={{ padding: '11px 22px', borderRadius: 12, border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: (!hisForm.url || !hisForm.key || hisProbando) ? 'not-allowed' : 'pointer', opacity: (!hisForm.url || !hisForm.key || hisProbando) ? 0.45 : 1, background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                          {hisProbando ? 'Probando…' : 'Probar conexión'}
                        </motion.button>
                      ) : (
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          disabled={hisConectando}
                          onClick={async () => {
                            setHisConectando(true)
                            try {
                              const res = await api.post('/integraciones/his/conectar/', { url: hisForm.url, key: hisForm.key, nombre: hisForm.nombre || 'Sistema HIS/ERP', mapeo: hisMapeo, clinica_id: clinicaId })
                              const nCols = hisMapeo ? Object.keys(hisMapeo).length : 0
                              toast.success(
                                nCols ? `Integración conectada · la IA adaptó ${nCols} columnas del sistema externo a Vigía`
                                      : 'Integración conectada',
                                res.data?.detalle || undefined
                              )
                              const ir = await api.get(`/integraciones/?clinica=${clinicaId}`)
                              setIntegraciones(ir.data.results || ir.data)
                              setHisModal(false)
                            } catch (err: any) {
                              showToast(err.response?.data?.error || 'No se pudo conectar', 'error')
                            } finally { setHisConectando(false) }
                          }}
                          style={{ padding: '11px 22px', borderRadius: 12, border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: hisConectando ? 'not-allowed' : 'pointer', opacity: hisConectando ? 0.6 : 1, background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                          {hisConectando ? 'Conectando…' : 'Conectar e importar'}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

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
                      style={{ padding: '11px 24px', borderRadius: 12, background: 'rgba(0,214,178,0.12)', color: 'var(--primary)', border: '1px solid rgba(0,214,178,0.2)', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                      Solicitar integración
                    </motion.button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {integraciones.map((integ, i) => (
                      <motion.div key={integ.id}
                        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px', borderRadius: 18, background: 'var(--sunken)', border: '1px solid var(--border)' }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: 14,
                          background: integ.estado === 'activa' ? 'rgba(0,214,178,0.12)' : 'rgba(255,255,255,0.06)',
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
                          background: integ.estado === 'activa' ? 'rgba(0,214,178,0.12)' : 'rgba(255,107,107,0.1)',
                          color: integ.estado === 'activa' ? 'var(--success)' : 'var(--danger)',
                          border: integ.estado === 'activa' ? '1px solid rgba(0,214,178,0.2)' : '1px solid rgba(255,107,107,0.2)',
                        }}>
                          {integ.estado === 'activa' ? 'Conectada' : 'Desconectada'}
                        </span>
                        <motion.button onClick={() => handleSyncIntegracion(integ.id)}
                          whileHover={{ scale: 1.1, rotate: 180 }} whileTap={{ scale: 0.9 }}
                          style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'rgba(0,214,178,0.1)', border: '1px solid rgba(0,214,178,0.2)',
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

            {/* CSV Import */}
            <div style={{ marginTop: 24 }}>
              <GlowingCard className="p-6 sm:p-8 lg:p-10">
                <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                  Importar CSV
                </h3>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
                  Importa registros de KPIs o citas desde un archivo CSV.
                </p>

                {/* Tipo selector */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                  {(['kpi', 'citas'] as const).map(tipo => (
                    <motion.button
                      key={tipo}
                      onClick={() => { setCsvTipo(tipo); setCsvResult(null) }}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      style={{
                        padding: '10px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600,
                        cursor: 'pointer', border: 'none',
                        background: csvTipo === tipo ? 'rgba(0,214,178,0.15)' : 'var(--sunken)',
                        borderWidth: 2, borderStyle: 'solid',
                        borderColor: csvTipo === tipo ? 'var(--primary)' : 'var(--border)',
                        color: csvTipo === tipo ? 'var(--primary)' : 'var(--muted)',
                        transition: 'all 0.2s',
                      }}
                    >
                      {tipo === 'kpi' ? 'KPIs' : 'Citas'}
                    </motion.button>
                  ))}
                </div>

                {/* Columnas esperadas */}
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(0,214,178,0.06)', border: '1px solid rgba(0,214,178,0.15)' }}>
                  {csvTipo === 'kpi'
                    ? 'Columnas esperadas: medico_id, tipo, valor, registrado_en'
                    : 'Columnas esperadas: medico_id, paciente_nombre, fecha_hora, tipo, estado'}
                </p>

                {/* Sede selector */}
                {sedes.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Sede (opcional)</label>
                    <select
                      value={csvSedeId}
                      onChange={e => setCsvSedeId(e.target.value)}
                      style={{ ...inputStyle }}
                    >
                      <option value="">Todas las sedes / sin sede específica</option>
                      {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                  </div>
                )}

                {/* File input */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', cursor: 'pointer' }}>
                    <div style={{
                      padding: '32px', borderRadius: 16, textAlign: 'center',
                      background: csvFile ? 'rgba(0,214,178,0.06)' : 'var(--sunken)',
                      border: `2px dashed ${csvFile ? 'rgba(0,214,178,0.4)' : 'var(--border)'}`,
                      transition: 'all 0.2s',
                    }}>
                      {csvFile ? (
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--success)', marginBottom: 4 }}>{csvFile.name}</p>
                          <p style={{ fontSize: 13, color: 'var(--muted)' }}>{(csvFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      ) : (
                        <div>
                          <div style={{ color: 'var(--muted)', marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
                            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                              <polyline points="17 8 12 3 7 8"/>
                              <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                          </div>
                          <p style={{ fontSize: 14, color: 'var(--muted)' }}>Selecciona un archivo .csv</p>
                        </div>
                      )}
                    </div>
                    <input type="file" accept=".csv" onChange={e => { setCsvFile(e.target.files?.[0] || null); setCsvResult(null) }} style={{ display: 'none' }} />
                  </label>
                </div>

                {/* Import button */}
                <motion.button
                  onClick={handleImportarCSV}
                  disabled={csvLoading || !csvFile}
                  whileHover={{ scale: csvLoading || !csvFile ? 1 : 1.02 }}
                  whileTap={{ scale: csvLoading || !csvFile ? 1 : 0.98 }}
                  style={{
                    padding: '13px 32px', borderRadius: 14,
                    background: csvFile ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'rgba(255,255,255,0.06)',
                    color: csvFile ? 'white' : 'var(--muted)',
                    fontSize: 14, fontWeight: 600, border: 'none',
                    cursor: csvLoading || !csvFile ? 'not-allowed' : 'pointer',
                    opacity: csvLoading ? 0.7 : 1,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  {csvLoading && (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
                  )}
                  {csvLoading ? 'Importando...' : 'Importar'}
                </motion.button>

                {/* Result */}
                <AnimatePresence>
                  {csvResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      style={{
                        marginTop: 20, padding: '18px 22px', borderRadius: 16,
                        background: csvResult.errores.length === 0 ? 'rgba(0,214,178,0.08)' : 'rgba(255,107,107,0.08)',
                        border: `1px solid ${csvResult.errores.length === 0 ? 'rgba(0,214,178,0.3)' : 'rgba(255,107,107,0.3)'}`,
                      }}
                    >
                      <p style={{ fontSize: 15, fontWeight: 600, color: csvResult.errores.length === 0 ? 'var(--success)' : 'var(--danger)', marginBottom: 8 }}>
                        {csvResult.creados} registros importados de {csvResult.total_filas} filas
                      </p>
                      {csvResult.errores.length > 0 && (
                        <div>
                          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>{csvResult.errores.length} errores:</p>
                          <div style={{ maxHeight: 120, overflowY: 'auto' }}>
                            {csvResult.errores.map((e, i) => (
                              <p key={i} style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 3 }}>• {e}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlowingCard>
            </div>
          </motion.div>
        )

      // ═══════════════════════════════════════════════════════════
      // FACTURACIÓN
      // ═══════════════════════════════════════════════════════════
      case 'facturacion': {
        const PLANES_DEF = [
          {
            key: 'basico', nombre: 'Básico', precio: 29,
            color: '#4A9EF0', colorAlpha: 'rgba(74,158,240,0.18)',
            border: 'rgba(74,158,240,0.28)',
            features: ['1 sede', 'Hasta 3 usuarios', 'Alertas por correo', 'KPIs y reportes básicos', 'Soporte por email'],
          },
          {
            key: 'profesional', nombre: 'Profesional', precio: 79, popular: true,
            color: '#00D6B2', colorAlpha: 'rgba(0,214,178,0.2)',
            border: 'rgba(0,214,178,0.42)',
            features: ['Hasta 5 sedes', 'Hasta 15 usuarios', 'Alertas por correo y WhatsApp', 'Recomendaciones con IA (Claude)', 'Motor automático programado', 'Soporte prioritario'],
          },
          {
            key: 'enterprise', nombre: 'Enterprise', precio: 199,
            color: '#E8C490', colorAlpha: 'rgba(232,196,144,0.13)',
            border: 'rgba(232,196,144,0.28)',
            features: ['Sedes ilimitadas', 'Usuarios ilimitados', 'Alertas por correo y WhatsApp', 'IA en todas las alertas', 'Motor automático y prioridad', 'Soporte 24/7 dedicado'],
          },
        ]

        // Plan actual = el de la clínica (siempre definido, incluye Gratis), no el
        // registro de facturación (que no existe en Gratis).
        const planActualKey = clinica?.plan ?? 'gratis'
        const estadoBadge = plan
          ? { activo: { bg: 'rgba(0,214,178,0.12)', color: 'var(--success)', border: 'rgba(0,214,178,0.25)', label: 'Activo' },
              prueba:  { bg: 'rgba(232,196,144,0.12)', color: '#E8C490',        border: 'rgba(232,196,144,0.25)', label: 'Prueba' },
              vencido: { bg: 'rgba(232,160,160,0.1)',  color: 'var(--danger)',   border: 'rgba(232,160,160,0.2)',  label: 'Vencido' },
              cancelado: { bg: 'rgba(160,160,160,0.1)', color: 'var(--muted)',   border: 'rgba(160,160,160,0.15)', label: 'Cancelado' },
            }[plan.estado as string] ?? { bg: 'rgba(0,214,178,0.12)', color: 'var(--primary)', border: 'rgba(0,214,178,0.25)', label: plan.estado }
          : null

        const formatCard = (val: string) =>
          val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

        const formatExpiry = (val: string) => {
          const d = val.replace(/\D/g, '').slice(0, 4)
          return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d
        }

        const detectarMarca = (num: string): string => {
          const n = num.replace(/\D/g, '')
          if (/^4/.test(n)) return 'Visa'
          if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'Mastercard'
          if (/^3[47]/.test(n)) return 'Amex'
          return 'Tarjeta'
        }

        const handlePagar = async () => {
          if (!planElegido) return
          setProcesandoPago(true)
          try {
            const digits = cardData.numero.replace(/\D/g, '')
            const res = await api.post('/facturacion/simular-suscripcion/', {
              plan: planElegido,
              clinica_id: clinicaId,  // requerido para superadmin (sin clínica fija)
              ultimos_cuatro: digits.slice(-4) || '4242',
              marca_tarjeta: detectarMarca(digits),
            })
            // Refresca plan y clínica en memoria (sin recargar la página).
            const [planRes, clinRes] = await Promise.all([
              api.get(`/planes/?clinica=${clinicaId}`),
              api.get(`/clinicas/${clinicaId}/`),
            ])
            const pd = Array.isArray(planRes.data) ? planRes.data[0] : planRes.data
            if (pd) setPlan(pd)
            if (clinRes.data) setClinica(clinRes.data)
            setPagoModal(false)
            setProcesandoPago(false)
            const cfg = PLANES_DEF.find(p => p.key === planElegido)
            toast.success('Suscripción activada', `Plan ${cfg?.nombre ?? res.data.plan} activo (simulación · sin cobro real).`)
          } catch {
            toast.error('No se pudo activar el plan', 'Revisa los datos e inténtalo de nuevo.')
            setProcesandoPago(false)
          }
        }

        return (
          <motion.div key="facturacion" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <p style={sectionDesc}>Elige el plan perfecto para tu clínica. Cancela cuando quieras.</p>

            {loadingPlan ? <Skeleton count={3} h={220} /> : (
              <>
                {/* ── Plan actual banner ────────────────────── */}
                {plan && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 32, padding: '18px 24px', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--primary), var(--accent))', flexShrink: 0 }}>
                        <CreditCardIcon />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <p className="font-display" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', textTransform: 'capitalize' }}>{plan.plan}</p>
                          {estadoBadge && (
                            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600, background: estadoBadge.bg, color: estadoBadge.color, border: `1px solid ${estadoBadge.border}` }}>
                              {estadoBadge.label}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
                          {plan.moneda} {Number(plan.monto).toLocaleString()}/mes · Renueva {new Date(plan.fecha_renovacion).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => { setPlanElegido(plan.plan); setPagoModal(true) }}
                      style={{ padding: '9px 20px', borderRadius: 11, background: 'rgba(0,214,178,0.12)', color: 'var(--primary)', border: '1px solid rgba(0,214,178,0.25)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      Cambiar método de pago
                    </motion.button>
                  </motion.div>
                )}
                {/* Banner plan Gratis (sin registro de facturación) */}
                {!plan && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 32, padding: '18px 24px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 14, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sunken)', border: '1px solid var(--border)', flexShrink: 0 }}>
                      <CreditCardIcon />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <p className="font-display" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', textTransform: 'capitalize' }}>{planActualKey}</p>
                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600, background: 'rgba(156,199,192,0.12)', color: 'var(--muted)', border: '1px solid var(--border)' }}>Plan actual</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Sin costo · sin método de pago. Mejora tu plan para desbloquear IA, integraciones y correo.</p>
                    </div>
                  </motion.div>
                )}

                {/* ── Plan cards ───────────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 32 }}>
                  {PLANES_DEF.map((p, i) => {
                    const isCurrent = planActualKey === p.key
                    return (
                      <motion.div key={p.key}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        style={{ position: 'relative', borderRadius: 22, padding: '28px 24px', background: isCurrent ? p.colorAlpha : 'var(--glass)', backdropFilter: 'blur(20px)', border: `1.5px solid ${isCurrent ? p.border : 'var(--border)'}`, display: 'flex', flexDirection: 'column', gap: 20, overflow: 'hidden', boxShadow: isCurrent ? `0 8px 32px ${p.colorAlpha}` : 'none' }}>

                        {p.popular && (
                          <div style={{ position: 'absolute', top: 16, right: 16, padding: '4px 12px', borderRadius: 20, background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
                            MÁS POPULAR
                          </div>
                        )}
                        {isCurrent && (
                          <div style={{ position: 'absolute', top: 16, right: 16, padding: '4px 12px', borderRadius: 20, background: p.colorAlpha, color: p.color, border: `1px solid ${p.border}`, fontSize: 11, fontWeight: 700 }}>
                            PLAN ACTUAL
                          </div>
                        )}

                        {/* Header */}
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: p.color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{p.nombre}</p>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                            <span className="font-display" style={{ fontSize: 42, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>${p.precio}</span>
                            <span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 400 }}>/mes</span>
                          </div>
                        </div>

                        {/* Features */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {p.features.map((f, fi) => (
                            <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 18, height: 18, borderRadius: '50%', background: `${p.colorAlpha}`, border: `1px solid ${p.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><polyline points="2 8 6 12 14 4" stroke={p.color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </div>
                              <span style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.3 }}>{f}</span>
                            </div>
                          ))}
                        </div>

                        {/* CTA */}
                        {p.key === 'enterprise' ? (
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            onClick={() => { setEnterpriseMsg(''); setEnterpriseModal(true) }}
                            style={{ width: '100%', padding: '13px', borderRadius: 13, background: p.colorAlpha, color: p.color, border: `1px solid ${p.border}`, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                            {planActualKey === 'enterprise' ? 'Plan actual' : 'Solicitar acuerdo'}
                          </motion.button>
                        ) : (
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            onClick={() => { setPlanElegido(p.key); setCardData({ numero: '', nombre: '', expiry: '', cvv: '' }); setPagoModal(true) }}
                            style={{ width: '100%', padding: '13px', borderRadius: 13, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', color: 'white', background: isCurrent ? `linear-gradient(135deg, ${p.color}bb, ${p.color}88)` : p.popular ? 'linear-gradient(135deg, var(--primary), var(--accent))' : `linear-gradient(135deg, ${p.color}99, ${p.color}66)`, boxShadow: p.popular && !isCurrent ? '0 4px 20px rgba(0,214,178,0.35)' : 'none' }}>
                            {isCurrent ? 'Plan actual' : 'Suscribirse'}
                          </motion.button>
                        )}
                      </motion.div>
                    )
                  })}
                </div>

                {/* ── Usage bars ────────────────────────────── */}
                <GlowingCard className="p-6">
                  <h3 className="font-display" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>Uso del plan</h3>
                  {[
                    { label: 'Correos de notificación', used: emails.length, total: plan?.plan === 'basico' ? 3 : plan?.plan === 'profesional' ? 10 : 50 },
                    { label: 'Integraciones activas', used: integraciones.filter(i => i.estado === 'activa').length, total: plan?.plan === 'basico' ? 0 : plan?.plan === 'profesional' ? 1 : 99 },
                  ].map((item, i) => (
                    <div key={i} style={{ marginBottom: i === 0 ? 16 : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                        <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{item.label}</p>
                        <p style={{ fontSize: 12, color: 'var(--muted)' }}>{item.used} / {item.total}</p>
                      </div>
                      <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${item.total > 0 ? Math.min((item.used / item.total) * 100, 100) : 0}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                          style={{ height: '100%', borderRadius: 3, background: (item.used / Math.max(item.total,1)) > 0.8 ? 'linear-gradient(90deg, var(--danger), #e88a8a)' : 'linear-gradient(90deg, var(--primary), var(--accent))' }} />
                      </div>
                    </div>
                  ))}
                </GlowingCard>
              </>
            )}

            {/* ══ PAYMENT MODAL ══════════════════════════════════════ */}
            <AnimatePresence>
              {pagoModal && planElegido && (() => {
                const pd = PLANES_DEF.find(p => p.key === planElegido)!
                return (
                  <motion.div key="pago-overlay"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={(e) => { if (e.target === e.currentTarget) { setPagoModal(false) } }}
                    style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(6,4,18,0.82)', backdropFilter: 'blur(12px)', padding: '20px' }}>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.93, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                      style={{ width: '100%', maxWidth: 880, borderRadius: 28, background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                      {/* Modal header */}
                      <div style={{ padding: '22px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${pd.color}55, ${pd.color}33)`, border: `1px solid ${pd.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CreditCardIcon />
                          </div>
                          <div>
                            <p className="font-display" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Plan {pd.nombre}</p>
                            <p style={{ fontSize: 13, color: 'var(--muted)' }}>${pd.precio} USD / mes · simulación (sin cobro real)</p>
                          </div>
                        </div>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setPagoModal(false)}
                          style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
                          <XIcon />
                        </motion.button>
                      </div>

                      {/* Modal body */}
                      <div style={{ padding: '36px 28px', display: 'flex', gap: 48, alignItems: 'flex-start', flexWrap: 'wrap' }}>

                        {/* Left — 3D card */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, flex: '0 0 auto' }}>
                          <CreditCard3D data={cardData} flipped={cardFocused === 'cvv'} />
                          <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', maxWidth: 300 }}>
                            Entorno de demostración: la suscripción se activa sin realizar ningún cobro. No ingreses datos de una tarjeta real.
                          </p>
                        </div>

                        {/* Right — form */}
                        <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 18 }}>

                          {/* Card number */}
                          <div>
                            <label style={labelStyle}>Número de tarjeta</label>
                            <div style={{ position: 'relative' }}>
                              <input
                                placeholder="4532 1234 5678 9012"
                                value={cardData.numero}
                                onChange={e => setCardData(d => ({ ...d, numero: formatCard(e.target.value) }))}
                                onFocus={() => setCardFocused('numero')}
                                onBlur={() => setCardFocused(null)}
                                style={{ ...inputStyle, paddingRight: 48, fontFamily: '"Courier New", monospace', letterSpacing: '0.1em' }}
                              />
                              <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>
                                <CreditCardIcon />
                              </div>
                            </div>
                          </div>

                          {/* Titular */}
                          <div>
                            <label style={labelStyle}>Nombre del titular</label>
                            <input
                              placeholder="JUAN GARCÍA"
                              value={cardData.nombre}
                              onChange={e => setCardData(d => ({ ...d, nombre: e.target.value.toUpperCase() }))}
                              onFocus={() => setCardFocused('nombre')}
                              onBlur={() => setCardFocused(null)}
                              style={{ ...inputStyle, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                            />
                          </div>

                          {/* Expiry + CVV */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <div>
                              <label style={labelStyle}>Vencimiento</label>
                              <input
                                placeholder="MM/AA"
                                value={cardData.expiry}
                                onChange={e => setCardData(d => ({ ...d, expiry: formatExpiry(e.target.value) }))}
                                onFocus={() => setCardFocused('expiry')}
                                onBlur={() => setCardFocused(null)}
                                style={{ ...inputStyle, fontFamily: '"Courier New", monospace', letterSpacing: '0.1em' }}
                              />
                            </div>
                            <div>
                              <label style={labelStyle}>CVV</label>
                              <input
                                placeholder="•••"
                                value={cardData.cvv}
                                maxLength={4}
                                onChange={e => setCardData(d => ({ ...d, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                                onFocus={() => setCardFocused('cvv')}
                                onBlur={() => setCardFocused(null)}
                                style={{ ...inputStyle, fontFamily: '"Courier New", monospace', letterSpacing: '0.18em' }}
                              />
                            </div>
                          </div>

                          {/* Pay button */}
                          <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            onClick={handlePagar}
                            disabled={procesandoPago}
                            style={{ marginTop: 8, width: '100%', padding: '16px', borderRadius: 14, background: procesandoPago ? 'rgba(0,214,178,0.4)' : 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', fontSize: 15, fontWeight: 700, border: 'none', cursor: procesandoPago ? 'not-allowed' : 'pointer', boxShadow: procesandoPago ? 'none' : '0 6px 24px rgba(0,214,178,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            {procesandoPago ? (
                              <>
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                  style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%' }} />
                                Activando…
                              </>
                            ) : (
                              <>Activar plan ${pd.precio}/mes →</>
                            )}
                          </motion.button>

                          <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.5 }}>
                            Al continuar aceptas los Términos de Servicio. Puedes cancelar en cualquier momento desde esta sección.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )
              })()}
            </AnimatePresence>

            {/* ══ ENTERPRISE REQUEST MODAL ══════════════════════════ */}
            <AnimatePresence>
              {enterpriseModal && (
                <motion.div key="ent-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={(e) => { if (e.target === e.currentTarget) setEnterpriseModal(false) }}
                  style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(6,4,18,0.82)', backdropFilter: 'blur(12px)', padding: 20 }}>
                  <motion.div initial={{ opacity: 0, scale: 0.93, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                    style={{ width: '100%', maxWidth: 560, borderRadius: 24, background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
                    <div style={{ padding: '24px 28px 18px', borderBottom: '1px solid var(--border)' }}>
                      <p className="eyebrow" style={{ color: '#E8C490', marginBottom: 8 }}>Plan por acuerdo</p>
                      <h2 className="font-display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Solicitar Enterprise</h2>
                      <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>
                        Describe los acuerdos que necesitas (número de usuarios, sedes, beneficios de IA, personalización). El equipo Vigía lo revisará.
                      </p>
                    </div>
                    <div style={{ padding: '22px 28px' }}>
                      <textarea value={enterpriseMsg} onChange={e => setEnterpriseMsg(e.target.value)}
                        placeholder="Ej: Necesitamos 250 usuarios, 8 sedes, IA en todas las alertas y logo personalizado…"
                        rows={5}
                        style={{ ...inputStyle, resize: 'vertical', minHeight: 120, fontFamily: 'inherit' }} />
                    </div>
                    <div style={{ padding: '0 28px 24px', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                      <button onClick={() => setEnterpriseModal(false)}
                        style={{ padding: '11px 20px', borderRadius: 12, background: 'var(--glass)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                        Cancelar
                      </button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        disabled={!enterpriseMsg.trim() || enviandoEnterprise}
                        onClick={async () => {
                          setEnviandoEnterprise(true)
                          try {
                            await api.post('/facturacion/solicitar-enterprise/', { mensaje: enterpriseMsg.trim() })
                            setEnterpriseModal(false)
                            toast.success('Solicitud enviada', 'El equipo Vigía revisará tu acuerdo Enterprise.')
                          } catch (err: any) {
                            toast.error(err.response?.data?.error || 'No se pudo enviar la solicitud')
                          } finally { setEnviandoEnterprise(false) }
                        }}
                        style={{ padding: '11px 22px', borderRadius: 12, border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: (!enterpriseMsg.trim() || enviandoEnterprise) ? 'not-allowed' : 'pointer', opacity: (!enterpriseMsg.trim() || enviandoEnterprise) ? 0.45 : 1, background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                        {enviandoEnterprise ? 'Enviando…' : 'Enviar solicitud'}
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      }

      // ═══════════════════════════════════════════════════════════
      // SUPER ADMIN
      // ═══════════════════════════════════════════════════════════
      case 'superadmin':
        return (
          <motion.div key="superadmin" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <p style={sectionDesc}>Crea clínicas, aprueba administradores y gestiona el sistema.</p>

            {/* Solicitudes de administrador pendientes */}
            {adminsPend.length > 0 && (
              <GlowingCard className="p-6 sm:p-8 lg:p-10" style={{ marginBottom: 24, border: '1px solid rgba(245,197,24,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Solicitudes de administrador</h3>
                  <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: 'rgba(245,197,24,0.14)', color: '#E8C490', border: '1px solid rgba(245,197,24,0.3)', fontWeight: 600 }}>
                    {adminsPend.length} pendiente{adminsPend.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {adminsPend.map(a => (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '14px 18px', borderRadius: 14, background: 'var(--sunken)', border: '1px solid var(--border)' }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{a.nombre}</p>
                        <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '3px 0 0' }}>
                          {a.email}{a.clinica_nombre ? ` · ${a.clinica_nombre}` : ''}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          onClick={async () => {
                            try {
                              await api.post(`/usuarios/${a.id}/aprobar/`, { rol: 'admin' })
                              setAdminsPend(prev => prev.filter(x => x.id !== a.id))
                              toast.success('Administrador aprobado', `${a.nombre} ya puede administrar su clínica.`)
                            } catch (err: any) { toast.error(err.response?.data?.error || 'No se pudo aprobar') }
                          }}
                          style={{ padding: '9px 18px', borderRadius: 11, background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                          Aprobar
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          onClick={async () => {
                            try {
                              await api.post(`/usuarios/${a.id}/desactivar/`)
                              setAdminsPend(prev => prev.filter(x => x.id !== a.id))
                              toast.success('Solicitud rechazada')
                            } catch { toast.error('No se pudo rechazar') }
                          }}
                          style={{ padding: '9px 18px', borderRadius: 11, background: 'var(--glass)', color: 'var(--muted)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                          Rechazar
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              </GlowingCard>
            )}

            {/* Solicitudes de plan Enterprise */}
            {solicitudesPlan.length > 0 && (
              <GlowingCard className="p-6 sm:p-8 lg:p-10" style={{ marginBottom: 24, border: '1px solid rgba(232,196,144,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Solicitudes Enterprise</h3>
                  <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: 'rgba(232,196,144,0.14)', color: '#E8C490', border: '1px solid rgba(232,196,144,0.3)', fontWeight: 600 }}>
                    {solicitudesPlan.length} pendiente{solicitudesPlan.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {solicitudesPlan.map(s => (
                    <div key={s.id} style={{ padding: '16px 18px', borderRadius: 14, background: 'var(--sunken)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 220 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{s.clinica_nombre}</p>
                          <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '3px 0 8px' }}>{s.solicitante_nombre} · {s.solicitante_email}</p>
                          <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.55, background: 'var(--glass)', borderRadius: 10, padding: '10px 12px', border: '1px solid var(--border)' }}>{s.mensaje}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={async () => {
                              try {
                                await api.post(`/facturacion/solicitudes-plan/${s.id}/resolver/`, { accion: 'aprobar' })
                                setSolicitudesPlan(prev => prev.filter(x => x.id !== s.id))
                                toast.success('Enterprise activado', `${s.clinica_nombre} pasó a Enterprise.`)
                              } catch { toast.error('No se pudo aprobar') }
                            }}
                            style={{ padding: '9px 18px', borderRadius: 11, background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            Aprobar
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={async () => {
                              try {
                                await api.post(`/facturacion/solicitudes-plan/${s.id}/resolver/`, { accion: 'rechazar' })
                                setSolicitudesPlan(prev => prev.filter(x => x.id !== s.id))
                                toast.success('Solicitud rechazada')
                              } catch { toast.error('No se pudo rechazar') }
                            }}
                            style={{ padding: '9px 18px', borderRadius: 11, background: 'var(--glass)', color: 'var(--muted)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                            Rechazar
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlowingCard>
            )}

            {/* Crear nueva clínica */}
            <GlowingCard className="p-6 sm:p-8 lg:p-10" style={{ marginBottom: 24 }}>
              <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>
                Nueva clínica
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
                <div>
                  <label style={labelStyle}>Nombre</label>
                  <input value={nuevaClinicaForm.nombre} onChange={e => setNuevaClinicaForm({ ...nuevaClinicaForm, nombre: e.target.value })}
                    placeholder="Clínica San José" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" value={nuevaClinicaForm.email} onChange={e => setNuevaClinicaForm({ ...nuevaClinicaForm, email: e.target.value })}
                    placeholder="admin@clinica.com" style={inputStyle} />
                </div>
                <motion.button
                  onClick={async () => {
                    if (!nuevaClinicaForm.nombre || !nuevaClinicaForm.email) return
                    setSavingNuevaClinica(true)
                    try {
                      const res = await api.post('/clinicas/', { ...nuevaClinicaForm, activa: true })
                      setTodasClinicas(prev => [...prev, res.data])
                      setNuevaClinicaForm({ nombre: '', email: '', plan: 'gratis' })
                      toast.success('Clínica creada', `${res.data.nombre} fue registrada exitosamente.`)
                    } catch { toast.error('Error', 'No se pudo crear la clínica.') }
                    finally { setSavingNuevaClinica(false) }
                  }}
                  disabled={savingNuevaClinica || !nuevaClinicaForm.nombre || !nuevaClinicaForm.email}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ padding: '13px 22px', borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, opacity: savingNuevaClinica ? 0.7 : 1, whiteSpace: 'nowrap' }}>
                  <PlusIcon /> Crear
                </motion.button>
              </div>
            </GlowingCard>

            {/* Lista de clínicas */}
            <GlowingCard className="p-6 sm:p-8 lg:p-10">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Todas las clínicas</h3>
                <span style={{ fontSize: 13, padding: '4px 12px', borderRadius: 20, background: 'rgba(0,214,178,0.12)', color: 'var(--primary)', border: '1px solid rgba(0,214,178,0.2)' }}>
                  {todasClinicas.length} registradas
                </span>
              </div>
              {loadingTodasClinicas ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[1,2,3].map(i => <motion.div key={i} animate={{ opacity: [0.3,0.6,0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i*0.2 }} style={{ height: 72, borderRadius: 16, background: 'var(--sunken)' }} />)}
                </div>
              ) : todasClinicas.length === 0 ? (
                <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '32px 0' }}>No hay clínicas registradas</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {todasClinicas.map((c, i) => {
                    const isOpen = expandedClinica === c.id
                    const sedesC = sedesPorClinica[c.id] ?? []
                    const loadingS = loadingSedesClinica[c.id] ?? false

                    const toggleExpand = async () => {
                      if (isOpen) { setExpandedClinica(null); return }
                      setExpandedClinica(c.id)
                      if (!sedesPorClinica[c.id]) {
                        setLoadingSedesClinica(prev => ({ ...prev, [c.id]: true }))
                        try {
                          const res = await api.get(`/sedes/?clinica=${c.id}`)
                          setSedesPorClinica(prev => ({ ...prev, [c.id]: res.data.results || res.data }))
                        } catch {}
                        finally { setLoadingSedesClinica(prev => ({ ...prev, [c.id]: false })) }
                      }
                    }

                    return (
                      <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        style={{ borderRadius: 16, background: 'var(--sunken)', border: `1px solid ${isOpen ? 'rgba(0,214,178,0.3)' : 'var(--border)'}`, overflow: 'hidden', transition: 'border-color 0.2s' }}>

                        {/* Header row */}
                        <div
                          onClick={toggleExpand}
                          style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', cursor: 'pointer' }}>
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                            {c.nombre[0]}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{c.nombre}</p>
                            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{c.email} · Plan {c.plan}</p>
                          </div>
                          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: c.activa ? 'rgba(0,214,178,0.15)' : 'rgba(255,107,107,0.1)', color: c.activa ? '#00D6B2' : 'var(--danger)', border: `1px solid ${c.activa ? 'rgba(0,214,178,0.3)' : 'rgba(255,107,107,0.2)'}`, flexShrink: 0 }}>
                            {c.activa ? 'Activa' : 'Inactiva'}
                          </span>
                          {/* Chevron */}
                          <motion.svg
                            animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}
                            width="16" height="16" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                            <polyline points="6 9 12 15 18 9"/>
                          </motion.svg>
                          <motion.button
                            onClick={e => { e.stopPropagation(); setConfirmDeleteClinica({ open: true, id: c.id, nombre: c.nombre }) }}
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--danger)', flexShrink: 0 }}>
                            <TrashIcon />
                          </motion.button>
                        </div>

                        {/* Sedes expandidas */}
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              style={{ overflow: 'hidden' }}>
                              <div style={{ padding: '0 20px 16px 20px', borderTop: '1px solid var(--border)' }}>
                                <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '14px 0 10px' }}>
                                  Sedes
                                </p>
                                {loadingS ? (
                                  <div style={{ display: 'flex', gap: 8 }}>
                                    {[1,2].map(k => <motion.div key={k} animate={{ opacity: [0.3,0.6,0.3] }} transition={{ duration: 1.2, repeat: Infinity }} style={{ height: 32, width: 120, borderRadius: 10, background: 'var(--lift)' }} />)}
                                  </div>
                                ) : sedesC.length === 0 ? (
                                  <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>Sin sedes registradas</p>
                                ) : (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {sedesC.map(s => (
                                      <span key={s.id} style={{ fontSize: 13, fontWeight: 500, padding: '6px 14px', borderRadius: 10, background: s.activa ? 'rgba(0,214,178,0.1)' : 'var(--sunken)', color: s.activa ? 'var(--primary)' : 'var(--muted)', border: `1px solid ${s.activa ? 'rgba(0,214,178,0.25)' : 'var(--border)'}` }}>
                                        {s.nombre}
                                        {!s.activa && <span style={{ fontSize: 11, marginLeft: 6, opacity: 0.6 }}>inactiva</span>}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </GlowingCard>

            <ConfirmModal
              open={confirmDeleteClinica.open}
              title="Eliminar clínica"
              message={`¿Estás seguro de que deseas eliminar "${confirmDeleteClinica.nombre}"? Se eliminarán todos sus datos: sedes, usuarios, médicos, pacientes, citas y alertas. Esta acción es irreversible.`}
              confirmLabel={deletingClinica ? 'Eliminando...' : 'Eliminar todo'}
              variant="danger"
              onConfirm={async () => {
                setDeletingClinica(true)
                try {
                  await api.delete(`/clinicas/${confirmDeleteClinica.id}/`)
                  setTodasClinicas(prev => prev.filter(c => c.id !== confirmDeleteClinica.id))
                  toast.success('Clínica eliminada', `${confirmDeleteClinica.nombre} fue eliminada.`)
                } catch { toast.error('Error', 'No se pudo eliminar la clínica.') }
                finally { setDeletingClinica(false); setConfirmDeleteClinica({ open: false, id: 0, nombre: '' }) }
              }}
              onCancel={() => setConfirmDeleteClinica({ open: false, id: 0, nombre: '' })}
            />
          </motion.div>
        )

      // ═══════════════════════════════════════════════════════════
      // EQUIPO
      // ═══════════════════════════════════════════════════════════
      case 'equipo':
        return (
          <motion.div key="equipo" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={sectionDesc}>Gestiona los usuarios con acceso a la plataforma.</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {!esAdmin && (
                  <motion.button onClick={() => setShowSolicitud(v => !v)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 14, background: 'rgba(74,158,240,0.1)', border: '1px solid rgba(74,158,240,0.3)', color: '#4A9EF0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    Solicitar cambio de rol
                  </motion.button>
                )}
                {esAdmin && (
                  <motion.button onClick={() => setShowInvitar(v => !v)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 14, background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,214,178,0.3)' }}>
                    <PlusIcon /> Invitar miembro
                  </motion.button>
                )}
              </div>
            </div>

            {/* Temp password */}
            <AnimatePresence>
              {tempPassword && (
                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                  style={{ marginBottom: 20, padding: '20px 24px', borderRadius: 20, background: 'rgba(0,214,178,0.1)', border: '1px solid rgba(0,214,178,0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--success)', marginBottom: 6 }}>Usuario creado. Contraseña temporal:</p>
                      <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 8 }}>{tempPassword}</p>
                      <p style={{ fontSize: 13, color: 'var(--muted)' }}>Comparte esto con el usuario — solo se muestra una vez.</p>
                    </div>
                    <motion.button onClick={() => setTempPassword(null)} whileHover={{ scale: 1.1 }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 20, padding: 4 }}>×</motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Solicitudes pendientes */}
            <AnimatePresence>
              {esAdmin && equipoSolicitudes.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} style={{ marginBottom: 20 }}>
                  <GlowingCard className="p-6 sm:p-8">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFD166', display: 'inline-block' }} />
                      <h3 className="font-display" style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>Solicitudes pendientes</h3>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,209,102,0.15)', color: '#FFD166', border: '1px solid rgba(255,209,102,0.3)' }}>
                        {equipoSolicitudes.length}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {equipoSolicitudes.map(s => {
                        const rs = EQUIPO_ROL_STYLE[s.rol_solicitado as EquipoRol] || EQUIPO_ROL_STYLE.viewer
                        return (
                          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', padding: '14px 18px', borderRadius: 14, background: 'rgba(255,209,102,0.05)', border: '1px solid rgba(255,209,102,0.15)' }}>
                            <div style={{ flex: 1, minWidth: 160 }}>
                              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{s.usuario_nombre || s.usuario_email}</p>
                              <p style={{ fontSize: 12, color: 'var(--muted)' }}>{s.usuario_email}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Solicita →</span>
                              <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: rs.bg, color: rs.color, border: `1px solid ${rs.border}` }}>
                                {EQUIPO_ROLES.find(r => r.key === s.rol_solicitado)?.label || s.rol_solicitado}
                              </span>
                            </div>
                            {s.motivo && <p style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', flex: '1 1 200px' }}>"{s.motivo}"</p>}
                            <div style={{ display: 'flex', gap: 8 }}>
                              <motion.button onClick={() => handleAprobarSolicitud(s.id)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(0,214,178,0.15)', border: '1px solid rgba(0,214,178,0.3)', color: '#00D6B2', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                                <CheckIcon /> Aprobar
                              </motion.button>
                              <motion.button onClick={() => handleRechazarSolicitud(s.id)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', color: '#FF6B6B', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
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

            {/* Solicitar rol form */}
            <AnimatePresence>
              {showSolicitud && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: 20 }}>
                  <GlowingCard className="p-6 sm:p-8">
                    <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>Solicitar cambio de rol</h3>
                    <div style={{ marginBottom: 20 }}>
                      <label style={labelStyle}>Rol solicitado</label>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {EQUIPO_ROLES.filter(r => r.key !== user?.rol).map(r => {
                          const rs = EQUIPO_ROL_STYLE[r.key]
                          return (
                            <motion.button key={r.key} onClick={() => setSolicitudForm({ ...solicitudForm, rol_solicitado: r.key })}
                              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                              style={{ padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '2px solid', background: solicitudForm.rol_solicitado === r.key ? rs.bg : 'var(--sunken)', borderColor: solicitudForm.rol_solicitado === r.key ? rs.color : 'var(--border)', color: solicitudForm.rol_solicitado === r.key ? rs.color : 'var(--muted)', transition: 'all 0.2s' }}>
                              {r.label}
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <label style={labelStyle}>Motivo *</label>
                      <textarea value={solicitudForm.motivo} onChange={e => setSolicitudForm({ ...solicitudForm, motivo: e.target.value })}
                        placeholder="Explica brevemente por qué necesitas este rol..." rows={3}
                        style={{ ...inputStyle, resize: 'vertical', minHeight: 90 } as React.CSSProperties} />
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <motion.button onClick={() => setShowSolicitud(false)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        style={{ padding: '11px 22px', borderRadius: 12, background: 'var(--sunken)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 14, cursor: 'pointer' }}>
                        Cancelar
                      </motion.button>
                      <motion.button onClick={handleSolicitarRol} disabled={savingSolicitud} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
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
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: 20 }}>
                  <GlowingCard className="p-6 sm:p-8">
                    <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>Invitar nuevo miembro</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                      <div>
                        <label style={labelStyle}>Correo electrónico *</label>
                        <input type="email" value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
                          placeholder="usuario@clinica.com" onKeyDown={e => e.key === 'Enter' && handleInvitar()} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Nombre (opcional)</label>
                        <input value={inviteForm.nombre} onChange={e => setInviteForm({ ...inviteForm, nombre: e.target.value })}
                          placeholder="Dr. Nombre Apellido" onKeyDown={e => e.key === 'Enter' && handleInvitar()} style={inputStyle} />
                      </div>
                    </div>
                    <div style={{ marginBottom: 24 }}>
                      <label style={labelStyle}>Rol inicial</label>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {EQUIPO_ROLES.map(r => {
                          const rs = EQUIPO_ROL_STYLE[r.key]
                          return (
                            <motion.button key={r.key} onClick={() => setInviteForm({ ...inviteForm, rol: r.key })}
                              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                              style={{ padding: '9px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '2px solid', background: inviteForm.rol === r.key ? rs.bg : 'var(--sunken)', borderColor: inviteForm.rol === r.key ? rs.color : 'var(--border)', color: inviteForm.rol === r.key ? rs.color : 'var(--muted)', transition: 'all 0.2s' }}>
                              {r.label}
                            </motion.button>
                          )
                        })}
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>{EQUIPO_ROLES.find(r => r.key === inviteForm.rol)?.desc}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <motion.button onClick={() => setShowInvitar(false)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        style={{ padding: '11px 22px', borderRadius: 12, background: 'var(--sunken)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 14, cursor: 'pointer' }}>
                        Cancelar
                      </motion.button>
                      <motion.button onClick={handleInvitar} disabled={savingInvite} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        style={{ padding: '11px 28px', borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: savingInvite ? 'not-allowed' : 'pointer', opacity: savingInvite ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        {savingInvite ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
                        ) : <PlusIcon />}
                        {savingInvite ? 'Enviando...' : 'Invitar'}
                      </motion.button>
                    </div>
                  </GlowingCard>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lista usuarios */}
            <GlowingCard className="p-6 sm:p-8">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Miembros del equipo</h3>
                <span style={{ fontSize: 13, fontWeight: 500, padding: '5px 14px', borderRadius: 20, background: 'rgba(0,214,178,0.12)', color: 'var(--primary)', border: '1px solid rgba(0,214,178,0.2)' }}>
                  {equipoUsuarios.length} usuarios
                </span>
              </div>
              {loadingEquipo ? (
                <Skeleton count={4} h={64} />
              ) : equipoUsuarios.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)', fontSize: 14 }}>Sin usuarios en esta clínica.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <AnimatePresence>
                    {equipoUsuarios.map((u, i) => {
                      const rs = EQUIPO_ROL_STYLE[u.rol as EquipoRol] || EQUIPO_ROL_STYLE.viewer
                      return (
                        <motion.div key={u.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12, height: 0 }} transition={{ delay: i * 0.04 }}
                          style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', borderRadius: 16, background: 'var(--sunken)', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${rs.color}40, ${rs.color}20)`, border: `1px solid ${rs.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: rs.color, flexShrink: 0 }}>
                            {(u.nombre || u.email || 'U')[0].toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 140 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{u.nombre || '—'}</p>
                            <p style={{ fontSize: 12, color: 'var(--muted)' }}>{u.email}</p>
                          </div>
                          {esAdmin && u.id !== user?.id ? (
                            <select value={u.rol} onChange={e => handleCambiarRol(u.id, e.target.value as EquipoRol)}
                              style={{ padding: '7px 12px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: rs.bg, border: `1px solid ${rs.border}`, color: rs.color, cursor: 'pointer', outline: 'none' }}>
                              {EQUIPO_ROLES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
                            </select>
                          ) : (
                            <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: rs.bg, color: rs.color, border: `1px solid ${rs.border}` }}>
                              {EQUIPO_ROLES.find(r => r.key === u.rol)?.label || u.rol}
                            </span>
                          )}
                          {esAdmin && u.id !== user?.id && (
                            <motion.button onClick={() => setConfirmDesactivar({ open: true, id: u.id, nombre: u.nombre || u.email })}
                              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--danger)', flexShrink: 0 }}>
                              <UserMinusIcon />
                            </motion.button>
                          )}
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}
            </GlowingCard>

            <ConfirmModal
              open={confirmDesactivar.open}
              title="Desactivar usuario"
              message={`¿Desactivar a ${confirmDesactivar.nombre}? Perderá el acceso a la plataforma.`}
              confirmLabel="Desactivar"
              onConfirm={() => handleDesactivar(confirmDesactivar.id)}
              onCancel={() => setConfirmDesactivar({ open: false, id: 0, nombre: '' })}
            />
          </motion.div>
        )
    }
  }

  // ─── Main layout
  const activeMeta = SECTIONS.find(s => s.key === activeSection)
  const visibleGroups = SECTION_GROUPS.map(g => ({
    label: g.label,
    items: g.keys.map(k => SECTIONS.find(s => s.key === k)).filter((s): s is typeof SECTIONS[number] =>
      !!s && !(s.superadminOnly && user?.rol !== 'superadmin') && !(s.roles && !s.roles.includes(user?.rol || ''))),
  })).filter(g => g.items.length > 0)

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} style={{ marginBottom: 32 }}>
          <span className="eyebrow" style={{ marginBottom: 10, display: 'inline-flex' }}>Ajustes de la cuenta</span>
          <h1 className="display-lg" style={{ color: 'var(--text)', margin: 0 }}>Configuración</h1>
          <p style={{ fontSize: 15, color: 'var(--muted)', marginTop: 10 }}>Administra tu cuenta, clínica y preferencias del sistema.</p>
        </motion.div>

        {/* LAYOUT: grouped rail + content */}
        <div style={{ display: 'grid', gridTemplateColumns: '272px 1fr', gap: 28, alignItems: 'start' }}>

          {/* SIDEBAR — grouped */}
          <motion.aside initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'sticky', top: 16, display: 'flex', flexDirection: 'column', gap: 18, padding: 14, borderRadius: 'var(--r-xl)', background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
            {visibleGroups.map(g => (
              <div key={g.label}>
                <p className="eyebrow" style={{ padding: '0 8px', marginBottom: 8, display: 'block' }}>{g.label}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {g.items.map(s => {
                    const active = activeSection === s.key
                    return (
                      <motion.button key={s.key} onClick={() => setActiveSection(s.key)} whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
                        style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 'var(--r-md)', background: active ? 'rgba(0,214,178,0.12)' : 'transparent', border: `1px solid ${active ? 'rgba(0,214,178,0.28)' : 'transparent'}`, color: active ? 'var(--text)' : 'var(--muted)', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s, border-color 0.2s, color 0.2s' }}>
                        {active && <span style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: 2, background: 'var(--jade)' }} />}
                        <span style={{ color: active ? 'var(--jade)' : 'var(--muted)', flexShrink: 0, display: 'flex' }}>{s.icon}</span>
                        <span style={{ fontSize: 13.5, fontWeight: active ? 600 : 500 }}>{s.label}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            ))}
          </motion.aside>

          {/* CONTENT */}
          <div style={{ minWidth: 0 }}>
            <AnimatePresence mode="wait">
              <motion.div key={activeSection + '-hd'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--r-md)', flexShrink: 0, background: 'rgba(0,214,178,0.12)', border: '1px solid rgba(0,214,178,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--jade)' }}>{activeMeta?.icon}</div>
                <div>
                  <h2 className="display-md" style={{ color: 'var(--text)', margin: 0 }}>{activeMeta?.label}</h2>
                  <p style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 4 }}>{activeMeta?.desc}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {renderSection()}
            </AnimatePresence>
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
