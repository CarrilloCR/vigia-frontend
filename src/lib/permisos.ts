export type Rol = 'admin' | 'gerente' | 'medico' | 'viewer'

/**
 * Rutas accesibles por rol.
 * viewer   → alertas, kpis, notificaciones, equipo
 * medico   → + médicos, pacientes, citas
 * gerente  → + reportes, correos
 * admin    → todo
 */
export const NAV_PERMISOS: Record<string, Rol[]> = {
  '/dashboard': ['admin', 'gerente', 'medico', 'viewer'],
  '/dashboard/kpis': ['admin', 'gerente', 'medico', 'viewer'],
  '/dashboard/notificaciones': ['admin', 'gerente', 'medico', 'viewer'],
  '/dashboard/equipo': ['admin', 'gerente', 'medico', 'viewer'],
  '/dashboard/medicos': ['admin', 'gerente', 'medico'],
  '/dashboard/pacientes': ['admin', 'gerente', 'medico'],
  '/dashboard/citas': ['admin', 'gerente', 'medico'],
  '/dashboard/reportes': ['admin', 'gerente'],
  '/dashboard/correos': ['admin', 'gerente'],
  '/dashboard/configuracion': ['admin'],
  '/dashboard/generador': ['admin'],
}

export function puedeAcceder(rol: string | undefined, ruta: string): boolean {
  if (!rol) return false
  const permisos = NAV_PERMISOS[ruta]
  if (!permisos) return rol === 'admin'
  return permisos.includes(rol as Rol)
}

/** Can run motor / resolve alerts */
export function puedeOperar(rol: string | undefined): boolean {
  return rol === 'admin' || rol === 'gerente'
}

export const ROL_LABELS: Record<string, string> = {
  admin: 'Admin',
  gerente: 'Gerente',
  medico: 'Médico',
  viewer: 'Visualizador',
}

export const ROL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  admin: { bg: 'rgba(155,142,196,0.15)', text: '#9B8EC4', border: 'rgba(155,142,196,0.35)' },
  gerente: { bg: 'rgba(100,150,220,0.12)', text: '#6496DC', border: 'rgba(100,150,220,0.3)' },
  medico: { bg: 'rgba(100,196,160,0.12)', text: '#64C4A0', border: 'rgba(100,196,160,0.3)' },
  viewer: { bg: 'rgba(150,150,150,0.1)', text: '#999999', border: 'rgba(150,150,150,0.25)' },
}
