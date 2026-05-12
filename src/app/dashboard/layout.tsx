'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/auth'
import PageLoader from '../../components/ui/PageLoader'
import DashboardHeader from '../../components/DashboardHeader'
import KpiMiniChart from '../../components/KpiMiniChart'
import Aurora from '../../components/reactbits/Aurora'
import { NAV_PERMISOS, ROL_LABELS } from '../../lib/permisos'

function AccesoRestringido({ rol }: { rol: string }) {
  const router = useRouter()
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 20, textAlign: 'center' }}
    >
      <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(0,201,167,0.1)', border: '1px solid rgba(0,201,167,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="28" height="28" fill="none" stroke="rgba(0,201,167,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Acceso restringido</h2>
      <p style={{ color: 'var(--muted)', fontSize: 14, maxWidth: 360, margin: 0, lineHeight: 1.6 }}>
        Tu rol actual (<strong style={{ color: 'var(--text)' }}>{ROL_LABELS[rol] ?? rol}</strong>) no tiene acceso a esta sección.
        Solicita un cambio de rol desde <strong style={{ color: 'var(--text)' }}>Equipo</strong> si necesitas más acceso.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <motion.button
          onClick={() => router.push('/dashboard/equipo')}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          style={{ padding: '10px 20px', borderRadius: 12, background: 'rgba(0,201,167,0.15)', border: '1px solid rgba(0,201,167,0.35)', color: '#00C9A7', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >
          Solicitar rol
        </motion.button>
        <motion.button
          onClick={() => router.push('/dashboard')}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          style={{ padding: '10px 20px', borderRadius: 12, background: 'var(--glass)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
        >
          Ir al inicio
        </motion.button>
      </div>
    </motion.div>
  )
}

function PendienteAprobacion() {
  const router = useRouter()
  const clearAuth = useAuthStore(s => s.clearAuth)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: 24, textAlign: 'center', padding: 32 }}
    >
      <div style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(245,197,24,0.12)', border: '1px solid rgba(245,197,24,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="36" height="36" fill="none" stroke="#F5C518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>
      <div>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', margin: 0, marginBottom: 8 }}>Cuenta pendiente de aprobación</h2>
        <p style={{ color: 'var(--muted)', fontSize: 15, maxWidth: 460, margin: 0, lineHeight: 1.6 }}>
          Un administrador de tu clínica debe aprobar tu acceso y asignarte una sede.
          Recibirás una notificación cuando se complete el proceso.
        </p>
      </div>
      <motion.button
        onClick={() => { clearAuth(); router.replace('/') }}
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        style={{ padding: '10px 22px', borderRadius: 12, background: 'var(--glass)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
      >
        Cerrar sesión
      </motion.button>
    </motion.div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, setUser } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)
  const isMainDashboard = pathname === '/dashboard'

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/')
    } else {
      setChecked(true)
      // Refresh user from server to catch approval/role updates
      import('../../lib/axios').then(({ default: api }) => {
        api.get('/auth/me/').then(res => {
          if (res.data) setUser(res.data)
        }).catch(() => {})
      })
    }
  }, [isAuthenticated, router, setUser, pathname])

  if (!checked) return <PageLoader />

  const rol = user?.rol ?? 'viewer'
  const aprobado = rol === 'superadmin' || !!user?.aprobado
  const pendiente = !aprobado || rol === 'viewer'

  // While pendiente, poll /me every 10s to detect approval
  useEffect(() => {
    if (!pendiente || !isAuthenticated) return
    const id = setInterval(() => {
      import('../../lib/axios').then(({ default: api }) => {
        api.get('/auth/me/').then(res => {
          if (res.data) setUser(res.data)
        }).catch(() => {})
      })
    }, 10000)
    return () => clearInterval(id)
  }, [pendiente, isAuthenticated, setUser])

  // Check route permission (skip for main dashboard - always accessible)
  const permisos = NAV_PERMISOS[pathname]
  const sinAcceso = !isMainDashboard && rol !== 'superadmin' && permisos !== undefined &&
    !permisos.includes(rol as 'admin' | 'gerente' | 'medico' | 'user' | 'viewer')

  // Pending approval gate: show wait screen everywhere
  if (pendiente) {
    return (
      <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: 'var(--void)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <Aurora colorStops={['#F5C518', '#FF6B6B', '#B06EF5']} amplitude={0.3} speed={0.1} />
        </div>
        <div style={{ position: 'relative', zIndex: 10 }}>
          <PendienteAprobacion />
        </div>
      </div>
    )
  }

  // Dashboard principal maneja su propio layout completo
  if (isMainDashboard) return (
    <>
      {children}
      <KpiMiniChart />
    </>
  )

  // Sub-páginas usan layout compartido con header de navegación
  return (
    <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: 'var(--void)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <Aurora colorStops={['#00C9A7', '#4A9EF0', '#B06EF5']} amplitude={0.5} speed={0.15} />
      </div>

      <div className="px-5 sm:px-8 lg:px-12 xl:px-14 pt-8 sm:pt-10 pb-10 sm:pb-12" style={{ position: 'relative', zIndex: 10, maxWidth: 1600, margin: '0 auto' }}>
        <DashboardHeader />
        {sinAcceso ? <AccesoRestringido rol={rol} /> : children}
      </div>
      <KpiMiniChart />
    </div>
  )
}
