/**
 * Pasos del recorrido guiado tipo "spotlight": cada paso apunta a un elemento
 * REAL de la página (por data-tour). El motor lo resalta, muestra flecha + cuadro
 * y navega entre páginas. Cubre todas las páginas y sus secciones.
 */
export interface TourStep {
  ruta: string
  sel: string
  titulo: string
  texto: string
  gate?: 'admin' | 'plan' | 'pro'
}

export const TOUR_STEPS: TourStep[] = [
  // ── Navegación general ──
  { ruta: '/dashboard', sel: 'nav', titulo: 'Barra de navegación', texto: 'Desde aquí entrás a cada página de Vigía. El enlace activo queda resaltado. Los enlaces cambian según tu rol.' },

  // ── Dashboard ──
  { ruta: '/dashboard', sel: 'kpis-cards', titulo: 'Indicadores (KPIs)', texto: 'El estado de tu clínica en números: ingresos, no-shows, cancelaciones, NPS y su tendencia.' },
  { ruta: '/dashboard', sel: 'ejecutar-analisis', titulo: 'Ejecutar análisis', texto: 'Corre el motor de IA (Estadístico + PyOD + Prophet) y detecta anomalías al instante. Crea alertas nuevas.', gate: 'admin' },
  { ruta: '/dashboard', sel: 'alertas', titulo: 'Alertas', texto: 'Cada anomalía detectada aparece aquí por severidad. Podés marcarlas como revisadas o ver el historial.' },
  { ruta: '/dashboard', sel: 'dashboard-medicos', titulo: 'Médicos', texto: 'Los médicos con más actividad. Clic en uno para ver su detalle.' },
  { ruta: '/dashboard', sel: 'his-widget', titulo: 'HIS conectado', texto: 'Acceso al espejo en vivo de tu sistema hospitalario. Si no hay conexión, te lleva a conectarlo.' },
  { ruta: '/dashboard', sel: 'copiloto', titulo: 'Copiloto IA', texto: 'El asistente que responde preguntas sobre tus datos. Clic para chatear.', gate: 'pro' },

  // ── KPIs ──
  { ruta: '/dashboard', sel: 'nav-kpis', titulo: 'Ir a KPIs', texto: 'Entrá a KPIs para el análisis profundo de cada indicador.' },
  { ruta: '/dashboard/kpis', sel: 'kpi-controls', titulo: 'Controles', texto: 'Elegí sede, Días u Horas, y el rango (7/30/90 días). El gráfico se ajusta.' },
  { ruta: '/dashboard/kpis', sel: 'kpi-selector', titulo: 'Elegí el KPI', texto: 'Seleccioná qué indicador analizar. El gráfico marca las anomalías que detecta la IA.' },
  { ruta: '/dashboard/kpis', sel: 'ia-insights', titulo: 'Funciones de IA', texto: 'Predicción de saturación, análisis de tendencias, resumen ejecutivo y riesgo de no-show.', gate: 'plan' },

  // ── Médicos ──
  { ruta: '/dashboard/kpis', sel: 'nav-medicos', titulo: 'Ir a Médicos', texto: 'Cada médico con sus pacientes, citas y alertas.' },
  { ruta: '/dashboard/medicos', sel: 'medicos-lista', titulo: 'Médicos', texto: 'Buscá, filtrá por especialidad y ordená. Clic en un médico abre su detalle (estadísticas, citas, alertas). El personal médico ve "Mi Consultorio".' },

  // ── Pacientes ──
  { ruta: '/dashboard/medicos', sel: 'nav-pacientes', titulo: 'Ir a Pacientes', texto: 'El listado de pacientes de la clínica.' },
  { ruta: '/dashboard/pacientes', sel: 'pacientes-toolbar', titulo: 'Buscar pacientes', texto: 'Buscá por nombre, apellido o email. Ordená y navegá por páginas.' },
  { ruta: '/dashboard/pacientes', sel: 'pacientes-lista', titulo: 'Ficha del paciente', texto: 'Clic en la flecha de una fila abre su detalle: médico(s) asignado(s), datos e historial de citas. Con el rol adecuado podés editar o dar de baja.' },

  // ── Citas ──
  { ruta: '/dashboard/pacientes', sel: 'nav-citas', titulo: 'Ir a Citas', texto: 'La agenda conectada paciente-médico-sede.' },
  { ruta: '/dashboard/citas', sel: 'citas-stats', titulo: 'Resumen de citas', texto: 'Completadas, agendadas y canceladas del período.' },
  { ruta: '/dashboard/citas', sel: 'citas-lista', titulo: 'Citas y estados', texto: 'Filtrá por estado o médico. Editá el estado de una cita (el personal médico solo las suyas).' },

  // ── Notificaciones ──
  { ruta: '/dashboard/citas', sel: 'nav-notificaciones', titulo: 'Ir a Notificaciones', texto: 'El historial de todo lo que Vigía te avisó.' },
  { ruta: '/dashboard/notificaciones', sel: 'notif-lista', titulo: 'Notificaciones', texto: 'Cada alerta genera una notificación; si el plan incluye correo, también llega al email.' },

  // ── HIS ──
  { ruta: '/dashboard/notificaciones', sel: 'nav-generador', titulo: 'Ir a HIS', texto: 'El espejo en vivo de tu sistema hospitalario conectado.' },
  { ruta: '/dashboard/generador', sel: 'his-mirror', titulo: 'HIS en vivo', texto: 'Los datos reales que trae Vigía de tu HIS/ERP: médicos, pacientes, citas y KPIs, sincronizados automáticamente.' },

  // ── Reportes ──
  { ruta: '/dashboard/generador', sel: 'nav-reportes', titulo: 'Ir a Reportes', texto: 'Exportá datos y análisis a CSV.' },
  { ruta: '/dashboard/reportes', sel: 'reportes-acciones', titulo: 'Exportaciones', texto: 'Alertas CSV, Datos HIS + IA (con scores de detección) e impresión. Elegí rango y sede antes.', },

  // ── Configuración ──
  { ruta: '/dashboard/reportes', sel: 'nav-configuracion', titulo: 'Ir a Configuración', texto: 'Perfil, equipo, integraciones, facturación y documentación.' },
  { ruta: '/dashboard/configuracion', sel: 'config-menu', titulo: 'Secciones de Configuración', texto: 'Cuenta (perfil, seguridad, apariencia), Clínica, Sistema (integraciones, facturación, equipo) y Ayuda (documentación). Cada una se abre desde este menú.' },
]
