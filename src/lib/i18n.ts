'use client'
import { usePrefsStore, type Idioma } from '../store/prefs'

/**
 * i18n de Vigía — modelo "clave = texto en español".
 * Uso: const t = useT(); t('Guardar')  → 'Guardar' (es) / 'Save' (en)
 * Solo hay que llenar EN[] con las traducciones; si falta, cae al español.
 */

// Traducciones español → inglés. Agrega entradas aquí; la clave es el texto ES exacto.
export const EN: Record<string, string> = {
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
  'Analizando...': 'Analyzing...', 'Análisis completado': 'Analysis complete',
  'Historial': 'History', 'Revisar todas': 'Review all', 'Marcar como revisada': 'Mark as reviewed',
  'Ver todos': 'View all', 'Ver más': 'View more', 'HIS': 'HIS', 'Verificando…': 'Checking…',
  'Sin fuente real — conectar HIS': 'No real source — connect HIS', 'registros (1h)': 'records (1h)',

  // Roles / estados
  'Administrador': 'Administrator', 'Gerente': 'Manager', 'Personal Médico': 'Medical staff',
  'Usuario': 'User', 'Pendiente': 'Pending', 'Aprobado': 'Approved', 'Activo': 'Active', 'Inactivo': 'Inactive',
  'activa': 'active', 'revisada': 'reviewed', 'resuelta': 'resolved',
  'crítica': 'critical', 'alta': 'high', 'media': 'medium', 'baja': 'low',
  'completada': 'completed', 'cancelada': 'cancelled', 'agendada': 'scheduled',
  'no_show': 'no-show', 'reagendada': 'rescheduled',
  'Crítica': 'Critical', 'Alta': 'High', 'Media': 'Medium', 'Baja': 'Low',
  'Completadas': 'Completed', 'Canceladas': 'Cancelled', 'Agendadas': 'Scheduled',

  // Comunes / acciones
  'Agregar': 'Add', 'Crear': 'Create', 'Actualizar': 'Update', 'Aplicar': 'Apply',
  'Confirmar': 'Confirm', 'Entendido': 'Got it', 'Siguiente': 'Next', 'Atrás': 'Back',
  'Finalizar': 'Finish', 'Saltar': 'Skip', 'Saltar guía': 'Skip guide', 'Limpiar': 'Clear',
  'Guardando…': 'Saving…', 'Enviando…': 'Sending…', 'Generar': 'Generate', 'Generando…': 'Generating…',
  'Descargar': 'Download', 'Imprimir': 'Print', 'Exportar': 'Export', 'Ver planes': 'View plans',
  'Comprar suscripción': 'Buy subscription', 'Comprar': 'Buy', 'Suscribirse': 'Subscribe',
  'Total': 'Total', 'Todos': 'All', 'Todas': 'All', 'Sin datos': 'No data',
  'Sin resultados': 'No results', 'Cargando': 'Loading', 'Nombre': 'Name', 'Apellido': 'Last name',
  'Email': 'Email', 'Teléfono': 'Phone', 'Especialidad': 'Specialty', 'Sede': 'Location', 'Sedes': 'Locations',
  'Estado': 'Status', 'Fecha': 'Date', 'Acciones': 'Actions', 'Rol': 'Role', 'Plan': 'Plan',
  'Ordenar': 'Sort', 'Ascendente': 'Ascending', 'Descendente': 'Descending', 'de': 'of',

  // Páginas: títulos y descripciones
  'Análisis de KPIs': 'KPI Analysis', 'Actualización automática cada 30s': 'Auto-refresh every 30s',
  'Días': 'Days', 'Horas': 'Hours', 'Individual': 'Individual', 'Grid': 'Grid',
  'Lista de pacientes': 'Patient list', 'Historial de citas': 'Appointment history',
  'Ver estadísticas y citas': 'View stats and appointments', 'Editar mi perfil': 'Edit my profile',
  'Mi Consultorio': 'My Practice',
  'Volumen de citas por hora': 'Appointment volume by hour',
  'Predicción de saturación': 'Saturation forecast', 'Análisis de tendencias (IA)': 'Trend analysis (AI)',
  'Resumen ejecutivo (IA)': 'Executive summary (AI)', 'Riesgo de no-show': 'No-show risk',
  'Analizar con IA': 'Analyze with AI', 'Enviar al correo': 'Send to email',
  'Funciones de IA': 'AI features', 'Plan Básico o superior': 'Basic plan or higher',
  'riesgo': 'risk', 'alto': 'high', 'medio': 'medium', 'bajo': 'low',

  // Reportes
  'Alertas CSV': 'Alerts CSV', 'Datos HIS + IA': 'HIS + AI Data', 'Calculando...': 'Calculating...',

  // Notificaciones / correo
  'Sin notificaciones': 'No notifications', 'Marcar todas como leídas': 'Mark all as read',

  // Facturación / planes
  'Gratis': 'Free', 'Básico': 'Basic', 'Profesional': 'Professional', 'Enterprise': 'Enterprise',
  'Plan actual': 'Current plan', 'Cambiar método de pago': 'Change payment method',
  'Elige el plan perfecto para tu clínica. Cancela cuando quieras.': 'Choose the perfect plan for your clinic. Cancel anytime.',
  'Número de tarjeta': 'Card number', 'Nombre del titular': 'Cardholder name',
  'Vencimiento': 'Expiry', 'sin cobro real': 'no real charge', 'simulación': 'simulation',

  // Login / registro
  'Bienvenido de vuelta': 'Welcome back', 'Ingresa tus credenciales para continuar': 'Enter your credentials to continue',
  'Crear cuenta': 'Create account', 'Ingresar al sistema': 'Sign in',
  '¿No tienes cuenta?': "Don't have an account?", 'Regístrate gratis': 'Sign up free',
  'Inteligencia clínica en tiempo real': 'Real-time clinical intelligence',
  'KPIs vigilados': 'KPIs monitored', 'Monitoreo activo': 'Active monitoring',
  'Detección de anomalías': 'Anomaly detection', 'Análisis con Claude': 'Analysis with Claude',
  'Cómo funciona Vigía': 'How Vigía works', 'Recorrido': 'Tour',

  // Configuración
  'Cuenta': 'Account', 'Sistema': 'System', 'Global': 'Global', 'Ayuda': 'Help',
  'Documentación': 'Documentation', 'Preferencias de interfaz': 'Interface preferences',
  'Animaciones': 'Animations', 'Vista compacta': 'Compact view', 'Auto-refresh': 'Auto-refresh',
  'Cursor personalizado': 'Custom cursor', 'Tamaño de fuente': 'Font size',
  'Iniciar recorrido guiado': 'Start guided tour',
  'Guía de uso': 'User guide', 'Cómo llegar': 'How to get there', 'Cómo': 'How',

  // ToS / gate
  'Términos de Servicio': 'Terms of Service', 'Antes de continuar': 'Before you continue',
  'Acepto los términos': 'I accept the terms', 'No acepto · salir': "I don't accept · exit",
  'Continuar en Gratis': 'Continue on Free',

  // Integraciones / HIS
  'Sistema HIS/ERP externo': 'External HIS/ERP system', 'HIS conectado': 'HIS connected',
  'Conectar HIS': 'Connect HIS', 'Probar conexión': 'Test connection', 'Sincronizar': 'Sync',
  'Nombre del sistema': 'System name', 'URL': 'URL', 'Clave de acceso': 'Access key',

  // Estados vacíos comunes
  'Sin médicos': 'No doctors', 'Sin pacientes': 'No patients', 'Sin citas': 'No appointments',
  'No hay resultados para tu búsqueda': 'No results for your search',
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
