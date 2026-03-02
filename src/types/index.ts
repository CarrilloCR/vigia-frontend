export interface Clinica {
  id: number
  nombre: string
  email: string
  plan: string
  activa: boolean
  creada_en: string
}

export interface Medico {
  id: number
  clinica: number
  nombre: string
  apellido: string
  especialidad: string
  email: string
  activo: boolean
}

export interface Cita {
  id: number
  clinica: number
  medico: number
  paciente: number
  fecha_hora_agendada: string
  fecha_hora_real: string | null
  estado: string
  motivo_cancelacion: string
  ingreso_generado: number
}

export interface Alerta {
  id: number
  clinica: number
  medico: number | null
  tipo_kpi: string
  valor_detectado: number
  valor_esperado: number
  desviacion: number
  severidad: 'baja' | 'media' | 'alta' | 'critica'
  mensaje: string
  recomendacion: string
  estado: 'activa' | 'revisada' | 'resuelta'
  creada_en: string
}

export interface RegistroKPI {
  id: number
  clinica: number
  medico: number | null
  tipo: string
  valor: number
  fecha_hora: string
  periodo: string
}