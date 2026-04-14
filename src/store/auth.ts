import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  nombre: string
  email: string
  rol: string
  clinica_id: number | null
  clinica_nombre: string | null
  sede_id: number | null
  sede_nombre: string | null
  avatar?: string
  medico_id?: number | null
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  // Active clinic — for superadmin this can differ from user.clinica_id
  activeClinicaId: number | null
  activeClinicaNombre: string | null
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  setActiveClinica: (id: number, nombre: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      activeClinicaId: null,
      activeClinicaNombre: null,
      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          activeClinicaId: user.clinica_id,
          activeClinicaNombre: user.clinica_nombre,
        }),
      setActiveClinica: (id, nombre) =>
        set({ activeClinicaId: id, activeClinicaNombre: nombre }),
      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          activeClinicaId: null,
          activeClinicaNombre: null,
        }),
    }),
    {
      name: 'vigia-auth',
    }
  )
)
