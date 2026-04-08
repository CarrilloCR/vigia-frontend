'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '../../store/auth'
import PageLoader from '../../components/ui/PageLoader'
import DashboardHeader from '../../components/DashboardHeader'
import KpiMiniChart from '../../components/KpiMiniChart'
import Aurora from '../../components/reactbits/Aurora'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
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
        {children}
      </div>
      <KpiMiniChart />
    </div>
  )
}
