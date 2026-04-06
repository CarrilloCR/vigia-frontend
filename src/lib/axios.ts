import axios from 'axios'
import { useAuthStore } from '../store/auth'
import { useToastStore } from '../store/toast'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const toast = useToastStore.getState()

    // Network / timeout errors
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast.warning(
          'Tiempo de espera agotado',
          'El servidor tardó demasiado en responder. Intenta de nuevo.'
        )
      } else {
        toast.error(
          'Error de conexión',
          'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
        )
      }
      return Promise.reject(error)
    }

    const status = error.response.status

    // 401 - Token refresh
    if (status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = useAuthStore.getState().refreshToken
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh/`,
          { refresh: refreshToken }
        )
        const newAccess = res.data.access
        useAuthStore.getState().setAuth(
          useAuthStore.getState().user!,
          newAccess,
          refreshToken!
        )
        original.headers.Authorization = `Bearer ${newAccess}`
        return api(original)
      } catch {
        useAuthStore.getState().clearAuth()
        toast.error(
          'Sesión expirada',
          'Tu sesión ha expirado. Inicia sesión nuevamente.'
        )
        setTimeout(() => { window.location.href = '/' }, 1500)
        return Promise.reject(error)
      }
    }

    // 403 - Forbidden
    if (status === 403) {
      toast.error(
        'Acceso denegado',
        'No tienes permisos para realizar esta acción.'
      )
    }

    // 500+ - Server errors
    if (status >= 500) {
      toast.error(
        'Error del servidor',
        'Ocurrió un error interno. Nuestro equipo ha sido notificado.'
      )
    }

    return Promise.reject(error)
  }
)

export default api
