'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../../lib/axios'
import { Notificacion } from '../../../types'

const canalIcon: Record<string, string> = {
  email: '📧',
  whatsapp: '💬',
  sms: '📱',
}

const estadoColor: Record<string, string> = {
  pendiente: '#C4B5E8',
  enviada: '#9B8EC4',
  entregada: '#A0C4B5',
  leida: '#A0C4B5',
  fallida: '#E8A0C4',
}

export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchNotificaciones()
  }, [])

  const fetchNotificaciones = async () => {
    try {
      const res = await api.get('/notificaciones/')
      setNotificaciones(res.data.results || res.data)
    } catch (err) {
      console.error('Error cargando notificaciones:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-background)' }}>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-card)' }}
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-main)' }}>Notificaciones</h1>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Historial de notificaciones enviadas</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: notificaciones.length, color: 'var(--color-primary)' },
          { label: 'Pendientes', value: notificaciones.filter(n => n.estado === 'pendiente').length, color: 'var(--color-secondary)' },
          { label: 'Enviadas', value: notificaciones.filter(n => n.estado === 'enviada').length, color: 'var(--color-success)' },
          { label: 'Fallidas', value: notificaciones.filter(n => n.estado === 'fallida').length, color: 'var(--color-danger)' },
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-2xl shadow-sm" style={{ backgroundColor: 'var(--color-card)' }}>
            <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Lista */}
      <div className="rounded-2xl shadow-sm p-6" style={{ backgroundColor: 'var(--color-card)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-main)' }}>
          Historial
        </h2>

        {loading ? (
          <p style={{ color: 'var(--color-text-muted)' }}>Cargando...</p>
        ) : notificaciones.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-2">🔔</p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Sin notificaciones aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notificaciones.map(notif => (
              <div key={notif.id} className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-secondary)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{canalIcon[notif.canal] || '🔔'}</span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text-main)' }}>
                        {notif.destinatario}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        Alerta #{notif.alerta} · {notif.canal}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: estadoColor[notif.estado] || 'var(--color-secondary)' }}>
                      {notif.estado}
                    </span>
                    {notif.enviada_en && (
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {new Date(notif.enviada_en).toLocaleString('es-CR')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}