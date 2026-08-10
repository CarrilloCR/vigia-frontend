'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/auth'

const PLANES_RESUMEN = [
  { nombre: 'Gratis', precio: '$0', color: 'var(--muted)', desc: '5 usuarios · 1 sede · carga por CSV', nota: 'Sin IA, integraciones ni correo' },
  { nombre: 'Básico', precio: '$29', color: 'var(--primary)', desc: '20 usuarios · 2 sedes', nota: '+ IA, integraciones y notificaciones por correo' },
  { nombre: 'Profesional', precio: '$79', color: '#6496DC', desc: '100 usuarios · 4 sedes', nota: 'Todo lo de Básico, a mayor escala' },
  { nombre: 'Enterprise', precio: 'A convenir', color: '#E8C490', desc: '+100 usuarios · sedes ilimitadas', nota: 'Personalización · por acuerdo con Vigía' },
]

/**
 * Compuerta de Términos de Servicio.
 *
 * Al entrar al dashboard, si la clínica aún no aceptó los Términos, el
 * administrador (o superadmin) que la representa debe aceptarlos una sola vez.
 * Otros roles no ven la compuerta. No es descartable: se acepta o se cierra sesión.
 */
export default function TerminosGate() {
  const router = useRouter()
  const user = useAuthStore(s => s.user)
  const activeClinicaId = useAuthStore(s => s.activeClinicaId)
  const clearAuth = useAuthStore(s => s.clearAuth)

  const [necesita, setNecesita] = useState(false)
  const [aceptando, setAceptando] = useState(false)
  const [leidoHasta, setLeidoHasta] = useState(false)
  const [paso, setPaso] = useState<'tos' | 'planes'>('tos')

  const rol = user?.rol ?? ''
  const esResponsable = rol === 'admin' || rol === 'superadmin'
  const clinicaId = (rol === 'superadmin' ? activeClinicaId : null) ?? user?.clinica_id ?? null
  // Aceptación por USUARIO: cada cuenta nueva ve los términos + planes una vez,
  // sin importar el rol. El responsable además persiste la aceptación de la clínica.
  const tosKey = user?.id ? `vigia-tos-${user.id}` : null

  useEffect(() => {
    if (!tosKey) return
    try { if (localStorage.getItem(tosKey) !== '1') setNecesita(true) } catch { setNecesita(true) }
  }, [tosKey])

  const aceptar = async () => {
    setAceptando(true)
    try {
      if (esResponsable && clinicaId) {
        const { default: api } = await import('../lib/axios')
        // clinica_id es necesario para superadmin (no pertenece a una clínica fija).
        await api.post('/facturacion/aceptar-terminos/', { clinica_id: clinicaId })
      }
      try { if (tosKey) localStorage.setItem(tosKey, '1') } catch { /* */ }
      setPaso('planes')  // tras aceptar, muestra el aviso de planes/facturación
    } catch {
      // Si falla la persistencia del responsable, no cerramos el gate.
    } finally {
      setAceptando(false)
    }
  }

  return (
    <AnimatePresence>
      {necesita && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(6,4,18,0.85)', backdropFilter: 'blur(12px)', padding: 20 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            style={{ width: '100%', maxWidth: 640, maxHeight: '88vh', borderRadius: 24, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            {paso === 'tos' ? (
              <>
                {/* Header */}
                <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid var(--border)' }}>
                  <p className="eyebrow" style={{ color: 'var(--primary)', marginBottom: 8 }}>Antes de continuar</p>
                  <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Términos de Servicio</h2>
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>
                    {esResponsable
                      ? 'Como responsable de la clínica, acepta estos términos para activar Vigía.'
                      : 'Para usar Vigía, revisa y acepta los términos del servicio.'}
                  </p>
                </div>

                {/* Cuerpo con scroll */}
                <div
                  onScroll={(e) => {
                    const el = e.currentTarget
                    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) setLeidoHasta(true)
                  }}
                  style={{ padding: '22px 28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}
                >
                  {[
                    ['1. Objeto del servicio', 'Vigía es un sistema de alertas inteligentes para clínicas médicas que monitorea indicadores (KPIs), detecta anomalías y notifica al equipo por correo y WhatsApp. El servicio se ofrece "tal cual" con fines de apoyo a la gestión; no sustituye el criterio clínico ni administrativo del personal.'],
                    ['2. Cuenta y responsabilidad', 'El administrador es responsable de los usuarios que invita, de los roles que asigna y del uso que su equipo haga de la plataforma. Debe mantener la confidencialidad de las credenciales y notificar cualquier acceso no autorizado.'],
                    ['3. Datos y privacidad', 'Los datos de pacientes, citas y métricas ingresados pertenecen a la clínica. Vigía los procesa únicamente para prestar el servicio (cálculo de KPIs, detección de anomalías y generación de alertas). No se venden ni se comparten con terceros ajenos al servicio.'],
                    ['4. Planes y facturación', 'Los planes definen límites de sedes, usuarios y funciones (IA, WhatsApp, motor automático). En este entorno la suscripción es una simulación y no genera ningún cobro real. La clínica puede cambiar de plan en cualquier momento desde Configuración → Facturación.'],
                    ['5. Uso aceptable', 'Está prohibido usar Vigía para fines ilícitos, cargar datos sobre los que no se tienen derechos, o intentar vulnerar la seguridad de la plataforma. El incumplimiento puede suspender el acceso.'],
                    ['6. Disponibilidad y cambios', 'El servicio puede actualizarse o interrumpirse por mantenimiento. Estos términos pueden modificarse; los cambios relevantes se comunicarán dentro de la plataforma.'],
                  ].map(([titulo, texto]) => (
                    <div key={titulo}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>{titulo}</h3>
                      <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65, margin: 0 }}>{texto}</p>
                    </div>
                  ))}
                  <p style={{ fontSize: 12, color: 'var(--muted)', opacity: 0.7, textAlign: 'center', marginTop: 4 }}>
                    Desplázate hasta el final para habilitar el botón de aceptar.
                  </p>
                </div>

                {/* Footer */}
                <div style={{ padding: '18px 28px', borderTop: '1px solid var(--border)', display: 'flex', gap: 12, justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => { clearAuth(); window.location.href = '/' }}
                    style={{ padding: '11px 20px', borderRadius: 12, background: 'var(--glass)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
                  >
                    No acepto · salir
                  </button>
                  <motion.button
                    onClick={aceptar}
                    disabled={!leidoHasta || aceptando}
                    whileHover={leidoHasta && !aceptando ? { scale: 1.02 } : {}}
                    whileTap={leidoHasta && !aceptando ? { scale: 0.97 } : {}}
                    style={{ padding: '11px 24px', borderRadius: 12, border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: leidoHasta && !aceptando ? 'pointer' : 'not-allowed', opacity: leidoHasta && !aceptando ? 1 : 0.45, background: 'linear-gradient(135deg, var(--primary), var(--accent))', boxShadow: leidoHasta ? '0 4px 18px rgba(0,214,178,0.35)' : 'none' }}
                  >
                    {aceptando ? 'Aceptando…' : 'Acepto los términos'}
                  </motion.button>
                </div>
              </>
            ) : (
              <>
                {/* Header planes */}
                <div style={{ padding: '24px 28px 18px', borderBottom: '1px solid var(--border)' }}>
                  <p className="eyebrow" style={{ color: 'var(--primary)', marginBottom: 8 }}>Tu clínica está activa</p>
                  <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Elige cómo empezar</h2>
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>
                    Comienzas en el plan <strong style={{ color: 'var(--text)' }}>Gratis</strong>. Puedes mejorar cuando quieras para desbloquear IA, integraciones y notificaciones por correo.
                  </p>
                </div>

                {/* Planes */}
                <div style={{ padding: '20px 28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {PLANES_RESUMEN.map(p => (
                    <div key={p.nombre} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '14px 16px', borderRadius: 14, background: 'var(--sunken)', border: '1px solid var(--border)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: p.color, margin: 0 }}>{p.nombre}</p>
                          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{p.precio}{p.precio.startsWith('$') && p.precio !== '$0' ? '/mes' : ''}</span>
                        </div>
                        <p style={{ fontSize: 12.5, color: 'var(--text)', margin: '3px 0 0' }}>{p.desc}</p>
                        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '2px 0 0' }}>{p.nota}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer planes */}
                <div style={{ padding: '18px 28px', borderTop: '1px solid var(--border)', display: 'flex', gap: 12, justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => { setNecesita(false); if (typeof window !== 'undefined') window.dispatchEvent(new Event('vigia-tos-done')) }}
                    style={{ padding: '11px 20px', borderRadius: 12, background: 'var(--glass)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
                  >
                    {esResponsable ? 'Continuar en Gratis' : 'Entendido'}
                  </button>
                  {esResponsable && (
                    <motion.button
                      onClick={() => { setNecesita(false); if (typeof window !== 'undefined') window.dispatchEvent(new Event('vigia-tos-done')); router.push('/dashboard/configuracion') }}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      style={{ padding: '11px 24px', borderRadius: 12, border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg, var(--primary), var(--accent))', boxShadow: '0 4px 18px rgba(0,214,178,0.35)' }}
                    >
                      Ver planes
                    </motion.button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
