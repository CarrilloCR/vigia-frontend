/**
 * Role-based permission helpers for Vigía.
 *
 * Roles (server-side enum):
 *   - superadmin: control all clinics
 *   - admin:      control own clinic
 *   - gerente:    control own sede
 *   - medico:     personal médico (read-only access scoped to sede)
 *   - user:       usuario convencional (read-only on medicos/notificaciones/kpis)
 *   - viewer:     pending approval, no access
 *
 * Backend enforces these — frontend uses them to hide/gate UI.
 */

export type Rol = 'superadmin' | 'admin' | 'gerente' | 'medico' | 'user' | 'viewer'

export const ROLES: readonly Rol[] = ['superadmin', 'admin', 'gerente', 'medico', 'user', 'viewer']

export const ROL_LABEL: Record<Rol, string> = {
  superadmin: 'Super Administrador',
  admin: 'Administrador',
  gerente: 'Gerente',
  medico: 'Personal Médico',
  user: 'Usuario',
  viewer: 'Visualizador',
}

export interface UserShape {
  rol?: string
  aprobado?: boolean
  sede_id?: number | null
}

function rol(u: UserShape | null | undefined): Rol | null {
  if (!u || !u.rol) return null
  return (u.rol as Rol)
}

export function isApproved(u: UserShape | null | undefined): boolean {
  if (!u) return false
  if (u.rol === 'superadmin') return true
  return !!u.aprobado
}

/* ── Per-section access matrix ───────────────────────────────────────── */

const MATRIX: Record<string, Rol[]> = {
  // Dashboard sections
  dashboard:       ['superadmin', 'admin', 'gerente', 'medico', 'user'],
  alertas:         ['superadmin', 'admin', 'gerente', 'medico', 'user'],
  notificaciones:  ['superadmin', 'admin', 'gerente', 'medico', 'user'],
  medicos:         ['superadmin', 'admin', 'gerente', 'medico', 'user'],
  kpis:            ['superadmin', 'admin', 'gerente', 'medico', 'user'],
  reportes:        ['superadmin', 'admin', 'gerente', 'medico', 'user'],
  pacientes:       ['superadmin', 'admin', 'gerente', 'medico'],
  citas:           ['superadmin', 'admin', 'gerente', 'medico'],
  generador:       ['superadmin', 'admin'],
  equipo:          ['superadmin', 'admin', 'gerente'],
  correos:         ['superadmin', 'admin', 'gerente'],
  configuracion:   ['superadmin', 'admin', 'gerente', 'medico', 'user'], // limited inside
}

const WRITE_MATRIX: Record<string, Rol[]> = {
  medicos:        ['superadmin', 'admin', 'gerente'],
  pacientes:      ['superadmin', 'admin', 'gerente'],
  citas:          ['superadmin', 'admin', 'gerente'],
  notificaciones: ['superadmin', 'admin', 'gerente'],
  kpis:           ['superadmin', 'admin', 'gerente'],
  reportes:       ['superadmin', 'admin', 'gerente', 'medico'],
  equipo:         ['superadmin', 'admin'],
  correos:        ['superadmin', 'admin', 'gerente'],
  clinica:        ['superadmin', 'admin'],
  sede:           ['superadmin', 'admin'],
  generador:      ['superadmin', 'admin'],
  configuracion:  ['superadmin', 'admin', 'gerente'],
}

export function canAccess(u: UserShape | null | undefined, section: string): boolean {
  if (!isApproved(u)) return false
  const r = rol(u)
  if (!r) return false
  const allowed = MATRIX[section]
  if (!allowed) return true
  return allowed.includes(r)
}

export function canWrite(u: UserShape | null | undefined, section: string): boolean {
  if (!isApproved(u)) return false
  const r = rol(u)
  if (!r) return false
  const allowed = WRITE_MATRIX[section]
  if (!allowed) return false
  return allowed.includes(r)
}

export function isSuperadmin(u: UserShape | null | undefined): boolean {
  return rol(u) === 'superadmin'
}

export function isAdmin(u: UserShape | null | undefined): boolean {
  const r = rol(u)
  return r === 'superadmin' || r === 'admin'
}

export function isGerenteOrAbove(u: UserShape | null | undefined): boolean {
  const r = rol(u)
  return r === 'superadmin' || r === 'admin' || r === 'gerente'
}
