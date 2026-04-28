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

const LogoutIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const navItems = [
  {
    path: '/dashboard',
    label: 'Alertas',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    exact: true,
  },
  {
    path: '/dashboard/kpis',
    label: 'KPIs',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    path: '/dashboard/medicos',
    label: 'Médicos',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    path: '/dashboard/pacientes',
    label: 'Pacientes',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="8.5" cy="7" r="4"/>
        <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
      </svg>
    ),
  },
  {
    path: '/dashboard/citas',
    label: 'Citas',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    path: '/dashboard/notificaciones',
    label: 'Notificaciones',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
  },
  {
    path: '/dashboard/generador',
    label: 'Generador',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    path: '/dashboard/reportes',
    label: 'Reportes',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><polyline points="2 10 6 6 10 10 14 6 18 10"/>
      </svg>
    ),
  },
  {
    path: '/dashboard/configuracion',
    label: 'Config',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
]

export default function DashboardHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, clearAuth, activeClinicaNombre } = useAuthStore()
  const toast = useToastStore()

  // Refresh user data (including avatar) from server on mount
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

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.path
    return pathname.startsWith(item.path)
  }

  const isSuperadmin = user?.rol === 'superadmin'

  // Filter nav items by user role
  const visibleNav = navItems.filter(item => {
    if (isSuperadmin) return true
    const permisos = NAV_PERMISOS[item.path]
    if (!permisos) return user?.rol === 'admin'
    return permisos.includes((user?.rol ?? 'viewer') as 'admin' | 'gerente' | 'medico' | 'viewer')
  })

  const rolColor = ROL_COLORS[user?.rol ?? 'viewer'] ?? ROL_COLORS.viewer
  const rolLabel = ROL_LABELS[user?.rol ?? 'viewer'] ?? 'Visualizador'

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 32, flexWrap: 'wrap', gap: 16,
      }}
    >
      {/* Logo + nombre + rol */}
      <motion.div
        onClick={() => router.push('/dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
        whileHover={{ scale: 1.02 }}
      >
        <motion.div
          animate={{ filter: ['drop-shadow(0 0 8px rgba(0,201,167,0.3))', 'drop-shadow(0 0 20px rgba(0,201,167,0.6))', 'drop-shadow(0 0 8px rgba(0,201,167,0.3))'] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <VigiaLogo size={56} />
        </motion.div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.nombre}
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(0,201,167,0.4)', flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(0,201,167,0.18)', border: '2px solid rgba(0,201,167,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, fontWeight: 700, color: 'var(--primary)',
            }}>
              {user?.nombre?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <p className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>Vigía</p>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                background: rolColor.bg, color: rolColor.text, border: `1px solid ${rolColor.border}`,
                letterSpacing: '0.02em',
              }}>
                {rolLabel}
              </span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 2 }}>{user?.nombre} · {activeClinicaNombre || user?.clinica_nombre || 'Panel de control'}</p>
          </div>
        </div>
      </motion.div>

      {/* Navegación filtrada por rol */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {visibleNav.map(item => {
          const active = isActive(item)
          return (
            <motion.button
              key={item.path}
              onClick={() => router.push(item.path)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 20px', borderRadius: 14, fontSize: 14, fontWeight: 500,
                cursor: 'pointer', border: 'none',
                background: active ? 'rgba(0,201,167,0.15)' : 'var(--glass)',
                backdropFilter: 'blur(20px)',
                borderWidth: 1, borderStyle: 'solid',
                borderColor: active ? 'rgba(0,201,167,0.4)' : 'var(--border)',
                color: active ? 'var(--primary)' : 'var(--muted)',
                transition: 'all 0.2s',
                boxShadow: active ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
              }}
            >
              {item.icon}
              {item.label}
            </motion.button>
          )
        })}

        {isSuperadmin && <ClinicaSwitcher />}

        <ThemeToggle />

        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 20px', borderRadius: 14,
            background: 'var(--glass)', backdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
            color: 'var(--muted)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <LogoutIcon /> Salir
        </motion.button>
      </div>
    </motion.div>
  )
}
