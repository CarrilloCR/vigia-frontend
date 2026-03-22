'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '../../../../lib/axios'
import { Medico, Alerta, RegistroKPI } from '../../../../types'

const kpiLabel: Record<string, string> = {
  tasa_cancelacion: 'Tasa de Cancelación',
  tasa_noshow: 'Tasa de No-Show',
  ingresos_dia: 'Ingresos del Día',
  ocupacion_agenda: 'Ocupación de Agenda',
  ticket_promedio: 'Ticket Promedio',
  pacientes_nuevos: 'Pacientes Nuevos',
  retencion_90: 'Retención 90 días',
  nps: 'NPS',
  citas_reagendadas: 'Citas Reagendadas',
}

const severidadColor: Record<string, string> = {
  baja: '#A0C4B5',
  media: '#C4B5E8',
  alta: '#9B8EC4',
  critica: '#E8A0C4',
}

export default function MedicoPage() {
  const [medico, setMedico] = useState<Medico | null>(null)
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [kpis, setKpis] = useState<RegistroKPI[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const id = params.id

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const [medicoRes, alertasRes, kpisRes] = await Promise.all([
        api.get(`/medicos/${id}/`),
        api.get(`/alertas/?medico=${id}`),
        api.get(`/kpis/?medico=${id}`),
      ])
      setMedico(medicoRes.data)
      setAlertas(alertasRes.data.results || alertasRes.data)
      setKpis(kpisRes.data.results || kpisRes.data)
    } catch (err) {
      console.error('Error cargando datos del médico:', err)
    } finally {
      setLoading(false)
    }
  }

  const calcularPromedioKPI = (tipo: string) => {
    const registros = kpis.filter(k => k.tipo === tipo)
    if (registros.length === 0) return 'Sin datos'
    const promedio = registros.reduce((acc, k) => acc + k.valor, 0) / registros.length
    return promedio.toFixed(1)
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Cargando perfil...</p>
      </main>
    )
  }

  if (!medico) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <p style={{ color: 'var(--color-danger)' }}>Médico no encontrado</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-background)' }}>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-opacity hover:opacity-70"
          style={{ backgroundColor: 'var(--color-card)' }}
        >
          ←
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: 'var(--color-primary)' }}>
            {medico.nombre[0]}{medico.apellido[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-main)' }}>
              Dr. {medico.nombre} {medico.apellido}
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{medico.especialidad}</p>
          </div>
        </div>
      </div>

      {/* KPIs promedio */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Object.entries(kpiLabel).map(([tipo, label]) => (
          <div key={tipo} className="p-4 rounded-2xl shadow-sm" style={{ backgroundColor: 'var(--color-card)' }}>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
              {calcularPromedioKPI(tipo)}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Promedio histórico</p>
          </div>
        ))}
      </div>

      {/* Alertas del médico */}
      <div className="rounded-2xl shadow-sm p-6 mb-6" style={{ backgroundColor: 'var(--color-card)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-main)' }}>
          Historial de Alertas
        </h2>
        {alertas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">✅</p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Sin alertas registradas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alertas.map(alerta => (
              <div key={alerta.id} className="p-3 rounded-xl border" style={{ borderColor: 'var(--color-secondary)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: severidadColor[alerta.severidad] }}>
                    {alerta.severidad}
                  </span>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-main)' }}>
                    {kpiLabel[alerta.tipo_kpi] || alerta.tipo_kpi}
                  </span>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text-muted)' }}>
                    {alerta.estado}
                  </span>
                </div>
                <p className="text-sm" style={{ color: 'var(--color-text-main)' }}>{alerta.mensaje}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  {new Date(alerta.creada_en).toLocaleString('es-CR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registros KPI recientes */}
      <div className="rounded-2xl shadow-sm p-6" style={{ backgroundColor: 'var(--color-card)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-main)' }}>
          Registros KPI Recientes
        </h2>
        {kpis.length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>Sin registros aún</p>
        ) : (
          <div className="space-y-2">
            {kpis.slice(0, 10).map(kpi => (
              <div key={kpi.id} className="flex items-center justify-between p-3 rounded-xl"
                style={{ backgroundColor: 'var(--color-background)' }}>
                <span className="text-sm" style={{ color: 'var(--color-text-main)' }}>
                  {kpiLabel[kpi.tipo] || kpi.tipo}
                </span>
                <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                  {kpi.valor}
                </span>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {new Date(kpi.fecha_hora).toLocaleDateString('es-CR')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}