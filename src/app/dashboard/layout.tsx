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
      <div style={{ fontSize: 56 }}>🔒</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Acceso restringido</h2>
      <p style={{ color: 'var(--muted)', fontSize: 14, maxWidth: 360, margin: 0, lineHeight: 1.6 }}>
        Tu rol actual (<strong style={{ color: 'var(--text)' }}>{ROL_LABELS[rol] ?? rol}</strong>) no tiene acceso a esta sección.
        Solicita un cambio de rol desde <strong style={{ color: 'var(--text)' }}>Equipo</strong> si necesitas más acceso.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <motion.button
          onClick={() => router.push('/dashboard/equipo')}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          style={{ padding: '10px 20px', borderRadius: 12, background: 'rgba(155,142,196,0.15)', border: '1px solid rgba(155,142,196,0.35)', color: '#9B8EC4', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)
  const isMainDashboard = pathname === '/dashboard'

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/')
    } else {
      setChecked(true)
    }
  }, [isAuthenticated, router])

  if (!checked) return <PageLoader />

  // Check route permission (skip for main dashboard - always accessible)
  const permisos = NAV_PERMISOS[pathname]
  const rol = user?.rol ?? 'viewer'
  const sinAcceso = !isMainDashboard && permisos !== undefined && !permisos.includes(rol as 'admin' | 'gerente' | 'medico' | 'viewer')

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
        <Aurora colorStops={['#9B8EC4', '#7C6FBF', '#C4B5E8']} amplitude={0.5} speed={0.15} />
      </div>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.03, backgroundImage: 'linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      <div className="px-5 sm:px-8 lg:px-12 xl:px-14 pt-8 sm:pt-10 pb-10 sm:pb-12" style={{ position: 'relative', zIndex: 10, maxWidth: 1600, margin: '0 auto' }}>
        <DashboardHeader />
        {sinAcceso ? <AccesoRestringido rol={rol} /> : children}
      </div>
      <KpiMiniChart />
    </div>
  )
}
