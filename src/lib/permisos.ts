export type Rol = 'superadmin' | 'admin' | 'gerente' | 'medico' | 'viewer'

/**
 * Rutas accesibles por rol.
 * viewer      → alertas, kpis, notificaciones, equipo
 * medico      → + médicos, pacientes, citas
 * gerente     → + reportes, correos
 * admin       → todo excepto generador
 * superadmin  → todo
 */
export const NAV_PERMISOS: Record<string, Rol[]> = {
  '/dashboard': ['superadmin', 'admin', 'gerente', 'medico', 'viewer'],
  '/dashboard/kpis': ['superadmin', 'admin', 'gerente', 'medico', 'viewer'],
  '/dashboard/notificaciones': ['superadmin', 'admin', 'gerente', 'medico', 'viewer'],
  '/dashboard/equipo': ['superadmin', 'admin', 'gerente', 'medico', 'viewer'],
  '/dashboard/medicos': ['superadmin', 'admin', 'gerente', 'medico'],
  '/dashboard/pacientes': ['superadmin', 'admin', 'gerente', 'medico'],
  '/dashboard/citas': ['superadmin', 'admin', 'gerente', 'medico'],
  '/dashboard/reportes': ['superadmin', 'admin', 'gerente'],
  '/dashboard/correos': ['superadmin', 'admin', 'gerente'],
  '/dashboard/configuracion': ['superadmin', 'admin'],
  '/dashboard/generador': ['superadmin', 'admin'],
}

export function puedeAcceder(rol: string | undefined, ruta: string): boolean {
  if (!rol) return false
  if (rol === 'superadmin') return true
  const permisos = NAV_PERMISOS[ruta]
  if (!permisos) return rol === 'admin'
  return permisos.includes(rol as Rol)
}

/** Can run motor / resolve alerts */
export function puedeOperar(rol: string | undefined): boolean {
  return rol === 'superadmin' || rol === 'admin' || rol === 'gerente'
}

export const ROL_LABELS: Record<string, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  gerente: 'Gerente',
  medico: 'Médico',
  viewer: 'Visualizador',
}

export const ROL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  superadmin: { bg: 'rgba(232,160,100,0.15)', text: '#E8A064', border: 'rgba(232,160,100,0.35)' },
  admin: { bg: 'rgba(0,201,167,0.15)', text: '#00C9A7', border: 'rgba(0,201,167,0.35)' },
  gerente: { bg: 'rgba(100,150,220,0.12)', text: '#6496DC', border: 'rgba(100,150,220,0.3)' },
  medico: { bg: 'rgba(100,196,160,0.12)', text: '#64C4A0', border: 'rgba(100,196,160,0.3)' },
  viewer: { bg: 'rgba(150,150,150,0.1)', text: '#999999', border: 'rgba(150,150,150,0.25)' },
}
