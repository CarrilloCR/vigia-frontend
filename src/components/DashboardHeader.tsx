'use client'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useAuthStore } from '../store/auth'
import { useToastStore } from '../store/toast'
import api from '../lib/axios'
import VigiaLogo from './ui/VigiaLogo'
import ThemeToggle from './ui/ThemeToggle'
import ClinicaSwitcher from './ui/ClinicaSwitcher'
import { NAV_PERMISOS, ROL_LABELS, ROL_COLORS } from '../lib/permisos'
import { useT } from '../lib/i18n'

const LogoutIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const navItems = [
  { path: '/dashboard', label: 'Alertas', exact: true, icon: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  ) },
  { path: '/dashboard/kpis', label: 'KPIs', icon: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
  ) },
  { path: '/dashboard/medicos', label: 'Médicos', icon: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ) },
  { path: '/dashboard/pacientes', label: 'Pacientes', icon: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
  ) },
  { path: '/dashboard/citas', label: 'Citas', icon: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ) },
  { path: '/dashboard/notificaciones', label: 'Notificaciones', icon: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
  ) },
  { path: '/dashboard/generador', label: 'HIS', icon: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  ) },
  { path: '/dashboard/reportes', label: 'Reportes', icon: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><polyline points="2 10 6 6 10 10 14 6 18 10"/></svg>
  ) },
  { path: '/dashboard/configuracion', label: 'Config', icon: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  ) },
]

export default function DashboardHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, clearAuth, activeClinicaNombre } = useAuthStore()
  const toast = useToastStore()
  const t = useT()

  useEffect(() => {
    if (!user?.avatar) {
      api.get('/auth/me/').then(res => {
        if (res.data.avatar) {
          useAuthStore.setState(s => ({ user: s.user ? { ...s.user, avatar: res.data.avatar } : null }))
        }
      }).catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogout = async () => {
    try {
      const { refreshToken } = useAuthStore.getState()
      await api.post('/auth/logout/', { refresh: refreshToken })
    } catch { } finally {
      clearAuth()
      toast.info('Sesión cerrada', 'Has cerrado sesión correctamente.')
      router.push('/')
    }
  }

  const isActive = (item: typeof navItems[0]) =>
    item.exact ? pathname === item.path : pathname.startsWith(item.path)

  const isSuperadmin = user?.rol === 'superadmin'
  const visibleNav = navItems.filter(item => {
    if (isSuperadmin) return true
    const permisos = NAV_PERMISOS[item.path]
    if (!permisos) return user?.rol === 'admin'
    return permisos.includes((user?.rol ?? 'viewer') as 'admin' | 'gerente' | 'medico' | 'user' | 'viewer')
  })
  // "Mi Consultorio" para el rol médico → su propio detalle (con datos vinculados).
  const medicoId = (user as any)?.medico_id
  const navFinal = (user?.rol === 'medico' && medicoId)
    ? [{ path: `/dashboard/medico/${medicoId}`, label: 'Mi Consultorio', icon: navItems[2].icon }, ...visibleNav]
    : visibleNav

  const rolColor = ROL_COLORS[user?.rol ?? 'viewer'] ?? ROL_COLORS.viewer
  const rolLabel = ROL_LABELS[user?.rol ?? 'viewer'] ?? 'Visualizador'

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'sticky', top: 12, zIndex: 40,
        display: 'flex', flexDirection: 'column', gap: 10,
        marginBottom: 40, padding: '12px 14px',
        borderRadius: 'var(--r-xl)',
        background: 'var(--glass)',
        backdropFilter: 'blur(24px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      {/* Row 1 — brand + account controls (top-left) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
        <motion.div
          onClick={() => router.push('/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer', flexShrink: 0 }}
          whileHover={{ x: 1 }}
        >
          <VigiaLogo size={48} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, lineHeight: 1 }}>
            <span className="font-display" style={{ fontSize: 19, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>Vigía</span>
            <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeClinicaNombre || user?.clinica_nombre || 'Panel de control'}
            </span>
          </div>
        </motion.div>

        <span style={{ width: 1, height: 30, background: 'var(--hairline)', flexShrink: 0 }} />

        {/* User + role chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 12px 5px 6px', borderRadius: 'var(--r-full)', background: 'var(--lift)', border: '1px solid var(--hairline)', flexShrink: 0 }}>
          {user?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt={user.nombre} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${rolColor.border}`, flexShrink: 0 }} />
          ) : (
            <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: rolColor.bg, border: `2px solid ${rolColor.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: rolColor.text }}>
              {user?.nombre?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, lineHeight: 1 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.nombre}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: rolColor.text, letterSpacing: '0.02em' }}>{rolLabel}</span>
          </div>
        </div>

        <ThemeToggle />

        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Cerrar sesión"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 38, height: 38, borderRadius: 'var(--r-md)', flexShrink: 0,
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--muted)', cursor: 'pointer',
          }}
        >
          <LogoutIcon />
        </motion.button>

        {isSuperadmin && <div style={{ marginLeft: 'auto', flexShrink: 0 }}><ClinicaSwitcher /></div>}
      </div>

      {/* Row 2 — nav pills (horizontal scroll, never wraps) */}
      <nav data-tour="nav" style={{ display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto', width: '100%', paddingBottom: 2, scrollbarWidth: 'none' }}>
        {navFinal.map(item => {
          const active = isActive(item)
          return (
            <motion.button
              key={item.path}
              data-tour={`nav-${item.path.split('/').pop()}`}
              onClick={() => router.push(item.path)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              style={{
                position: 'relative',
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 15px', borderRadius: 'var(--r-md)',
                fontSize: 13.5, fontWeight: active ? 600 : 500,
                cursor: 'pointer', border: '1px solid transparent',
                background: active ? 'rgba(0,214,178,0.12)' : 'transparent',
                borderColor: active ? 'rgba(0,214,178,0.30)' : 'transparent',
                color: active ? 'var(--jade)' : 'var(--muted)',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              {item.icon}
              {t(item.label)}
            </motion.button>
          )
        })}
      </nav>
    </motion.header>
  )
}
