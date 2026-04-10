'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../lib/axios'
import { Alerta, DetalleDeteccion } from '../../types'
import { useAuthStore } from '../../store/auth'
import { useToastStore } from '../../store/toast'
import Aurora from '../../components/reactbits/Aurora'
import GlowingCard from '../../components/reactbits/GlowingCard'
import CountUp from '../../components/reactbits/CountUp'
import ThemeToggle from '../../components/ui/ThemeToggle'
import VigiaLogo from '../../components/ui/VigiaLogo'

const kpiLabel: Record<string, string> = {
  tasa_cancelacion: 'Cancelación',
  tasa_noshow: 'No-Show',
  ingresos_dia: 'Ingresos del Día',
  ocupacion_agenda: 'Ocupación',
  ticket_promedio: 'Ticket Promedio',
  pacientes_nuevos: 'Pac. Nuevos',
  retencion_90: 'Retención 90d',
  nps: 'NPS',
  citas_reagendadas: 'Reagendadas',
}

const kpiDescripcion: Record<string, { corta: string; detalle: string; unidad: string }> = {
  tasa_cancelacion: {
    corta: 'Porcentaje de citas canceladas sobre el total agendado.',
    detalle: 'Un valor alto indica problemas de compromiso del paciente o dificultades en la agenda. Se calcula como (citas canceladas ÷ total citas agendadas) × 100.',
    unidad: '%',
  },
  tasa_noshow: {
    corta: 'Porcentaje de pacientes que no asistieron sin avisar.',
    detalle: 'Los no-shows generan pérdidas directas de ingreso y tiempo. Se calcula como (inasistencias sin aviso ÷ total citas confirmadas) × 100.',
    unidad: '%',
  },
  ingresos_dia: {
    corta: 'Ingresos totales generados en el día por consultas.',
    detalle: 'Suma de los ingresos registrados en las citas completadas durante el día. Incluye consultas, procedimientos y servicios facturados.',
    unidad: '$',
  },
  ocupacion_agenda: {
    corta: 'Porcentaje de bloques de agenda utilizados.',
    detalle: 'Mide qué tan aprovechada está la capacidad instalada de la clínica. Se calcula como (citas atendidas ÷ slots disponibles) × 100.',
    unidad: '%',
  },
  ticket_promedio: {
    corta: 'Ingreso promedio por cita atendida en el sistema.',
    detalle: 'El ticket promedio refleja el valor económico de cada consulta. Se calcula como ingresos totales ÷ número de citas completadas. Un ticket bajo puede indicar problemas de cobro o servicios subutilizados.',
    unidad: '$',
  },
  pacientes_nuevos: {
    corta: 'Cantidad de pacientes que visitan la clínica por primera vez.',
    detalle: 'Indicador de crecimiento de la base de pacientes. Un descenso puede señalar problemas de captación o pérdida de competitividad.',
    unidad: 'pac.',
  },
  retencion_90: {
    corta: 'Porcentaje de pacientes que regresaron en los últimos 90 días.',
    detalle: 'Mide la fidelidad del paciente. Se calcula como (pacientes con al menos 2 visitas en 90 días ÷ total pacientes activos) × 100. Un valor bajo indica problemas de seguimiento o satisfacción.',
    unidad: '%',
  },
  nps: {
    corta: 'Net Promoter Score: índice de satisfacción y lealtad del paciente.',
    detalle: 'Escala de -100 a 100. Valores por encima de 50 son excelentes. Se calcula restando el % de detractores (puntuación 0–6) al % de promotores (9–10). Valores negativos indican alta insatisfacción.',
    unidad: 'puntos',
  },
  citas_reagendadas: {
    corta: 'Número de citas que fueron movidas a otra fecha.',
    detalle: 'Un volumen alto de reagendamientos puede indicar problemas organizativos o de disponibilidad médica. Se cuentan todas las citas cuyo estado pasó a "reagendada" en el período.',
    unidad: 'citas',
  },
}

const sevDescripcion: Record<string, { desc: string; condicion: string }> = {
  baja:    { desc: 'Variación menor, monitorear si el patrón continúa.',                   condicion: 'Desviación < 35%' },
  media:   { desc: 'Desviación moderada que merece seguimiento pero no acción inmediata.', condicion: 'Desviación 35–60%' },
  alta:    { desc: 'Anomalía significativa que requiere revisión y posible intervención.',  condicion: 'Desviación 60–80%' },
  critica: { desc: 'Anomalía severa con posible impacto operativo o financiero urgente.',  condicion: 'Desviación > 80% o múltiples métodos coinciden' },
}

const sevConfig: Record<string, { label: string; color: string }> = {
  baja:    { label: 'Baja',    color: '#A0C4B5' },
  media:   { label: 'Media',   color: '#C4B5E8' },
  alta:    { label: 'Alta',    color: '#9B8EC4' },
  critica: { label: 'Crítica', color: '#E8A0C4' },
}

const metodoDeteccionConfig: Record<string, { label: string; color: string; icon: string }> = {
  estadistico: { label: 'Estadístico', color: '#A0C4B5', icon: 'σ' },
  prophet:     { label: 'Prophet',     color: '#7CB5E8', icon: 'P' },
  pyod:        { label: 'PyOD',        color: '#E8C4A0', icon: 'F' },
}

function parseMetodoDeteccion(metodo: string | undefined): { label: string; color: string; methods: string[]; isEnsemble: boolean } {
  if (!metodo) return { label: 'Estadístico', color: '#A0C4B5', methods: ['estadistico'], isEnsemble: false }

  if (metodo.startsWith('ensemble:')) {
    const parts = metodo.replace('ensemble:', '').split('+').filter(Boolean)
    if (parts[0] === 'sin_anomalia') {
      return { label: 'Ensemble (sin anomalía)', color: '#A0C4B5', methods: [], isEnsemble: true }
    }
    const labels = parts.map(p => metodoDeteccionConfig[p]?.label || p)
    return { label: labels.join(' + '), color: '#C4B5E8', methods: parts, isEnsemble: true }
  }

  const cfg = metodoDeteccionConfig[metodo]
  return { label: cfg?.label || metodo, color: cfg?.color || '#A0C4B5', methods: [metodo], isEnsemble: false }
}

const MetodoBadge = ({ metodo }: { metodo: string | undefined }) => {
  const parsed = parseMetodoDeteccion(metodo)
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
      background: parsed.isEnsemble
        ? 'linear-gradient(135deg, rgba(124,181,232,0.15), rgba(232,196,160,0.15))'
        : `${parsed.color}18`,
      color: parsed.color,
      border: `1px solid ${parsed.color}30`,
      display: 'inline-flex', alignItems: 'center', gap: 5,
      whiteSpace: 'nowrap' as const,
    }}>
      {parsed.isEnsemble && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={parsed.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/>
        </svg>
      )}
      {parsed.isEnsemble ? 'Ensemble' : parsed.label}
      {parsed.isEnsemble && parsed.methods.length > 0 && (
        <span style={{ opacity: 0.7 }}>({parsed.methods.length})</span>
      )}
    </span>
  )
}

const InfoIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
)

function DeteccionDetailPanel({ detalle, metodo, valorDetectado, tipoKpi }: {
  detalle: DetalleDeteccion | null; metodo: string; valorDetectado: number; tipoKpi: string
}) {
  if (!detalle) return null

  const kpiDesc = kpiDescripcion[tipoKpi]

  const MethodRow = ({ name, label, color, icon, data }: {
    name: string; label: string; color: string; icon: string;
    data: { es_anomalia: boolean; valor_esperado: number; desviacion: number; [k: string]: any }
  }) => {
    const outOfRange = name === 'prophet' && data.yhat_lower != null
      ? (valorDetectado < data.yhat_lower || valorDetectado > data.yhat_upper)
      : false

    return (
      <div style={{
        padding: '14px 16px', borderRadius: 14,
        background: data.es_anomalia ? `${color}10` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${data.es_anomalia ? color + '35' : 'var(--border)'}`,
      }}>
        {/* Method header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 24, height: 24, borderRadius: 8, fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${color}22`, color,
            }}>{icon}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{label}</span>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
            background: data.es_anomalia ? `${color}22` : 'rgba(160,196,181,0.15)',
            color: data.es_anomalia ? color : 'var(--success)',
          }}>
            {data.es_anomalia ? 'Anomalía detectada' : 'Normal'}
          </span>
        </div>

        {/* Method description */}
        {name === 'estadistico' && (
          <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10, lineHeight: 1.6 }}>
            Compara el valor actual con el promedio histórico usando desviaciones estándar (σ). Si el valor supera el umbral de tolerancia configurado, se marca como anomalía.
          </p>
        )}
        {name === 'prophet' && (
          <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10, lineHeight: 1.6 }}>
            Modelo de predicción de series temporales (Meta/Facebook). Aprende patrones de tendencia, estacionalidad semanal y efectos de días especiales para predecir el valor esperado a futuro con un intervalo de confianza.
          </p>
        )}
        {name === 'pyod' && (
          <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10, lineHeight: 1.6 }}>
            Isolation Forest (PyOD): detecta puntos anómalos aislando observaciones inusuales en el espacio multidimensional de datos. Produce un score de anomalía: cuanto más negativo, más alejado está del comportamiento normal histórico.
          </p>
        )}

        {/* Core metrics */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 12, marginBottom: 8 }}>
          <div style={{ padding: '6px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--muted)', fontSize: 10, display: 'block', marginBottom: 2 }}>Valor esperado</span>
            <strong style={{ color: 'var(--text)' }}>
              {kpiDesc?.unidad === '$' ? `$${data.valor_esperado}` : `${data.valor_esperado}${kpiDesc?.unidad === '%' ? '%' : ''}`}
            </strong>
            <span style={{ fontSize: 10, color: 'var(--muted)', display: 'block', marginTop: 1 }}>
              {name === 'estadistico' ? 'Promedio histórico' : name === 'prophet' ? 'Predicción del modelo' : 'Media del período'}
            </span>
          </div>

          <div style={{ padding: '6px 10px', borderRadius: 10, background: `${color}10`, border: `1px solid ${color}30` }}>
            <span style={{ color: 'var(--muted)', fontSize: 10, display: 'block', marginBottom: 2 }}>Desviación</span>
            <strong style={{ color }}>
              {data.desviacion > 0 ? '+' : ''}{data.desviacion.toFixed(1)}%
            </strong>
            <span style={{ fontSize: 10, color: 'var(--muted)', display: 'block', marginTop: 1 }}>
              Diferencia vs esperado
            </span>
          </div>

          {name === 'estadistico' && data.umbral != null && (
            <div style={{ padding: '6px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--muted)', fontSize: 10, display: 'block', marginBottom: 2 }}>Umbral</span>
              <strong style={{ color: 'var(--text)' }}>{data.umbral}%</strong>
              <span style={{ fontSize: 10, color: 'var(--muted)', display: 'block', marginTop: 1 }}>
                Límite de tolerancia
              </span>
            </div>
          )}
        </div>

        {/* Prophet confidence interval chart */}
        {name === 'prophet' && data.yhat_lower != null && (
          <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 12, background: 'rgba(124,181,232,0.07)', border: '1px solid rgba(124,181,232,0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <p style={{ fontSize: 11, color: '#7CB5E8', fontWeight: 700 }}>
                Predicción Prophet — Intervalo de confianza {data.intervalo_confianza || 90}%
              </p>
              <span style={{ fontSize: 10, color: outOfRange ? '#E8A0C4' : '#A0C4B5', fontWeight: 600 }}>
                {outOfRange ? 'Valor fuera del rango' : 'Valor dentro del rango'}
              </span>
            </div>
            <p style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 8, lineHeight: 1.5 }}>
              La zona azul es el rango donde se espera que caiga el valor con {data.intervalo_confianza || 90}% de certeza.
              La línea vertical muestra el valor real. Si cae fuera de la zona, Prophet lo considera anomalía.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--muted)' }}>
                Predicción: <strong style={{ color: '#7CB5E8' }}>{data.yhat}</strong>
              </span>
              <span style={{ color: 'var(--muted)' }}>
                Rango: <strong style={{ color: 'var(--text)' }}>{data.yhat_lower}</strong>
                {' — '}
                <strong style={{ color: 'var(--text)' }}>{data.yhat_upper}</strong>
              </span>
            </div>
            {/* Chart */}
            <div style={{ height: 8, borderRadius: 4, background: 'rgba(124,181,232,0.1)', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', top: 0, bottom: 0,
                left: `${Math.max(0, Math.min(100, (data.yhat_lower / (data.yhat_upper * 1.3)) * 100))}%`,
                right: `${Math.max(0, 100 - (data.yhat_upper / (data.yhat_upper * 1.3)) * 100)}%`,
                background: 'rgba(124,181,232,0.35)', borderRadius: 4,
              }} />
              <div style={{
                position: 'absolute', top: -2, bottom: -2, width: 3, borderRadius: 2,
                left: `${Math.max(0, Math.min(97, (valorDetectado / (data.yhat_upper * 1.3)) * 100))}%`,
                background: outOfRange ? '#E8A0C4' : '#A0C4B5',
                boxShadow: `0 0 8px ${outOfRange ? '#E8A0C4' : '#A0C4B5'}`,
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 10, color: 'var(--muted)' }}>{data.yhat_lower} (mín)</span>
              <span style={{ fontSize: 10, color: outOfRange ? '#E8A0C4' : '#A0C4B5', fontWeight: 700 }}>
                Actual: {valorDetectado.toFixed(1)}
              </span>
              <span style={{ fontSize: 10, color: 'var(--muted)' }}>{data.yhat_upper} (máx)</span>
            </div>
            {data.datos_entrenamiento != null && (
              <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>
                Modelo entrenado con {data.datos_entrenamiento} registros históricos
              </p>
            )}
          </div>
        )}

        {/* PyOD score chart */}
        {name === 'pyod' && data.anomaly_score != null && (
          <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 12, background: 'rgba(232,196,160,0.07)', border: '1px solid rgba(232,196,160,0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <p style={{ fontSize: 11, color: '#E8C4A0', fontWeight: 700 }}>Score de Anomalía (Isolation Forest)</p>
              <span style={{ fontSize: 10, color: data.es_outlier ? '#E8A0C4' : '#A0C4B5', fontWeight: 600 }}>
                {data.es_outlier ? 'Outlier detectado' : 'Punto normal'}
              </span>
            </div>
            <p style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 8, lineHeight: 1.5 }}>
              La barra muestra qué tan "anómalo" es el punto (score). La línea vertical marca el umbral:
              si el score supera esa línea, el punto es considerado un outlier (fuera de lo normal histórico).
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 12, marginBottom: 8 }}>
              <span style={{ color: 'var(--muted)' }}>
                Score: <strong style={{ color: data.es_outlier ? '#E8A0C4' : '#A0C4B5' }}>{data.anomaly_score}</strong>
              </span>
              <span style={{ color: 'var(--muted)' }}>
                Umbral: <strong style={{ color: '#E8C4A0' }}>{data.threshold}</strong>
              </span>
              {data.media_historica != null && (
                <span style={{ color: 'var(--muted)' }}>
                  Media hist.: <strong style={{ color: 'var(--text)' }}>{data.media_historica}</strong>
                  {data.std_historica != null && <> ± {data.std_historica.toFixed(1)}</>}
                </span>
              )}
            </div>
            {/* Bar */}
            <div style={{ height: 8, borderRadius: 4, background: 'rgba(232,196,160,0.1)', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', top: 0, bottom: 0, left: 0, borderRadius: 4,
                width: `${Math.min(100, Math.max(5, Math.abs(data.anomaly_score) / (Math.abs(data.threshold) * 2) * 100))}%`,
                background: data.es_outlier
                  ? 'linear-gradient(90deg, #E8C4A0, #E8A0C4)'
                  : 'linear-gradient(90deg, #A0C4B5, #E8C4A0)',
              }} />
              <div style={{
                position: 'absolute', top: -1, bottom: -1, width: 2, borderRadius: 1,
                left: `${Math.min(95, Math.abs(data.threshold) / (Math.abs(data.threshold) * 2) * 100)}%`,
                background: '#E8C4A0',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 10, color: 'var(--muted)' }}>Normal (0)</span>
              <span style={{ fontSize: 10, color: '#E8C4A0' }}>Umbral: {data.threshold}</span>
            </div>
            {data.datos_entrenamiento != null && (
              <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>
                Modelo entrenado con {data.datos_entrenamiento} registros históricos
              </p>
            )}
          </div>
        )}

        {/* Estadístico: datos usados */}
        {name === 'estadistico' && (data.datos_usados ?? data.datos_entrenamiento) != null && (
          <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 8 }}>
            {data.datos_usados ?? data.datos_entrenamiento} registros históricos considerados
          </p>
        )}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      style={{ overflow: 'hidden', marginBottom: 12 }}
    >
      <div style={{
        padding: '16px', borderRadius: 16,
        background: 'linear-gradient(135deg, rgba(155,142,196,0.06), rgba(124,181,232,0.04))',
        border: '1px solid rgba(155,142,196,0.18)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9B8EC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#9B8EC4', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Información de Detección
          </span>
          {detalle.ensemble && (
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>
              {detalle.ensemble.votos}/{detalle.ensemble.total_metodos} métodos detectaron anomalía
            </span>
          )}
        </div>

        {/* KPI description */}
        {kpiDesc && (
          <div style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(155,142,196,0.07)', border: '1px solid rgba(155,142,196,0.18)', marginBottom: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9B8EC4', marginBottom: 4 }}>¿Qué es este KPI?</p>
            <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.7, marginBottom: 4, opacity: 0.9 }}>{kpiDesc.corta}</p>
            <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>{kpiDesc.detalle}</p>
          </div>
        )}

        {/* Ensemble voting summary */}
        {detalle.ensemble && detalle.ensemble.total_metodos > 1 && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8, lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--text)' }}>Modo Ensemble:</strong> se combinan múltiples métodos de detección. La alerta se activa cuando al menos {Math.ceil(detalle.ensemble.total_metodos / 2)} de {detalle.ensemble.total_metodos} métodos coinciden en detectar una anomalía. Esto reduce falsos positivos al requerir consenso entre modelos independientes.
            </p>
            <div style={{ display: 'flex', gap: 6 }}>
              {detalle.ensemble.metodos_disponibles.map(m => {
                const voted = detalle.ensemble!.metodos_que_flaggearon.includes(m)
                const cfg = metodoDeteccionConfig[m]
                return (
                  <div key={m} style={{
                    flex: 1, padding: '10px 12px', borderRadius: 12, textAlign: 'center',
                    background: voted ? `${cfg?.color || '#9B8EC4'}15` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${voted ? (cfg?.color || '#9B8EC4') + '40' : 'var(--border)'}`,
                  }}>
                    <div style={{ fontSize: 18, marginBottom: 3 }}>{voted ? '⚠' : '✓'}</div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: voted ? cfg?.color : 'var(--success)' }}>
                      {cfg?.label || m}
                    </p>
                    <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                      {voted ? 'Detectó anomalía' : 'Sin anomalía'}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Per-method details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {detalle.estadistico && (
            <MethodRow name="estadistico" label="Método Estadístico (σ)" color="#A0C4B5" icon="σ" data={detalle.estadistico} />
          )}
          {detalle.prophet && (
            <MethodRow name="prophet" label="Prophet — Predicción Temporal" color="#7CB5E8" icon="P" data={detalle.prophet} />
          )}
          {detalle.pyod && (
            <MethodRow name="pyod" label="PyOD — Isolation Forest" color="#E8C4A0" icon="F" data={detalle.pyod} />
          )}
        </div>

        {/* Severity explanation */}
        <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 6 }}>¿Cómo se determina la severidad?</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {Object.entries(sevDescripcion).map(([key, val]) => {
              const sev = sevConfig[key]
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 11 }}>
                  <span style={{ minWidth: 52, fontWeight: 700, color: sev.color, fontSize: 11 }}>{sev.label}</span>
                  <span style={{ color: 'var(--muted)', lineHeight: 1.5 }}>{val.condicion} — {val.desc}</span>
                </div>
              )
            })}
          </div>
          <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 8, lineHeight: 1.5, opacity: 0.7 }}>
            En modo Ensemble, la severidad puede elevarse automáticamente cuando múltiples métodos detectan anomalía simultáneamente.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

const ShieldIcon = () => (
  <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const BoltIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)
const BellIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const LogoutIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const ThumbUpIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
  </svg>
)
const ThumbDownIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
    <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
  </svg>
)
const ArrowRightIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
)
const CheckCircleIcon = () => (
  <svg width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const HistoryIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-4.84"/>
  </svg>
)
const EyeOffIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)
const ResolveAllIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12"/>
    <polyline points="20 12 9 23 4 18"/>
  </svg>
)

const liveKpiConfig: Record<string, { label: string; color: string; unit: string }> = {
  tasa_cancelacion:  { label: 'Cancelación',  color: '#E8A0C4', unit: '%' },
  tasa_noshow:       { label: 'No-Show',      color: '#C4B5E8', unit: '%' },
  ingresos_dia:      { label: 'Ingresos',     color: '#A0C4B5', unit: '$' },
  ocupacion_agenda:  { label: 'Ocupación',    color: '#BBA8E8', unit: '%' },
  ticket_promedio:   { label: 'Ticket',       color: '#9B8EC4', unit: '$' },
  pacientes_nuevos:  { label: 'Pac. Nuevos',  color: '#7C6FBF', unit: '' },
  retencion_90:      { label: 'Retención',    color: '#A8C4A0', unit: '%' },
  nps:               { label: 'NPS',          color: '#C4B5E8', unit: '' },
  citas_reagendadas: { label: 'Reagendadas',  color: '#E8C4A0', unit: '' },
}

interface LiveKpi { id: number; tipo: string; valor: number; fecha_hora: string }

function GeneradorLiveWidget({ clinicaId }: { clinicaId: number }) {
  const [count, setCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/kpis/?clinica=${clinicaId}&horas=1`)
        const data = res.data.results || res.data
        setCount(data.length)
      } catch { /* silent */ }
    }
    fetch()
    const id = setInterval(fetch, 20000)
    return () => clearInterval(id)
  }, [clinicaId])

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
      onClick={() => router.push('/dashboard/generador')}
      whileHover={{ scale: 1.02, borderColor: 'rgba(160,196,181,0.45)' }}
      whileTap={{ scale: 0.98 }}
      style={{
        padding: '16px 20px', borderRadius: 20, cursor: 'pointer',
        background: 'linear-gradient(135deg, rgba(160,196,181,0.12), rgba(160,196,181,0.04))',
        border: '1px solid rgba(160,196,181,0.25)',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
      {/* Animated activity icon */}
      <motion.div
        animate={{ boxShadow: ['0 0 8px rgba(160,196,181,0.3)', '0 0 20px rgba(160,196,181,0.6)', '0 0 8px rgba(160,196,181,0.3)'] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          width: 42, height: 42, borderRadius: 14, flexShrink: 0,
          background: 'linear-gradient(135deg, #A0C4B5, #7AB5A3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
        <motion.svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
          animate={{ pathLength: [0, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </motion.svg>
      </motion.div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="font-display" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Generador</span>
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            style={{ width: 6, height: 6, borderRadius: '50%', background: '#A0C4B5', boxShadow: '0 0 8px #A0C4B5' }}
          />
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
          {count > 0 ? <><strong style={{ color: '#A0C4B5' }}>{count}</strong> registros (1h)</> : 'Esperando datos...'}
        </p>
      </div>

      <span style={{ color: 'var(--muted)', flexShrink: 0 }}><ArrowRightIcon /></span>
    </motion.div>
  )
}

interface Medico {
  id: number
  nombre: string
  apellido: string
  especialidad: string
}

function MedicosList({ clinicaId }: { clinicaId: number }) {
  const [medicos, setMedicos] = useState<Medico[]>([])
  const router = useRouter()

  useEffect(() => {
    api.get(`/medicos/?clinica=${clinicaId}`).then(res => {
      setMedicos(res.data.results || res.data)
    }).catch(() => {
      useToastStore.getState().error('Error al cargar médicos', 'No se pudo obtener la lista de médicos.')
    })
  }, [clinicaId])

  if (medicos.length === 0) return (
    <p style={{ fontSize: 14, color: 'var(--muted)', textAlign: 'center', padding: '24px 0' }}>
      Sin médicos registrados
    </p>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {medicos.map((m, i) => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          onClick={() => router.push(`/dashboard/medico/${m.id}`)}
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 16px', borderRadius: 16, cursor: 'pointer',
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
            transition: 'all 0.2s',
          }}
          whileHover={{ background: 'rgba(155,142,196,0.08)' } as any}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 14, fontWeight: 700,
          }}>
            {m.nombre[0]}{m.apellido[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Dr. {m.nombre} {m.apellido}
            </p>
            <p style={{ fontSize: 13, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {m.especialidad}
            </p>
          </div>
          <span style={{ color: 'var(--muted)', flexShrink: 0 }}><ArrowRightIcon /></span>
        </motion.div>
      ))}
    </div>
  )
}

type FiltroSeveridad = 'todas' | 'critica' | 'alta' | 'media' | 'baja'
type FiltroMetodo = 'todos' | 'estadistico' | 'prophet' | 'pyod' | 'ensemble'
type VistaAlertas = 'activas' | 'historial'

export default function DashboardPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [historial, setHistorial] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)
  const [motorLoading, setMotorLoading] = useState(false)
  const [notifPendientes, setNotifPendientes] = useState(0)
  const [filtroSev, setFiltroSev] = useState<FiltroSeveridad>('todas')
  const [filtroMetodo, setFiltroMetodo] = useState<FiltroMetodo>('todos')
  const [vistaAlertas, setVistaAlertas] = useState<VistaAlertas>('activas')
  const [ocultarTodas, setOcultarTodas] = useState(false)
  const [feedbackDado, setFeedbackDado] = useState<Record<number, 'util' | 'no_util'>>({})
  const [detalleExpandido, setDetalleExpandido] = useState<Record<number, boolean>>({})
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()
  const toast = useToastStore()
  const clinicaId = user?.clinica_id || 1

  useEffect(() => {
    fetchAlertas()
    fetchHistorial()
    fetchNotifs()
  }, [])

  const fetchAlertas = async () => {
    try {
      const res = await api.get('/alertas/?estado=activa')
      setAlertas(res.data.results || res.data)
    } catch {
      toast.error('Error al cargar alertas', 'No se pudieron obtener las alertas activas.')
    } finally { setLoading(false) }
  }

  const fetchHistorial = async () => {
    try {
      const res = await api.get('/alertas/')
      setHistorial(res.data.results || res.data)
    } catch {
      toast.error('Error al cargar historial', 'No se pudo obtener el historial de alertas.')
    }
  }

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/notificaciones/?estado=pendiente')
      setNotifPendientes((res.data.results || res.data).length)
    } catch {
      toast.warning('Notificaciones no disponibles', 'No se pudo verificar notificaciones pendientes.')
    }
  }

  const ejecutarMotor = async () => {
    setMotorLoading(true)
    try {
      await api.post('/motor/ejecutar/', { clinica_id: clinicaId })
      await fetchAlertas()
      await fetchHistorial()
      await fetchNotifs()
      toast.success('Análisis completado', 'El motor de detección (Estadístico + Prophet + PyOD) se ejecutó correctamente.')
    } catch {
      toast.error('Error en el análisis', 'No se pudo ejecutar el motor de alertas. Intenta de nuevo.')
    } finally { setMotorLoading(false) }
  }

  const marcarRevisada = async (id: number) => {
    try {
      await api.post(`/alertas/${id}/marcar_revisada/`)
      setAlertas(prev => prev.filter(a => a.id !== id))
      await fetchHistorial()
      toast.success('Alerta revisada', 'La alerta fue marcada como revisada.')
    } catch {
      toast.error('Error', 'No se pudo marcar la alerta como revisada.')
    }
  }

  const resolverTodas = async () => {
    try {
      await api.post('/alertas/resolver_todas/', { clinica_id: clinicaId })
      await fetchAlertas()
      await fetchHistorial()
      toast.success('Alertas resueltas', 'Todas las alertas fueron marcadas como resueltas.')
    } catch {
      toast.error('Error', 'No se pudieron resolver todas las alertas.')
    }
  }

  const marcarFeedback = async (alertaId: number, fueUtil: boolean) => {
    try {
      await api.post('/feedbacks/', {
        alerta: alertaId,
        usuario: user?.id || 1,
        fue_util: fueUtil,
        comentario: ''
      })
      setFeedbackDado(prev => ({ ...prev, [alertaId]: fueUtil ? 'util' : 'no_util' }))
      toast.info('Feedback registrado', 'Gracias por tu valoración.')
    } catch {
      toast.error('Error', 'No se pudo registrar el feedback.')
    }
  }

  const handleLogout = async () => {
    try {
      const { refreshToken } = useAuthStore.getState()
      await api.post('/auth/logout/', { refresh: refreshToken })
    } catch { } finally {
      clearAuth()
      toast.info('Sesión cerrada', 'Has cerrado sesión correctamente.')
      router.push('/')
    }
  }

  const filtrarPorMetodo = (a: Alerta) => {
    if (filtroMetodo === 'todos') return true
    if (filtroMetodo === 'ensemble') return (a.metodo_deteccion || '').startsWith('ensemble:')
    if (filtroMetodo === 'estadistico') return a.metodo_deteccion === 'estadistico' || (!a.metodo_deteccion)
    return a.metodo_deteccion === filtroMetodo
  }

  const alertasFiltradas = alertas.filter(a =>
    (filtroSev === 'todas' || a.severidad === filtroSev) && filtrarPorMetodo(a)
  )

  const historialFiltrado = historial.filter(a =>
    (filtroSev === 'todas' || a.severidad === filtroSev) && filtrarPorMetodo(a)
  )

  const listaActual = vistaAlertas === 'activas' ? alertasFiltradas : historialFiltrado

  const ensembleCount = alertas.filter(a => (a.metodo_deteccion || '').startsWith('ensemble:')).length

  const stats = [
    { label: 'Total activas',  value: alertas.length, color: '#9B8EC4', filtro: 'todas' as FiltroSeveridad },
    { label: 'Críticas',       value: alertas.filter(a => a.severidad === 'critica').length, color: '#E8A0C4', filtro: 'critica' as FiltroSeveridad },
    { label: 'Altas',          value: alertas.filter(a => a.severidad === 'alta').length, color: '#C4B5E8', filtro: 'alta' as FiltroSeveridad },
    { label: 'Medias / Bajas', value: alertas.filter(a => ['media', 'baja'].includes(a.severidad)).length, color: '#A0C4B5', filtro: 'media' as FiltroSeveridad },
  ]

  const filtros: { key: FiltroSeveridad; label: string; color: string }[] = [
    { key: 'todas',   label: 'Todas',    color: '#9B8EC4' },
    { key: 'critica', label: 'Críticas', color: '#E8A0C4' },
    { key: 'alta',    label: 'Altas',    color: '#9B8EC4' },
    { key: 'media',   label: 'Medias',   color: '#C4B5E8' },
    { key: 'baja',    label: 'Bajas',    color: '#A0C4B5' },
  ]

  const filtrosMetodo: { key: FiltroMetodo; label: string; color: string }[] = [
    { key: 'todos',       label: 'Todos',       color: '#9B8EC4' },
    { key: 'ensemble',    label: 'Ensemble',    color: '#C4B5E8' },
    { key: 'estadistico', label: 'Estadístico', color: '#A0C4B5' },
    { key: 'prophet',     label: 'Prophet',     color: '#7CB5E8' },
    { key: 'pyod',        label: 'PyOD',        color: '#E8C4A0' },
  ]

  return (
    <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: 'var(--void)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <Aurora colorStops={['#9B8EC4', '#7C6FBF', '#C4B5E8']} amplitude={0.5} speed={0.15} />
      </div>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.03, backgroundImage: 'linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      <div className="px-5 sm:px-8 lg:px-12 xl:px-14 pt-14 sm:pt-16 pb-10 sm:pb-12" style={{ position: 'relative', zIndex: 10, maxWidth: 1600, margin: '0 auto' }}>

        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <motion.div
              animate={{ filter: ['drop-shadow(0 0 8px rgba(155,142,196,0.3))', 'drop-shadow(0 0 20px rgba(155,142,196,0.6))', 'drop-shadow(0 0 8px rgba(155,142,196,0.3))'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <VigiaLogo size={68} />
            </motion.div>
            <div>
              <p className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>Vigía</p>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 2 }}>{user?.clinica_nombre || 'Panel de control'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <motion.button onClick={ejecutarMotor} disabled={motorLoading}
              whileHover={{ scale: motorLoading ? 1 : 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 22px', borderRadius: 14, background: 'linear-gradient(135deg, #7AB5A3, var(--success))', color: 'white', fontSize: 15, fontWeight: 600, border: 'none', cursor: motorLoading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 20px rgba(160,196,181,0.3)', opacity: motorLoading ? 0.7 : 1 }}>
              {motorLoading
                ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%' }} />
                : <BoltIcon />}
              {motorLoading ? 'Analizando...' : 'Ejecutar análisis'}
            </motion.button>

            <motion.button onClick={() => router.push('/dashboard/notificaciones')}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, padding: '13px 22px', borderRadius: 14, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
              <BellIcon />
              Notificaciones
              <AnimatePresence>
                {notifPendientes > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    style={{ position: 'absolute', top: -6, right: -6, minWidth: 22, height: 22, borderRadius: 11, background: 'var(--danger)', boxShadow: '0 0 12px rgba(232,160,196,0.6)', color: 'white', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }}>
                    {notifPendientes}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button onClick={() => router.push('/dashboard/kpis')}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 22px', borderRadius: 14, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              KPIs
            </motion.button>

            <motion.button onClick={() => router.push('/dashboard/correos')}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 22px', borderRadius: 14, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Correos
            </motion.button>

            <motion.button onClick={() => router.push('/dashboard/pacientes')}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 22px', borderRadius: 14, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Pacientes
            </motion.button>

            <motion.button onClick={() => router.push('/dashboard/citas')}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 22px', borderRadius: 14, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Citas
            </motion.button>

            <ThemeToggle />

            <motion.button onClick={handleLogout} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 20px', borderRadius: 14, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
              <LogoutIcon /> Salir
            </motion.button>

            <div style={{ textAlign: 'right', marginLeft: 8 }}>
              <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', textTransform: 'capitalize' }}>
                {new Date().toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Panel de control</p>
            </div>
          </div>
        </motion.div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 36 }}>
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              onClick={() => { setFiltroSev(s.filtro); setVistaAlertas('activas'); setOcultarTodas(false) }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{
                padding: '28px', borderRadius: 24, cursor: 'pointer',
                background: filtroSev === s.filtro ? `${s.color}18` : 'var(--glass)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${filtroSev === s.filtro ? s.color + '50' : 'var(--border)'}`,
                transition: 'all 0.2s',
              }}>
              <p className="font-display" style={{ fontSize: 48, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 10 }}>
                <CountUp to={s.value} duration={1} />
              </p>
              <p style={{ fontSize: 15, color: 'var(--muted)', fontWeight: 500 }}>{s.label}</p>
              {i === 0 && ensembleCount > 0 && (
                <p style={{ fontSize: 11, color: '#C4B5E8', marginTop: 6, fontWeight: 500 }}>
                  {ensembleCount} por ensemble
                </p>
              )}
              <div style={{ marginTop: i === 0 && ensembleCount > 0 ? 8 : 16, height: 3, borderRadius: 4, background: `${s.color}20` }}>
                <motion.div initial={{ width: 0 }} animate={{ width: s.value > 0 ? '100%' : '0%' }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  style={{ height: '100%', borderRadius: 4, background: s.color }} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 24 }}>

          {/* ALERTAS */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
            <GlowingCard className="p-6 sm:p-8 lg:p-10">

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
                  {vistaAlertas === 'activas' ? 'Alertas Activas' : 'Historial de Alertas'}
                </h2>
                <span style={{ fontSize: 13, fontWeight: 500, padding: '5px 14px', borderRadius: 20, background: 'rgba(155,142,196,0.12)', color: 'var(--primary)', border: '1px solid rgba(155,142,196,0.2)' }}>
                  {listaActual.length} {vistaAlertas === 'activas' ? 'activas' : 'registros'}
                </span>
              </div>

              {/* Controles */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {/* Tabs vista */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, padding: 3 }}>
                  {(['activas', 'historial'] as const).map(v => (
                    <motion.button key={v} onClick={() => setVistaAlertas(v)} whileTap={{ scale: 0.97 }}
                      style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', position: 'relative', overflow: 'hidden', background: 'transparent', color: vistaAlertas === v ? 'white' : 'var(--muted)' }}>
                      {vistaAlertas === v && (
                        <motion.div layoutId="alertaTab"
                          style={{ position: 'absolute', inset: 0, borderRadius: 10, background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} />
                      )}
                      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {v === 'historial' && <HistoryIcon />}
                        {v === 'activas' ? 'Activas' : 'Historial'}
                      </span>
                    </motion.button>
                  ))}
                </div>

                {/* Filtros severidad */}
                {filtros.map(f => (
                  <motion.button key={f.key} onClick={() => setFiltroSev(f.key)}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    style={{
                      padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                      cursor: 'pointer', border: 'none',
                      background: filtroSev === f.key ? `${f.color}25` : 'rgba(255,255,255,0.03)',
                      color: filtroSev === f.key ? f.color : 'var(--muted)',
                      borderWidth: 1, borderStyle: 'solid',
                      borderColor: filtroSev === f.key ? `${f.color}50` : 'var(--border)',
                      transition: 'all 0.2s',
                    }}>
                    {f.label}
                  </motion.button>
                ))}

                {/* Filtros método detección */}
                <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />
                {filtrosMetodo.map(f => (
                  <motion.button key={f.key} onClick={() => setFiltroMetodo(f.key)}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    style={{
                      padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                      cursor: 'pointer', border: 'none',
                      background: filtroMetodo === f.key ? `${f.color}25` : 'rgba(255,255,255,0.03)',
                      color: filtroMetodo === f.key ? f.color : 'var(--muted)',
                      borderWidth: 1, borderStyle: 'solid',
                      borderColor: filtroMetodo === f.key ? `${f.color}50` : 'var(--border)',
                      transition: 'all 0.2s',
                    }}>
                    {f.label}
                  </motion.button>
                ))}

                {/* Acciones rápidas */}
                {vistaAlertas === 'activas' && alertas.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                    <motion.button onClick={() => setOcultarTodas(!ocultarTodas)}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border)', background: ocultarTodas ? 'rgba(155,142,196,0.15)' : 'rgba(255,255,255,0.03)', color: ocultarTodas ? 'var(--primary)' : 'var(--muted)' }}>
                      <EyeOffIcon />
                      {ocultarTodas ? 'Mostrar' : 'Ocultar'}
                    </motion.button>
                    <motion.button onClick={resolverTodas}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid rgba(160,196,181,0.3)', background: 'rgba(160,196,181,0.08)', color: 'var(--success)' }}>
                      <ResolveAllIcon />
                      Revisar todas
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Lista */}
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[1, 2, 3].map(i => (
                    <motion.div key={i} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      style={{ height: 100, borderRadius: 20, background: 'rgba(255,255,255,0.04)' }} />
                  ))}
                </div>
              ) : ocultarTodas ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '48px 0' }}>
                  <p style={{ fontSize: 16, color: 'var(--muted)', marginBottom: 16 }}>Alertas ocultas</p>
                  <motion.button onClick={() => setOcultarTodas(false)} whileHover={{ scale: 1.03 }}
                    style={{ padding: '10px 24px', borderRadius: 12, background: 'rgba(155,142,196,0.12)', color: 'var(--primary)', border: '1px solid rgba(155,142,196,0.2)', cursor: 'pointer', fontSize: 14 }}>
                    Mostrar alertas
                  </motion.button>
                </motion.div>
              ) : listaActual.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '64px 0' }}>
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
                    style={{ color: 'var(--success)', display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                    <CheckCircleIcon />
                  </motion.div>
                  <p className="font-display" style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
                    {vistaAlertas === 'historial' ? 'Sin historial' : 'Todo en orden'}
                  </p>
                  <p style={{ fontSize: 15, color: 'var(--muted)' }}>
                    {vistaAlertas === 'historial' ? 'No hay alertas en el historial' : 'No hay alertas activas en este momento'}
                  </p>
                </motion.div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 600, overflowY: 'auto', paddingRight: 4 }}>
                  <AnimatePresence>
                    {listaActual.map((a, i) => {
                      const cfg = sevConfig[a.severidad] || sevConfig.baja
                      return (
                        <motion.div key={a.id}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 16, height: 0 }}
                          transition={{ delay: i * 0.03 }}
                          style={{ padding: '20px 22px', borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: `1px solid ${cfg.color}30` }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                            <div style={{ marginTop: 6, flexShrink: 0 }}>
                              <div style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color, boxShadow: `0 0 8px ${cfg.color}` }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 13, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                                  {cfg.label}
                                </span>
                                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
                                  {kpiLabel[a.tipo_kpi] || a.tipo_kpi}
                                </span>
                                <MetodoBadge metodo={a.metodo_deteccion} />
                                {a.detalle_deteccion && (
                                  <motion.button
                                    onClick={(e) => { e.stopPropagation(); setDetalleExpandido(prev => ({ ...prev, [a.id]: !prev[a.id] })) }}
                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    style={{
                                      width: 24, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                                      background: detalleExpandido[a.id] ? 'rgba(155,142,196,0.25)' : 'rgba(155,142,196,0.1)',
                                      color: detalleExpandido[a.id] ? '#9B8EC4' : 'var(--muted)',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      transition: 'all 0.2s',
                                    }}
                                    title="Ver detalle de detección"
                                  >
                                    <InfoIcon />
                                  </motion.button>
                                )}
                                {vistaAlertas === 'historial' && (
                                  <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', color: 'var(--muted)', border: '1px solid var(--border)', marginLeft: 'auto' }}>
                                    {a.estado}
                                  </span>
                                )}
                              </div>
                              {kpiDescripcion[a.tipo_kpi] && (
                                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, lineHeight: 1.5, fontStyle: 'italic' }}>
                                  {kpiDescripcion[a.tipo_kpi].corta}
                                </p>
                              )}
                              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text)', opacity: 0.85, marginBottom: 12 }}>
                                {a.mensaje}
                              </p>
                              {/* Valores detectados */}
                              <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                                  Detectado: <strong style={{ color: cfg.color }}>{a.valor_detectado?.toFixed(1)}</strong>
                                </span>
                                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                                  Esperado: <strong style={{ color: 'var(--text)' }}>{a.valor_esperado?.toFixed(1)}</strong>
                                </span>
                                {a.desviacion != null && (
                                  <span style={{ fontSize: 12, color: cfg.color, fontWeight: 600 }}>
                                    {a.desviacion > 0 ? '+' : ''}{a.desviacion.toFixed(1)}% desviación
                                  </span>
                                )}
                                {a.metodo_deteccion && parseMetodoDeteccion(a.metodo_deteccion).isEnsemble && parseMetodoDeteccion(a.metodo_deteccion).methods.length > 0 && (
                                  <span style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    Detectado por: {parseMetodoDeteccion(a.metodo_deteccion).methods.map(m => (
                                      <span key={m} style={{
                                        fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10,
                                        background: `${metodoDeteccionConfig[m]?.color || '#A0C4B5'}18`,
                                        color: metodoDeteccionConfig[m]?.color || '#A0C4B5',
                                      }}>
                                        {metodoDeteccionConfig[m]?.icon}{' '}{metodoDeteccionConfig[m]?.label || m}
                                      </span>
                                    ))}
                                  </span>
                                )}
                              </div>
                              {/* Detalle de detección expandible */}
                              <AnimatePresence>
                                {detalleExpandido[a.id] && (
                                  <DeteccionDetailPanel detalle={a.detalle_deteccion} metodo={a.metodo_deteccion} valorDetectado={a.valor_detectado} tipoKpi={a.tipo_kpi} />
                                )}
                              </AnimatePresence>
                              {/* Recomendación IA */}
                              {a.recomendacion && (
                                <div style={{
                                  padding: '14px 18px', borderRadius: 16, marginBottom: 12,
                                  background: 'linear-gradient(135deg, rgba(155,142,196,0.10), rgba(232,160,196,0.06))',
                                  border: '1px solid rgba(155,142,196,0.20)',
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4B5E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.57-3.25 3.92L12 22"/>
                                      <path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.57 3.25 3.92"/>
                                      <path d="M8.5 8.5L3 11" /><path d="M15.5 8.5L21 11"/>
                                      <path d="M7.5 13L4 16" /><path d="M16.5 13L20 16"/>
                                    </svg>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#C4B5E8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                      Recomendación IA
                                    </span>
                                  </div>
                                  <p style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--text)', opacity: 0.9 }}>
                                    {a.recomendacion}
                                  </p>
                                </div>
                              )}
                              <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                                {new Date(a.creada_en).toLocaleString('es-CR')}
                              </p>
                            </div>

                            {/* Acciones — solo en vista activas */}
                            {vistaAlertas === 'activas' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                                <motion.button onClick={() => marcarRevisada(a.id)}
                                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                                  <CheckIcon /> Revisada
                                </motion.button>
                                <div style={{ display: 'flex', gap: 8 }}>
                                  {feedbackDado[a.id] ? (
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                      style={{
                                        padding: '9px 14px', borderRadius: 12, fontSize: 12, fontWeight: 500,
                                        background: feedbackDado[a.id] === 'util' ? 'rgba(160,196,181,0.15)' : 'rgba(232,160,196,0.1)',
                                        color: feedbackDado[a.id] === 'util' ? 'var(--success)' : 'var(--danger)',
                                        border: `1px solid ${feedbackDado[a.id] === 'util' ? 'rgba(160,196,181,0.3)' : 'rgba(232,160,196,0.2)'}`,
                                      }}>
                                      {feedbackDado[a.id] === 'util' ? '✓ Útil' : '✗ No útil'}
                                    </motion.div>
                                  ) : (
                                    <>
                                      <motion.button onClick={() => marcarFeedback(a.id, true)}
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 12px', borderRadius: 12, background: 'rgba(160,196,181,0.12)', color: 'var(--success)', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer' }}>
                                        <ThumbUpIcon /> Útil
                                      </motion.button>
                                      <motion.button onClick={() => marcarFeedback(a.id, false)}
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        style={{ padding: '9px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', color: 'var(--muted)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                        <ThumbDownIcon />
                                      </motion.button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}
            </GlowingCard>
          </motion.div>

          {/* SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* User card */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
              onClick={() => router.push('/dashboard/configuracion')}
              whileHover={{ scale: 1.02, borderColor: 'rgba(155,142,196,0.45)' }}
              whileTap={{ scale: 0.98 }}
              style={{ padding: '24px', borderRadius: 24, background: 'linear-gradient(135deg, rgba(155,142,196,0.15), rgba(124,111,191,0.08))', border: '1px solid rgba(155,142,196,0.25)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, flexShrink: 0, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 700 }}>
                  {user?.nombre?.[0] || 'U'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.nombre || 'Usuario'}</p>
                  <p style={{ fontSize: 13, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 500, padding: '5px 14px', borderRadius: 20, background: 'rgba(155,142,196,0.2)', color: 'var(--primary)' }}>
                  {user?.rol || 'admin'}
                </span>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>{user?.clinica_nombre}</span>
              </div>
            </motion.div>

            {/* Médicos */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <GlowingCard className="p-6 sm:p-8 lg:p-10">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h2 className="font-display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Médicos</h2>
                  <motion.button onClick={() => router.push('/dashboard/medicos')}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    style={{ fontSize: 12, padding: '5px 12px', borderRadius: 20, background: 'rgba(155,142,196,0.1)', color: 'var(--primary)', border: '1px solid rgba(155,142,196,0.2)', cursor: 'pointer' }}>
                    Ver todos
                  </motion.button>
                </div>
                <MedicosList clinicaId={clinicaId} />
              </GlowingCard>
            </motion.div>

            {/* Generador en Vivo — mini */}
            <GeneradorLiveWidget clinicaId={clinicaId} />
          </div>
        </div>
      </div>
    </div>
  )
}