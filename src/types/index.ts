export interface Clinica {
  id: number
  nombre: string
  email: string
  plan: string
  activa: boolean
  creada_en: string
  motor_automatico: boolean
  motor_intervalo_horas: 1 | 6 | 12 | 24
  ultimo_motor_en: string | null
  claude_activo: boolean
  generador_activo: boolean
}

export interface Sede {
  id: number
  clinica: number
  nombre: string
  direccion: string
  telefono: string
  activa: boolean
}

export interface Usuario {
  id: number
  clinica: number
  sede: number | null
  nombre: string
  email: string
  rol: string
  ultimo_acceso: string | null
}

export interface Medico {
  id: number
  clinica: number
  sede: number | null
  sede_nombre: string | null
  usuario: number | null
  nombre: string
  apellido: string
  especialidad: string
  email: string
  telefono: string
  descripcion: string
  foto_url: string
  fecha_ingreso: string | null
  activo: boolean
}

export interface Paciente {
  id: number
  clinica: number
  sede: number | null
  sede_nombre: string | null
  nombre: string
  apellido: string
  fecha_nacimiento: string | null
  telefono: string
  email: string
  primera_visita: string
}

export interface Cita {
  id: number
  clinica: number
  sede: number | null
  medico: number
  paciente: number
  fecha_hora_agendada: string
  fecha_hora_real: string | null
  estado: string
  motivo_cancelacion: string
  ingreso_generado: number
  creada_en: string
}

export interface Encuesta {
  id: number
  cita: number
  paciente: number
  puntuacion: number
  comentario: string
  respondida_en: string
}

export interface DetalleMetodoBase {
  es_anomalia: boolean
  valor_esperado: number
  desviacion: number
  datos_usados?: number
  umbral?: number
}

export interface DetalleEstadistico extends DetalleMetodoBase {
  umbral: number
  datos_usados: number
}

export interface DetalleProphet extends DetalleMetodoBase {
  yhat: number
  yhat_lower: number
  yhat_upper: number
  intervalo_confianza: number
  datos_entrenamiento: number
  forecast?: { fecha: string; yhat: number; yhat_lower: number; yhat_upper: number }[]
}

export interface DetallePyod extends DetalleMetodoBase {
  anomaly_score: number
  threshold: number
  es_outlier: boolean
  media_historica: number
  std_historica: number
  datos_entrenamiento: number
  contamination: number
}

export interface DetalleEnsemble {
  metodos_disponibles: string[]
  metodos_que_flaggearon: string[]
  votos: number
  total_metodos: number
  resultado: string
}

export interface DetalleDeteccion {
  estadistico?: DetalleEstadistico
  prophet?: DetalleProphet
  pyod?: DetallePyod
  ensemble?: DetalleEnsemble
}

export interface Alerta {
  id: number
  clinica: number
  sede: number | null
  sede_nombre: string | null
  medico: number | null
  tipo_kpi: string
  valor_detectado: number
  valor_esperado: number
  desviacion: number
  severidad: 'baja' | 'media' | 'alta' | 'critica'
  mensaje: string
  recomendacion: string
  metodo_deteccion: string
  detalle_deteccion: DetalleDeteccion | null
  estado: 'activa' | 'revisada' | 'resuelta'
  creada_en: string
  revisada_en: string | null
}

export interface Notificacion {
  id: number
  alerta: number
  usuario: number
  canal: string
  destinatario: string
  estado: string
  enviada_en: string | null
  leida_en: string | null
}

export interface FeedbackAlerta {
  id: number
  alerta: number
  usuario: number
  fue_util: boolean
  comentario: string
  creado_en: string
}

export interface RegistroKPI {
  id: number
  clinica: number
  sede: number | null
  medico: number | null
  tipo: string
  valor: number
  fecha_hora: string
  periodo: string
}

export interface IntegracionExterna {
  id: number
  clinica: number
  tipo: string
  nombre: string
  api_url: string
  estado: string
  ultima_sync: string | null
}

export interface SyncLog {
  id: number
  integracion: number
  ejecutado_en: string
  registros_importados: number
  exitoso: boolean
  error_detalle: string
}

export interface PlanFacturacion {
  id: number
  clinica: number
  plan: string
  monto: number
  moneda: string
  estado: string
  fecha_inicio: string
  fecha_renovacion: string
  creado_en: string
}