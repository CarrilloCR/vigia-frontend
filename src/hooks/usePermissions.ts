'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../store/auth'
import {
  canAccess, canWrite, isApproved, isAdmin, isSuperadmin, isGerenteOrAbove,
  type Rol,
} from '../lib/permissions'

export function usePermissions() {
  const user = useAuthStore(s => s.user)
  return {
    user,
    rol: user?.rol as Rol | undefined,
    aprobado: isApproved(user || undefined),
    can: (section: string) => canAccess(user || undefined, section),
    canWrite: (section: string) => canWrite(user || undefined, section),
    isAdmin: isAdmin(user || undefined),
    isSuperadmin: isSuperadmin(user || undefined),
    isGerenteOrAbove: isGerenteOrAbove(user || undefined),
  }
}

/**
 * Redirect to /dashboard if user cannot access `section`. Returns access bool.
 * If user is unapproved viewer, redirects to /dashboard which itself will show pending screen.
 */
export function useRequireAccess(section: string) {
  const router = useRouter()
  const user = useAuthStore(s => s.user)
  const allowed = canAccess(user || undefined, section)
  useEffect(() => {
    if (!user) {
      router.replace('/')
      return
    }
    if (!isApproved(user)) {
      router.replace('/dashboard')
      return
    }
    if (!allowed) {
      router.replace('/dashboard')
    }
  }, [user, allowed, router])
  return allowed
}
