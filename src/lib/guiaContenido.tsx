/**
 * Contenido de la guía de uso de Vigía — recorrido literal, página por página,
 * explicando cada sección y cada botón: qué es, qué hace y cómo usarlo.
 * Se usa en el recorrido guiado (GuidedTour, primera vez) y en
 * Configuración → Documentación.
 *
 * gate:
 *   'admin' → solo admin/superadmin pueden usarlo (a otros: "exclusivo de admin").
 *   'plan'  → requiere plan Básico o superior (IA, integraciones, correo, reportes IA).
 *   'pro'   → requiere plan Profesional (Copiloto).
 */
export type Gate = 'admin' | 'plan' | 'pro'

export interface Elemento {
  nombre: string        // el botón / control / dato
  que: string           // qué es / qué hace
  como?: string         // cómo se usa
  gate?: Gate
}

export interface Seccion {
  nombre: string
  desc?: string
  elementos: Elemento[]
}

export interface Pagina {
  id: string
  titulo: string
  resumen: string
  comoLlegar: string    // cómo se navega hasta acá
  secciones: Seccion[]
  gate?: Gate           // si toda la página es exclusiva
}

export const GUIA: Pagina[] = [
  // ─────────────────────────────────────────────────────────────
  {
    id: 'navegacion', titulo: 'Cómo moverte por Vigía',
    resumen: 'Lo básico para orientarte: la barra lateral, el encabezado y los controles que están siempre a mano.',
    comoLlegar: 'Todo esto aparece en cualquier página, una vez que iniciás sesión.',
    secciones: [
      {
        nombre: 'Barra de navegación (arriba)',
        desc: 'Te lleva de una página a otra. Los enlaces cambian según tu rol.',
        elementos: [
          { nombre: 'Enlaces (Dashboard, Médicos, Pacientes, Citas, KPIs, HIS, Reportes, Config)', que: 'Cada uno abre una página del sistema.', como: 'Hacé clic en el nombre. El activo queda resaltado.' },
          { nombre: 'Selector de clínica', que: 'Solo el super admin lo ve. Cambia sobre qué clínica estás trabajando.', como: 'Elegí la clínica del desplegable; todo el panel se actualiza a esa clínica.', gate: 'admin' },
          { nombre: 'Tu perfil / cerrar sesión', que: 'Muestra tu nombre y rol; permite salir.', como: 'Clic en tu avatar → "Cerrar sesión".' },
        ],
      },
      {
        nombre: 'Controles de apariencia',
        elementos: [
          { nombre: 'Tema claro/oscuro', que: 'Cambia el aspecto de toda la app.', como: 'Botón de sol/luna (arriba a la derecha).' },
          { nombre: 'Idioma y tamaño de fuente', que: 'Español/Inglés y accesibilidad.', como: 'Se ajustan en Configuración → Apariencia.' },
        ],
      },
      {
        nombre: 'Copiloto (asistente IA)',
        elementos: [
          { nombre: 'Orbe flotante (abajo a la derecha)', que: 'Es el chatbot de Vigía: responde preguntas sobre tus datos.', como: 'Clic en el orbe para abrir el chat.', gate: 'pro' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'dashboard', titulo: 'Dashboard',
    resumen: 'Tu centro de mando: el estado de la clínica en tiempo real, con KPIs, gráfico y alertas.',
    comoLlegar: 'Es la primera página al entrar, o el enlace "Dashboard" en la navegación.',
    secciones: [
      {
        nombre: 'Tarjetas de KPIs (arriba)',
        desc: 'Los indicadores clave con su valor actual y tendencia.',
        elementos: [
          { nombre: 'Cada tarjeta (Ingresos, No-show, Cancelaciones, NPS, etc.)', que: 'Muestra el valor y si sube o baja.', como: 'Solo lectura. Para el detalle, entrá a la página KPIs.' },
        ],
      },
      {
        nombre: 'Alertas activas',
        desc: 'Cada anomalía que detecta el motor aparece acá, ordenada por severidad (crítica, alta, media, baja).',
        elementos: [
          { nombre: 'Tarjeta de alerta', que: 'Describe la anomalía (ej. "Ingresos ↓ 68%") con su severidad.', como: 'Leé el mensaje y la recomendación.' },
          { nombre: 'Marcar como revisada', que: 'Saca la alerta de las activas (queda en el historial).', como: 'Clic en el botón de la alerta. Con "Revisar todas" marcás todas de una.' },
        ],
      },
      {
        nombre: 'Ejecutar análisis',
        elementos: [
          { nombre: 'Botón "Ejecutar análisis"', que: 'Corre el motor de detección (Estadístico + PyOD + Prophet) sobre los datos actuales y crea alertas nuevas.', como: 'Clic y esperá; puede tardar hasta ~1-2 min. Las alertas nuevas aparecen y, si el plan lo permite, se envían por correo.', gate: 'admin' },
        ],
      },
      {
        nombre: 'HIS y médicos',
        elementos: [
          { nombre: 'Widget HIS', que: 'Acceso al espejo en vivo de tu sistema hospitalario conectado.', como: 'Clic para ir al HIS. Si no hay conexión, te lleva a conectarlo.' },
          { nombre: 'Lista de médicos', que: 'Los médicos con más actividad.', como: 'Clic en uno para ver su detalle.' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'kpis', titulo: 'KPIs (Análisis)',
    resumen: 'Análisis profundo de cada indicador, con gráficos, detección de anomalías y funciones de IA.',
    comoLlegar: 'Enlace "KPIs" en la navegación.',
    secciones: [
      {
        nombre: 'Controles del gráfico',
        elementos: [
          { nombre: 'Selector de KPI', que: 'Elegís qué indicador ver (ingresos, no-show, retención, etc.).', como: 'Clic en la tarjeta del KPI que querés analizar.' },
          { nombre: 'Días / Horas', que: 'Días = KPIs diarios del sistema; Horas = volumen de citas por hora.', como: 'Alterná con el toggle.' },
          { nombre: 'Rango (7d / 30d / 90d)', que: 'Cuánto histórico mostrar.', como: 'Clic en el rango deseado.' },
          { nombre: 'Sede', que: 'Filtra por una sede específica (si hay más de una).', como: 'Elegí del selector.' },
        ],
      },
      {
        nombre: 'Capas de detección (overlays)',
        desc: 'Resaltan los puntos raros que detecta cada método.',
        elementos: [
          { nombre: 'Prophet / PyOD / Umbral / Anomalías', que: 'Marcan en el gráfico dónde hubo una anomalía y el rango esperado.', como: 'Activá/desactivá cada capa. Pasá el mouse sobre un punto marcado para ver qué pasó.' },
          { nombre: 'Vistas Individual / Grid / Todas', que: 'Cambian cómo se muestran los KPIs.', como: 'Elegí la pestaña.' },
        ],
      },
      {
        nombre: 'Funciones de IA',
        desc: 'Análisis avanzado con Claude. Requieren plan Básico o superior.',
        elementos: [
          { nombre: 'Predicción de saturación', que: 'Proyecta la demanda de citas vs la capacidad por sede.', gate: 'plan' },
          { nombre: 'Análisis de tendencias', que: 'Claude lee el histórico y recomienda acciones (mejoras/riesgos/acciones).', como: 'Botón "Analizar con IA". Con "Limpiar" borrás el resultado guardado.', gate: 'plan' },
          { nombre: 'Resumen ejecutivo', que: 'Texto breve del estado del día.', como: 'Botón "Generar". Con "Enviar al correo" lo mandás a los destinatarios configurados.', gate: 'plan' },
          { nombre: 'Riesgo de no-show', que: 'Puntúa las próximas citas por probabilidad de ausencia.', gate: 'plan' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'medicos', titulo: 'Médicos',
    resumen: 'Todos los médicos con sus pacientes, citas, KPIs y alertas propias.',
    comoLlegar: 'Enlace "Médicos" en la navegación.',
    secciones: [
      {
        nombre: 'Lista de médicos',
        elementos: [
          { nombre: 'Buscar', que: 'Filtra por nombre o especialidad.', como: 'Escribí en el buscador.' },
          { nombre: 'Filtro por especialidad', que: 'Muestra solo una especialidad.', como: 'Clic en la especialidad.' },
          { nombre: 'Ordenar', que: 'Por nombre, especialidad o n.º de citas.', como: 'Selector "Ordenar" + botón asc/desc.' },
          { nombre: 'Ver estadísticas y citas', que: 'Abre el detalle del médico.', como: 'Clic en la tarjeta del médico.' },
        ],
      },
      {
        nombre: 'Detalle del médico',
        elementos: [
          { nombre: 'Pestañas Estadísticas / Citas / Alertas', que: 'Sus gráficos, su agenda y sus alertas.', como: 'Cambiá de pestaña.' },
          { nombre: 'Editar', que: 'Modifica los datos del médico.', como: 'Botón "Editar" (rol admin/gerente).', gate: 'admin' },
          { nombre: 'Editar mi perfil', que: 'Si sos personal médico, es TU consultorio: editás tu propio perfil.', como: 'Botón "Editar mi perfil".' },
          { nombre: 'Descargar reporte', que: 'CSV del médico.', como: 'Botón "Descargar reporte" (gerente/admin).', gate: 'admin' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'pacientes', titulo: 'Pacientes',
    resumen: 'Listado de pacientes con búsqueda, orden y paginación, y el detalle de cada uno.',
    comoLlegar: 'Enlace "Pacientes" en la navegación.',
    secciones: [
      {
        nombre: 'Listado',
        elementos: [
          { nombre: 'Buscar / Ordenar / Paginación', que: 'Encontrá pacientes por nombre, ordená por n.º de citas o fecha, y navegá por páginas.', como: 'Usá el buscador, el selector de orden y los botones de página.' },
          { nombre: 'Ver detalle (→)', que: 'Abre la ficha del paciente.', como: 'Clic en la flecha de la fila.' },
          { nombre: 'Editar / Eliminar', que: 'Modifica o da de baja al paciente.', como: 'Botones de la fila (rol admin/gerente).', gate: 'admin' },
        ],
      },
      {
        nombre: 'Detalle del paciente',
        elementos: [
          { nombre: 'Médico(s) asignado(s)', que: 'Derivados de sus citas; clic para ir al médico.', como: 'Clic en la tarjeta del médico.' },
          { nombre: 'Historial de citas + stats', que: 'Total, completadas, canceladas, ingresos.', como: 'Solo lectura.' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'citas', titulo: 'Citas',
    resumen: 'La agenda conectada paciente-médico-sede, con estados.',
    comoLlegar: 'Enlace "Citas" en la navegación.',
    secciones: [
      {
        nombre: 'Filtros y stats',
        elementos: [
          { nombre: 'Stats (completadas, agendadas, canceladas)', que: 'Resumen rápido del período.', como: 'Solo lectura.' },
          { nombre: 'Filtro por estado / médico + buscar', que: 'Acotá la lista.', como: 'Clic en el estado, elegí médico o escribí en el buscador.' },
        ],
      },
      {
        nombre: 'Cada cita',
        elementos: [
          { nombre: 'Editar estado', que: 'Cambia a completada, cancelada, no-show, etc.', como: 'Botón de editar. El personal médico solo puede cambiar el estado de SUS citas.' },
          { nombre: 'Nueva cita', que: 'Agenda una cita.', como: 'Botón de agregar (rol con permiso).', gate: 'admin' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'notificaciones', titulo: 'Notificaciones',
    resumen: 'El historial de todo lo que Vigía te avisó.',
    comoLlegar: 'Enlace "Notificaciones" en la navegación.',
    secciones: [
      {
        nombre: 'Lista',
        elementos: [
          { nombre: 'Notificación', que: 'Cada alerta genera una; si el plan incluye correo, también llega al email.', como: 'Leélas; se marcan como vistas.' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'his', titulo: 'HIS (Integración)',
    resumen: 'Espejo en vivo de tu sistema hospitalario conectado. Reemplaza la carga manual.',
    comoLlegar: 'Enlace "HIS" en la navegación.',
    secciones: [
      {
        nombre: 'Conexión',
        elementos: [
          { nombre: 'Conectar HIS', que: 'Vinculás tu HIS/ERP para traer médicos, pacientes, citas y KPIs.', como: 'En Configuración → Integraciones ponés la URL y la clave. La IA mapea las columnas automáticamente.', gate: 'plan' },
          { nombre: 'Sincronización automática', que: 'Vigía trae datos nuevos cada pocos minutos.', como: 'Automático una vez conectado.' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'reportes', titulo: 'Reportes',
    resumen: 'Exportá datos y análisis a CSV, o imprimí.',
    comoLlegar: 'Enlace "Reportes" en la navegación.',
    secciones: [
      {
        nombre: 'Exportaciones',
        elementos: [
          { nombre: 'Alertas CSV', que: 'Todas las alertas del período.', como: 'Botón "Alertas CSV".' },
          { nombre: 'Datos HIS + IA', que: 'KPIs con scores de detección (Estadístico/Prophet/PyOD).', como: 'Botón "Datos HIS + IA".', gate: 'plan' },
          { nombre: 'Rango y sede', que: 'Definen qué se exporta.', como: 'Elegí antes de exportar.' },
          { nombre: 'Imprimir', que: 'Versión imprimible del reporte.', como: 'Botón de imprimir.' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'copiloto', titulo: 'Copiloto (Chatbot IA)',
    resumen: 'El asistente de Vigía: responde en lenguaje natural sobre los datos de tu clínica.',
    comoLlegar: 'Orbe flotante abajo a la derecha, en cualquier página.',
    gate: 'pro',
    secciones: [
      {
        nombre: 'Uso',
        elementos: [
          { nombre: 'Abrir el orbe', que: 'Despliega el chat.', como: 'Clic en el orbe.' },
          { nombre: 'Preguntar', que: 'Ej. "¿Qué médico tiene más no-shows?", "¿Cómo van los ingresos hoy?".', como: 'Escribí y enviá; el orbe "piensa" y responde con tus datos reales.' },
          { nombre: 'Historial y búsqueda', que: 'Tus conversaciones quedan guardadas.', como: 'Panel de historial; buscá por texto.' },
          { nombre: 'Expandir / Exportar', que: 'Pantalla grande y descarga de la conversación.', como: 'Botones del encabezado del chat.' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'configuracion', titulo: 'Configuración',
    resumen: 'Todo lo administrativo: perfil, seguridad, apariencia, clínica, equipo, integraciones, facturación y documentación.',
    comoLlegar: 'Enlace "Config" en la navegación. Menú lateral con las secciones.',
    secciones: [
      {
        nombre: 'Cuenta',
        elementos: [
          { nombre: 'Perfil', que: 'Tu nombre, avatar y datos.', como: 'Editá y guardá.' },
          { nombre: 'Seguridad', que: 'Cambiar contraseña y cerrar sesiones en otros dispositivos.', como: 'Requiere tu contraseña actual.' },
          { nombre: 'Apariencia', que: 'Tema, idioma (ES/EN), tamaño de fuente, cursor, animaciones.', como: 'Cada opción se aplica al instante.' },
        ],
      },
      {
        nombre: 'Clínica (admin/gerente)',
        elementos: [
          { nombre: 'Datos y branding', que: 'Nombre, ciudad, logo, color de acento, sedes.', como: 'Editá (solo admin/superadmin).', gate: 'admin' },
          { nombre: 'Notificaciones', que: 'Correos destino y qué severidades notificar.', gate: 'admin' },
          { nombre: 'Automatización y Reglas de alertas', que: 'Motor automático y umbrales por KPI.', gate: 'admin' },
        ],
      },
      {
        nombre: 'Sistema',
        elementos: [
          { nombre: 'Integraciones', que: 'Conectar y sincronizar tu HIS/ERP.', gate: 'plan' },
          { nombre: 'Facturación', que: 'Elegí y activá tu plan (Gratis/Básico/Profesional). Compra simulada, sin cobro real.', como: 'Elegí el plan → completás el pago → se activa.', gate: 'admin' },
          { nombre: 'Equipo', que: 'Invitar usuarios y asignar roles.', gate: 'admin' },
        ],
      },
      {
        nombre: 'Ayuda',
        elementos: [
          { nombre: 'Documentación', que: 'Esta misma guía, siempre disponible.', como: 'Configuración → Documentación.' },
        ],
      },
    ],
  },
]

// ── English version ──────────────────────────────────────────────
export const GUIA_EN: Pagina[] = [
  {
    id: 'navegacion', titulo: 'Getting around Vigía',
    resumen: 'The basics to orient yourself: the top bar, the header and the controls that are always at hand.',
    comoLlegar: 'All of this appears on any page once you sign in.',
    secciones: [
      { nombre: 'Navigation bar (top)', desc: 'Takes you from one page to another. The links change based on your role.', elementos: [
        { nombre: 'Links (Dashboard, Doctors, Patients, Appointments, KPIs, HIS, Reports, Settings)', que: 'Each one opens a page of the system.', como: 'Click the name. The active one is highlighted.' },
        { nombre: 'Clinic selector', que: 'Only the super admin sees it. Switches which clinic you are working on.', como: 'Pick the clinic from the dropdown; the whole panel updates to that clinic.', gate: 'admin' },
        { nombre: 'Your profile / sign out', que: 'Shows your name and role; lets you leave.', como: 'Click your avatar → "Sign out".' },
      ] },
      { nombre: 'Appearance controls', elementos: [
        { nombre: 'Light/dark theme', que: 'Changes the look of the whole app.', como: 'Sun/moon button (top right).' },
        { nombre: 'Language and font size', que: 'Spanish/English and accessibility.', como: 'Set them in Settings → Appearance.' },
      ] },
      { nombre: 'Copilot (AI assistant)', elementos: [
        { nombre: 'Floating orb (bottom right)', que: "Vigía's chatbot: answers questions about your data.", como: 'Click the orb to open the chat.', gate: 'pro' },
      ] },
    ],
  },
  {
    id: 'dashboard', titulo: 'Dashboard',
    resumen: 'Your command center: the clinic status in real time, with KPIs, chart and alerts.',
    comoLlegar: 'It is the first page after signing in, or the "Dashboard" link in the navigation.',
    secciones: [
      { nombre: 'KPI cards (top)', desc: 'The key indicators with their current value and trend.', elementos: [
        { nombre: 'Each card (Revenue, No-show, Cancellations, NPS, etc.)', que: 'Shows the value and whether it goes up or down.', como: 'Read-only. For detail, open the KPIs page.' },
      ] },
      { nombre: 'Active alerts', desc: 'Every anomaly the engine detects appears here, sorted by severity (critical, high, medium, low).', elementos: [
        { nombre: 'Alert card', que: 'Describes the anomaly (e.g. "Revenue down 68%") with its severity.', como: 'Read the message and the recommendation.' },
        { nombre: 'Mark as reviewed', que: 'Removes the alert from the active ones (kept in history).', como: 'Click the alert button. "Review all" marks them all at once.' },
      ] },
      { nombre: 'Run analysis', elementos: [
        { nombre: '"Run analysis" button', que: 'Runs the detection engine (Statistical + PyOD + Prophet) on the current data and creates new alerts.', como: 'Click and wait; it can take ~1-2 min. New alerts appear and, if the plan allows, are emailed.', gate: 'admin' },
      ] },
      { nombre: 'HIS and doctors', elementos: [
        { nombre: 'HIS widget', que: 'Access to the live mirror of your connected hospital system.', como: 'Click to go to the HIS. If not connected, it takes you to connect it.' },
        { nombre: 'Doctor list', que: 'The most active doctors.', como: 'Click one to see its detail.' },
      ] },
    ],
  },
  {
    id: 'kpis', titulo: 'KPIs (Analysis)',
    resumen: 'Deep analysis of each indicator, with charts, anomaly detection and AI features.',
    comoLlegar: '"KPIs" link in the navigation.',
    secciones: [
      { nombre: 'Chart controls', elementos: [
        { nombre: 'KPI selector', que: 'Choose which indicator to view (revenue, no-show, retention, etc.).', como: 'Click the card of the KPI you want to analyze.' },
        { nombre: 'Days / Hours', que: 'Days = daily KPIs from the system; Hours = appointment volume per hour.', como: 'Toggle between them.' },
        { nombre: 'Range (7d / 30d / 90d)', que: 'How much history to show.', como: 'Click the desired range.' },
        { nombre: 'Location', que: 'Filters by a specific location (if there is more than one).', como: 'Pick from the selector.' },
      ] },
      { nombre: 'Detection layers (overlays)', desc: 'They highlight the odd points each method detects.', elementos: [
        { nombre: 'Prophet / PyOD / Threshold / Anomalies', que: 'Mark on the chart where an anomaly occurred and the expected range.', como: 'Turn each layer on/off. Hover a marked point to see what happened.' },
        { nombre: 'Individual / Grid / All views', que: 'Change how the KPIs are shown.', como: 'Pick the tab.' },
      ] },
      { nombre: 'AI features', desc: 'Advanced analysis with Claude. Requires Basic plan or higher.', elementos: [
        { nombre: 'Saturation forecast', que: 'Projects appointment demand vs capacity per location.', gate: 'plan' },
        { nombre: 'Trend analysis', que: 'Claude reads the history and recommends actions (improvements/risks/actions).', como: '"Analyze with AI" button. "Clear" removes the saved result.', gate: 'plan' },
        { nombre: 'Executive summary', que: "Short text of the day's status.", como: '"Generate" button. "Send to email" sends it to the configured recipients.', gate: 'plan' },
        { nombre: 'No-show risk', que: 'Scores upcoming appointments by probability of absence.', gate: 'plan' },
      ] },
    ],
  },
  {
    id: 'medicos', titulo: 'Doctors',
    resumen: 'All doctors with their patients, appointments, KPIs and their own alerts.',
    comoLlegar: '"Doctors" link in the navigation.',
    secciones: [
      { nombre: 'Doctor list', elementos: [
        { nombre: 'Search', que: 'Filters by name or specialty.', como: 'Type in the search box.' },
        { nombre: 'Specialty filter', que: 'Shows only one specialty.', como: 'Click the specialty.' },
        { nombre: 'Sort', que: 'By name, specialty or number of appointments.', como: '"Sort" selector + asc/desc button.' },
        { nombre: 'View stats and appointments', que: 'Opens the doctor detail.', como: 'Click the doctor card.' },
      ] },
      { nombre: 'Doctor detail', elementos: [
        { nombre: 'Stats / Appointments / Alerts tabs', que: 'Their charts, their schedule and their alerts.', como: 'Switch tabs.' },
        { nombre: 'Edit', que: "Modifies the doctor's data.", como: '"Edit" button (admin/manager role).', gate: 'admin' },
        { nombre: 'Edit my profile', que: 'If you are medical staff, this is YOUR practice: you edit your own profile.', como: '"Edit my profile" button.' },
        { nombre: 'Download report', que: 'Doctor CSV.', como: '"Download report" button (manager/admin).', gate: 'admin' },
      ] },
    ],
  },
  {
    id: 'pacientes', titulo: 'Patients',
    resumen: 'Patient list with search, sorting and pagination, and each patient detail.',
    comoLlegar: '"Patients" link in the navigation.',
    secciones: [
      { nombre: 'List', elementos: [
        { nombre: 'Search / Sort / Pagination', que: 'Find patients by name, sort by number of appointments or date, and browse pages.', como: 'Use the search box, the sort selector and the page buttons.' },
        { nombre: 'View detail (→)', que: 'Opens the patient record.', como: 'Click the arrow on the row.' },
        { nombre: 'Edit / Delete', que: 'Modifies or deactivates the patient.', como: 'Row buttons (admin/manager role).', gate: 'admin' },
      ] },
      { nombre: 'Patient detail', elementos: [
        { nombre: 'Assigned doctor(s)', que: 'Derived from their appointments; click to go to the doctor.', como: 'Click the doctor card.' },
        { nombre: 'Appointment history + stats', que: 'Total, completed, cancelled, revenue.', como: 'Read-only.' },
      ] },
    ],
  },
  {
    id: 'citas', titulo: 'Appointments',
    resumen: 'The schedule connecting patient-doctor-location, with statuses.',
    comoLlegar: '"Appointments" link in the navigation.',
    secciones: [
      { nombre: 'Filters and stats', elementos: [
        { nombre: 'Stats (completed, scheduled, cancelled)', que: 'Quick summary of the period.', como: 'Read-only.' },
        { nombre: 'Filter by status / doctor + search', que: 'Narrow down the list.', como: 'Click the status, pick a doctor or type in the search box.' },
      ] },
      { nombre: 'Each appointment', elementos: [
        { nombre: 'Edit status', que: 'Change to completed, cancelled, no-show, etc.', como: 'Edit button. Medical staff can only change the status of THEIR appointments.' },
        { nombre: 'New appointment', que: 'Schedules an appointment.', como: 'Add button (role with permission).', gate: 'admin' },
      ] },
    ],
  },
  {
    id: 'notificaciones', titulo: 'Notifications',
    resumen: 'The history of everything Vigía has alerted you about.',
    comoLlegar: '"Notifications" link in the navigation.',
    secciones: [
      { nombre: 'List', elementos: [
        { nombre: 'Notification', que: 'Each alert creates one; if the plan includes email, it also arrives by email.', como: 'Read them; they are marked as seen.' },
      ] },
    ],
  },
  {
    id: 'his', titulo: 'HIS (Integration)',
    resumen: 'Live mirror of your connected hospital system. Replaces manual data entry.',
    comoLlegar: '"HIS" link in the navigation.',
    secciones: [
      { nombre: 'Connection', elementos: [
        { nombre: 'Connect HIS', que: 'Link your HIS/ERP to bring doctors, patients, appointments and KPIs.', como: 'In Settings → Integrations you enter the URL and key. The AI maps the columns automatically.', gate: 'plan' },
        { nombre: 'Automatic sync', que: 'Vigía brings new data every few minutes.', como: 'Automatic once connected.' },
      ] },
    ],
  },
  {
    id: 'reportes', titulo: 'Reports',
    resumen: 'Export data and analysis to CSV, or print.',
    comoLlegar: '"Reports" link in the navigation.',
    secciones: [
      { nombre: 'Exports', elementos: [
        { nombre: 'Alerts CSV', que: 'All alerts of the period.', como: '"Alerts CSV" button.' },
        { nombre: 'HIS + AI Data', que: 'KPIs with detection scores (Statistical/Prophet/PyOD).', como: '"HIS + AI Data" button.', gate: 'plan' },
        { nombre: 'Range and location', que: 'Define what gets exported.', como: 'Choose before exporting.' },
        { nombre: 'Print', que: 'Printable version of the report.', como: 'Print button.' },
      ] },
    ],
  },
  {
    id: 'copiloto', titulo: 'Copilot (AI Chatbot)',
    resumen: "Vigía's assistant: answers in natural language about your clinic's data.",
    comoLlegar: 'Floating orb at the bottom right, on any page.', gate: 'pro',
    secciones: [
      { nombre: 'Usage', elementos: [
        { nombre: 'Open the orb', que: 'Opens the chat.', como: 'Click the orb.' },
        { nombre: 'Ask', que: 'E.g. "Which doctor has the most no-shows?", "How is revenue today?".', como: 'Type and send; the orb "thinks" and answers with your real data.' },
        { nombre: 'History and search', que: 'Your conversations are saved.', como: 'History panel; search by text.' },
        { nombre: 'Expand / Export', que: 'Full screen and conversation download.', como: 'Buttons in the chat header.' },
      ] },
    ],
  },
  {
    id: 'configuracion', titulo: 'Settings',
    resumen: 'Everything administrative: profile, security, appearance, clinic, team, integrations, billing and documentation.',
    comoLlegar: '"Settings" link in the navigation. Side menu with the sections.',
    secciones: [
      { nombre: 'Account', elementos: [
        { nombre: 'Profile', que: 'Your name, avatar and data.', como: 'Edit and save.' },
        { nombre: 'Security', que: 'Change password and sign out on other devices.', como: 'Requires your current password.' },
        { nombre: 'Appearance', que: 'Theme, language (ES/EN), font size, cursor, animations.', como: 'Each option applies instantly.' },
      ] },
      { nombre: 'Clinic (admin/manager)', elementos: [
        { nombre: 'Data and branding', que: 'Name, city, logo, accent color, locations.', como: 'Edit (admin/superadmin only).', gate: 'admin' },
        { nombre: 'Notifications', que: 'Destination emails and which severities to notify.', gate: 'admin' },
        { nombre: 'Automation and Alert rules', que: 'Automatic engine and thresholds per KPI.', gate: 'admin' },
      ] },
      { nombre: 'System', elementos: [
        { nombre: 'Integrations', que: 'Connect and sync your HIS/ERP.', gate: 'plan' },
        { nombre: 'Billing', que: 'Choose and activate your plan (Free/Basic/Professional). Simulated purchase, no real charge.', como: 'Pick the plan → complete payment → it activates.', gate: 'admin' },
        { nombre: 'Team', que: 'Invite users and assign roles.', gate: 'admin' },
      ] },
      { nombre: 'Help', elementos: [
        { nombre: 'Documentation', que: 'This same guide, always available.', como: 'Settings → Documentation.' },
      ] },
    ],
  },
]

/** Devuelve la guía en el idioma actual. */
export function getGuia(idioma: string): Pagina[] {
  return idioma === 'en' ? GUIA_EN : GUIA
}
