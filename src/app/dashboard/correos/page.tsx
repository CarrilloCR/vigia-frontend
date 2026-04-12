'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../lib/axios'
import { useAuthStore } from '../../../store/auth'
import GlowingCard from '../../../components/reactbits/GlowingCard'
import FadeContent from '../../../components/reactbits/FadeContent'

interface EmailNotificacion {
  id: number
  email: string
  nombre: string
  activo: boolean
  clinica: number
}

const ArrowLeftIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const TrashIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
  </svg>
)
const MailIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)
const UserIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const ShieldIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

export default function CorreosPage() {
  const [emails, setEmails] = useState<EmailNotificacion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', nombre: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const { user } = useAuthStore()
  const { activeClinicaId } = useAuthStore(); const clinicaId = activeClinicaId || 1

  useEffect(() => { fetchEmails() }, [clinicaId])

  const fetchEmails = async () => {
    try {
      const res = await api.get(`/emails-notificacion/?clinica=${clinicaId}`)
      setEmails(res.data.results || res.data)
    } catch { } finally { setLoading(false) }
  }

  const handleAgregar = async () => {
    if (!form.email) return setError('El email es requerido.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Email inválido.')
    setSaving(true); setError('')
    try {
      await api.post('/emails-notificacion/', {
        email: form.email,
        nombre: form.nombre,
        clinica: clinicaId,
        activo: true,
      })
      setForm({ email: '', nombre: '' })
      setShowForm(false)
      setSuccess('Email agregado correctamente')
      setTimeout(() => setSuccess(''), 3000)
      await fetchEmails()
    } catch (err: any) {
      setError(err.response?.data?.non_field_errors?.[0] || 'Error al agregar el email.')
    } finally { setSaving(false) }
  }

  const handleEliminar = async (id: number) => {
    try {
      await api.patch(`/emails-notificacion/${id}/`, { activo: false })
      await fetchEmails()
    } catch { }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* HEADER */}
        <FadeContent direction="down" duration={0.5}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <h1 className="font-display" style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
                Correos de alertas
              </h1>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
                Correos que reciben notificaciones de alertas
              </p>
            </div>
            <motion.button
              onClick={() => { setShowForm(true); setError('') }}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 22px', borderRadius: 14, background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(155,142,196,0.3)' }}
            >
              <PlusIcon /> Agregar email
            </motion.button>
          </div>
        </FadeContent>

        {/* INFO CARD */}
        <FadeContent direction="up" delay={0.1} duration={0.4}>
          <div style={{ padding: '20px 24px', borderRadius: 20, background: 'rgba(155,142,196,0.08)', border: '1px solid rgba(155,142,196,0.2)', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ color: 'var(--primary)', flexShrink: 0 }}>
              <ShieldIcon />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                ¿Cómo funcionan las notificaciones?
              </p>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                Cada vez que presiones <strong style={{ color: 'var(--primary)' }}>Ejecutar análisis</strong>, se envía un único email con todas las alertas detectadas a todos los correos configurados aquí. Los usuarios de la clínica siempre reciben las notificaciones automáticamente.
              </p>
            </div>
          </div>
        </FadeContent>

        {/* SUCCESS */}
        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ padding: '14px 18px', borderRadius: 14, marginBottom: 20, background: 'rgba(160,196,181,0.1)', border: '1px solid rgba(160,196,181,0.3)', color: 'var(--success)', fontSize: 14 }}>
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* FORM */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              style={{ marginBottom: 24 }}>
              <GlowingCard className="p-6 sm:p-8 lg:p-10">
                <h2 className="font-display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>
                  Agregar correo
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Correo electrónico *</p>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
                        <MailIcon />
                      </div>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="notificaciones@clinica.com"
                        onKeyDown={e => e.key === 'Enter' && handleAgregar()}
                        style={{ width: '100%', padding: '13px 16px 13px 46px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 15, outline: 'none' }}
                      />
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nombre (opcional)</p>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
                        <UserIcon />
                      </div>
                      <input
                        value={form.nombre}
                        onChange={e => setForm({ ...form, nombre: e.target.value })}
                        placeholder="Ej: Dr. Administrador"
                        onKeyDown={e => e.key === 'Enter' && handleAgregar()}
                        style={{ width: '100%', padding: '13px 16px 13px 46px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 15, outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <p style={{ fontSize: 13, color: 'var(--danger)', marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(232,160,196,0.1)', border: '1px solid rgba(232,160,196,0.3)' }}>
                    {error}
                  </p>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                  <motion.button onClick={() => { setShowForm(false); setError('') }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    style={{ flex: 1, padding: '13px 0', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                    Cancelar
                  </motion.button>
                  <motion.button onClick={handleAgregar} disabled={saving}
                    whileHover={{ scale: saving ? 1 : 1.02 }} whileTap={{ scale: saving ? 1 : 0.98 }}
                    style={{ flex: 2, padding: '13px 0', borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    {saving ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
                    ) : <PlusIcon />}
                    {saving ? 'Guardando...' : 'Agregar correo'}
                  </motion.button>
                </div>
              </GlowingCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LISTA */}
        <FadeContent direction="up" delay={0.2} duration={0.4}>
          <GlowingCard className="p-6 sm:p-8 lg:p-10">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
                Correos configurados
              </h2>
              <span style={{ fontSize: 13, fontWeight: 500, padding: '5px 14px', borderRadius: 20, background: 'rgba(155,142,196,0.12)', color: 'var(--primary)', border: '1px solid rgba(155,142,196,0.2)' }}>
                {emails.length} correos
              </span>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1, 2, 3].map(i => (
                  <motion.div key={i} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    style={{ height: 72, borderRadius: 16, background: 'rgba(255,255,255,0.04)' }} />
                ))}
              </div>
            ) : emails.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
                  style={{ color: 'var(--muted)', display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <MailIcon />
                </motion.div>
                <p className="font-display" style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
                  Sin correos adicionales
                </p>
                <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
                  Los usuarios de la clínica siempre reciben las notificaciones
                </p>
                <motion.button onClick={() => setShowForm(true)}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  style={{ padding: '11px 24px', borderRadius: 12, background: 'rgba(155,142,196,0.12)', color: 'var(--primary)', border: '1px solid rgba(155,142,196,0.2)', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                  Agregar correo adicional
                </motion.button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <AnimatePresence>
                  {emails.map((e, i) => (
                    <motion.div key={e.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12, height: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16, fontWeight: 700 }}>
                        {e.nombre ? e.nombre[0].toUpperCase() : e.email[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {e.nombre && (
                          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{e.nombre}</p>
                        )}
                        <p style={{ fontSize: 14, color: e.nombre ? 'var(--muted)' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {e.email}
                        </p>
                      </div>
                      <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: 'rgba(160,196,181,0.12)', color: 'var(--success)', border: '1px solid rgba(160,196,181,0.2)', flexShrink: 0 }}>
                        Activo
                      </span>
                      <motion.button onClick={() => handleEliminar(e.id)}
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(232,160,196,0.1)', border: '1px solid rgba(232,160,196,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--danger)', flexShrink: 0 }}>
                        <TrashIcon />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </GlowingCard>
        </FadeContent>
    </div>
  )
}