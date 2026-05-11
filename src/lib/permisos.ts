export type Rol = 'superadmin' | 'admin' | 'gerente' | 'medico' | 'user' | 'viewer'

/**
 * Route access matrix.
 *
 * viewer   → no access (pending approval)
 * user     → dashboard, kpis, alertas, notificaciones, medicos, reportes (read), equipo (own), configuracion (limited)
 * medico   → + pacientes, citas
 * gerente  → + correos, manages own sede
 * admin    → all clinic-level pages incl. generador
 * superadmin → everything across clinics
 */
export const NAV_PERMISOS: Record<string, Rol[]> = {
  '/dashboard':                ['superadmin', 'admin', 'gerente', 'medico', 'user'],
  '/dashboard/kpis':           ['superadmin', 'admin', 'gerente', 'medico', 'user'],
  '/dashboard/notificaciones': ['superadmin', 'admin', 'gerente', 'medico', 'user'],
  '/dashboard/equipo':         ['superadmin', 'admin', 'gerente', 'medico', 'user'],
  '/dashboard/medicos':        ['superadmin', 'admin', 'gerente', 'medico', 'user'],
  '/dashboard/reportes':       ['superadmin', 'admin', 'gerente', 'medico', 'user'],
  '/dashboard/pacientes':      ['superadmin', 'admin', 'gerente', 'medico'],
  '/dashboard/citas':          ['superadmin', 'admin', 'gerente', 'medico'],
  '/dashboard/correos':        ['superadmin', 'admin', 'gerente'],
  '/dashboard/configuracion':  ['superadmin', 'admin', 'gerente', 'medico', 'user'],
  '/dashboard/generador':      ['superadmin', 'admin'],
}

export function puedeAcceder(rol: string | undefined, ruta: string, aprobado: boolean = true): boolean {
  if (!rol) return false
  if (rol === 'superadmin') return true
  if (!aprobado) return false // viewer / unapproved → no access
  const permisos = NAV_PERMISOS[ruta]
  if (!permisos) return rol === 'admin'
  return permisos.includes(rol as Rol)
}

/** Can run motor / write actions / resolve alerts */
export function puedeOperar(rol: string | undefined): boolean {
  return rol === 'superadmin' || rol === 'admin' || rol === 'gerente'
}

/** Can write/edit/delete a given resource */
export function puedeEditar(rol: string | undefined, recurso: string): boolean {
  if (!rol) return false
  if (rol === 'superadmin') return true
  const r = rol as Rol
  const matrix: Record<string, Rol[]> = {
    medicos:        ['admin', 'gerente'],
    pacientes:      ['admin', 'gerente'],
    citas:          ['admin', 'gerente', 'medico'],
    notificaciones: ['admin', 'gerente'],
    kpis:           ['admin', 'gerente'],
    reportes:       ['admin', 'gerente', 'medico'],
    equipo:         ['admin'],
    correos:        ['admin', 'gerente'],
    clinica:        ['admin'],
    sede:           ['admin'],
    generador:      ['admin'],
    configuracion:  ['admin', 'gerente'],
  }
  const list = matrix[recurso]
  return !!list && list.includes(r)
}

export const ROL_LABELS: Record<string, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  gerente: 'Gerente',
  medico: 'Personal Médico',
  user: 'Usuario',
  viewer: 'Visualizador',
}

export const ROL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  superadmin: { bg: 'rgba(232,160,100,0.15)', text: '#E8A064', border: 'rgba(232,160,100,0.35)' },
  admin: { bg: 'rgba(0,201,167,0.15)', text: '#00C9A7', border: 'rgba(0,201,167,0.35)' },
  gerente: { bg: 'rgba(100,150,220,0.12)', text: '#6496DC', border: 'rgba(100,150,220,0.3)' },
  medico: { bg: 'rgba(100,196,160,0.12)', text: '#64C4A0', border: 'rgba(100,196,160,0.3)' },
  user: { bg: 'rgba(180,180,200,0.10)', text: '#B0B0C8', border: 'rgba(180,180,200,0.25)' },
  viewer: { bg: 'rgba(150,150,150,0.1)', text: '#999999', border: 'rgba(150,150,150,0.25)' },
}
