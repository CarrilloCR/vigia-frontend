'use client'
import { usePrefsStore, type Idioma } from '../store/prefs'

/**
 * i18n de Vigía — modelo "clave = texto en español".
 * Uso: const t = useT(); t('Guardar')  → 'Guardar' (es) / 'Save' (en)
 * Solo hay que llenar EN[] con las traducciones; si falta, cae al español.
 */

// Traducciones español → inglés. Agrega entradas aquí; la clave es el texto ES exacto.
const EN: Record<string, string> = {
  // Navegación
  'Alertas': 'Alerts', 'KPIs': 'KPIs', 'Médicos': 'Doctors', 'Pacientes': 'Patients',
  'Citas': 'Appointments', 'Notificaciones': 'Notifications', 'Generador': 'Generator',
  'Reportes': 'Reports', 'Config': 'Settings', 'Equipo': 'Team',
  // Cuenta / header
  'Cerrar sesión': 'Sign out', 'Tema': 'Theme', 'Perfil': 'Profile', 'Seguridad': 'Security',
  'Clínica': 'Clinic', 'Automatización': 'Automation', 'Apariencia': 'Appearance',
  'Integraciones': 'Integrations', 'Facturación': 'Billing', 'Super Admin': 'Super Admin',
  'Reglas de Alertas': 'Alert Rules',
  // Botones / comunes
  'Guardar': 'Save', 'Cancelar': 'Cancel', 'Eliminar': 'Delete', 'Editar': 'Edit',
  'Aceptar': 'Accept', 'Continuar': 'Continue', 'Aprobar': 'Approve', 'Rechazar': 'Reject',
  'Conectar': 'Connect', 'Desconectar': 'Disconnect', 'Sincronizar ahora': 'Sync now',
  'Cargando…': 'Loading…', 'Idioma': 'Language', 'Descargar reporte': 'Download report',
  'Volver': 'Back', 'Buscar': 'Search', 'Cerrar': 'Close', 'Enviar': 'Send',
  // Login
  'Iniciar sesión': 'Sign in', 'Registrarse': 'Sign up', 'Correo electrónico': 'Email',
  'Contraseña': 'Password', 'Confirmar contraseña': 'Confirm password', 'Nombre completo': 'Full name',
  // Dashboard
  'Datos en Vivo': 'Live Data', 'Ejecutar análisis': 'Run analysis',
  'Alertas activas': 'Active alerts', 'Sin alertas': 'No alerts',
}

const DICTS: Record<Idioma, Record<string, string>> = { es: {}, en: EN }

export const IDIOMAS: { id: Idioma; label: string; flag: string }[] = [
  { id: 'es', label: 'Español', flag: '🇪🇸' },
  { id: 'en', label: 'English', flag: '🇺🇸' },
]

/** Traduce un texto en español al idioma dado (cae al español si falta). */
export function translate(idioma: Idioma, texto: string): string {
  if (idioma === 'es') return texto
  return DICTS[idioma]?.[texto] ?? texto
}

/** Hook: devuelve la función de traducción según el idioma actual. */
export function useT() {
  const idioma = usePrefsStore(s => s.idioma)
  return (texto: string) => translate(idioma, texto)
}
