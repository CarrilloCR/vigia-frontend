'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../lib/axios'
import { Alerta } from '../../types'

const severidadColor: Record<string, string> = {
  baja: '#A0C4B5',
  media: '#C4B5E8',
  alta: '#9B8EC4',
  critica: '#E8A0C4',
}

const severidadLabel: Record<string, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Crítica',
}

const kpiLabel: Record<string, string> = {
  tasa_cancelacion: 'Tasa de Cancelación',
  tasa_noshow: 'Tasa de No-Show',
  ingresos_dia: 'Ingresos del Día',
  ocupacion_agenda: 'Ocupación de Agenda',
}

export default function DashboardPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)
  const [motorLoading, setMotorLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchAlertas()
  }, [])

  const fetchAlertas = async () => {
    try {
      const res = await api.get('/alertas/?estado=activa')
      setAlertas(res.data.results || res.data)
    } catch (err) {
      console.error('Error cargando alertas:', err)
    } finally {
      setLoading(false)
    }
  }

  const ejecutarMotor = async () => {
    setMotorLoading(true)
    try {
      await api.post('/motor/ejecutar/', { clinica_id: 1 })
      await fetchAlertas()
    } catch (err) {
      console.error('Error ejecutando motor:', err)
    } finally {
      setMotorLoading(false)
    }
  }

  const marcarRevisada = async (id: number) => {
    try {
      await api.post(`/alertas/${id}/marcar_revisada/`)
      setAlertas(alertas.filter(a => a.id !== id))
    } catch (err) {
      console.error('Error:', err)
    }
  }

  return (
    <main className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-background)' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
            <span className="text-white font-bold">V</span>
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-main)' }}>Vigía</h1>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Clínica San José</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={ejecutarMotor}
            disabled={motorLoading}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-success)' }}
          >
            {motorLoading ? 'Analizando...' : '⚡ Ejecutar análisis'}
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-text-main)' }}
          >
            Cerrar sesión
          </button>
          <div className="text-right">
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-main)' }}>
              {new Date().toLocaleDateString('es-CR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Panel de alertas</p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Alertas Activas', value: alertas.length, color: 'var(--color-primary)' },
          { label: 'Críticas', value: alertas.filter(a => a.severidad === 'critica').length, color: 'var(--color-danger)' },
          { label: 'Altas', value: alertas.filter(a => a.severidad === 'alta').length, color: 'var(--color-secondary)' },
          { label: 'Medias/Bajas', value: alertas.filter(a => ['media', 'baja'].includes(a.severidad)).length, color: 'var(--color-success)' },
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-2xl shadow-sm" style={{ backgroundColor: 'var(--color-card)' }}>
            <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Lista de alertas */}
      <div className="rounded-2xl shadow-sm p-6" style={{ backgroundColor: 'var(--color-card)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-main)' }}>
          Alertas Activas
        </h2>

        {loading ? (
          <p style={{ color: 'var(--color-text-muted)' }}>Cargando alertas...</p>
        ) : alertas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-2">✅</p>
            <p className="font-medium" style={{ color: 'var(--color-text-main)' }}>Todo en orden</p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No hay alertas activas en este momento</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alertas.map(alerta => (
              <div key={alerta.id} className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-secondary)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: severidadColor[alerta.severidad] }}>
                        {severidadLabel[alerta.severidad]}
                      </span>
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-main)' }}>
                        {kpiLabel[alerta.tipo_kpi] || alerta.tipo_kpi}
                      </span>
                    </div>
                    <p className="text-sm mb-1" style={{ color: 'var(--color-text-main)' }}>{alerta.mensaje}</p>
                    {alerta.recomendacion && (
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        💡 {alerta.recomendacion}
                      </p>
                    )}
                    <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                      {new Date(alerta.creada_en).toLocaleString('es-CR')}
                    </p>
                  </div>
                  <button
                    onClick={() => marcarRevisada(alerta.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-white shrink-0"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    Marcar revisada
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}