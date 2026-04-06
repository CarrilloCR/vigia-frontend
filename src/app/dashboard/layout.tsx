'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../store/auth'
import PageLoader from '../../components/ui/PageLoader'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/')
    } else {
      setChecked(true)
    }
  }, [isAuthenticated, router])

  if (!checked) return <PageLoader />

  return <>{children}</>
}
