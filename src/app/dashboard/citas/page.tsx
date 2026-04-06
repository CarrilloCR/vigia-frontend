'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../lib/axios'
import { useAuthStore } from '../../../store/auth'
import Aurora from '../../../components/reactbits/Aurora'
import GlowingCard from '../../../components/reactbits/GlowingCard'
import FadeContent from '../../../components/reactbits/FadeContent'
import CountUp from '../../../components/reactbits/CountUp'
import ThemeToggle from '../../../components/ui/ThemeToggle'

interface Cita {
  id: number
  paciente: number
  paciente_nombre: string
  medico: number
  medico_nombre: string
  fecha_hora_agendada: string
  estado: string
  ingreso_generado: string
  motivo_cancelacion: string
}

interface Medico { id: number; nombre: string; apellido: string; especialidad: string; activo: boolean}
interface Paciente { id: number; nombre: string; apellido: string }

const estadoConfig: Record<string, { label: string; color: string }> = {
  agendada:   { label: 'Agendada',   color: '#9B8EC4' },
  completada: { label: 'Completada', color: '#A0C4B5' },
  cancelada:  { label: 'Cancelada',  color: '#E8A0C4' },
  no_show:    { label: 'No Show',    color: '#C4B5E8' },
  reagendada: { label: 'Reagendada', color: '#E8C4A0' },
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
const SearchIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const CalendarIcon = () => (
  <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const TrashIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
  </svg>
)

export default function CitasPage() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroMedico, setFiltroMedico] = useState('todos')
  const [form, setForm] = useState({
    paciente: '', medico: '', fecha_hora_agendada: '', estado: 'agendada',
  })
  const router = useRouter()
  const { user } = useAuthStore()
  const clinicaId = user?.clinica_id || 1

  useEffect(() => { fetchData() }, [clinicaId])

  const fetchData = async () => {
    try {
      const [citasRes, medicosRes, pacientesRes] = await Promise.all([
        api.get(`/citas/?clinica=${clinicaId}`),
        api.get(`/medicos/?clinica=${clinicaId}`),
        api.get(`/pacientes/?clinica=${clinicaId}`),
      ])
      setCitas(citasRes.data.results || citasRes.data)
      setMedicos(medicosRes.data.results || medicosRes.data)
      setPacientes(pacientesRes.data.results || pacientesRes.data)
    } catch { } finally { setLoading(false) }
  }

  const handleGuardar = async () => {
    if (!form.paciente || !form.medico || !form.fecha_hora_agendada)
      return setError('Paciente, médico y fecha son requeridos.')
    setSaving(true); setError('')
    try {
      await api.post('/citas/', {
        paciente: parseInt(form.paciente),
        medico: parseInt(form.medico),
        clinica: clinicaId,
        fecha_hora_agendada: form.fecha_hora_agendada,
        estado: form.estado,
        ingreso_generado: 0,
      })
      await fetchData()
      setShowModal(false)
      setForm({ paciente: '', medico: '', fecha_hora_agendada: '', estado: 'agendada' })
    } catch { setError('Error al agendar la cita.') } finally { setSaving(false) }
  }

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta cita?')) return
    try {
      await api.delete(`/citas/${id}/`)
      await fetchData()
    } catch { }
  }

  const citasFiltradas = citas.filter(c => {
    const q = busqueda.toLowerCase()
    const coincide = `${c.paciente_nombre} ${c.medico_nombre}`.toLowerCase().includes(q)
    const estado = filtroEstado === 'todos' || c.estado === filtroEstado
    const medico = filtroMedico === 'todos' || String(c.medico) === filtroMedico
    return coincide && estado && medico
  })

  const stats = [
    { label: 'Total citas', value: citas.length, color: '#9B8EC4' },
    { label: 'Completadas', value: citas.filter(c => c.estado === 'completada').length, color: '#A0C4B5' },
    { label: 'Agendadas', value: citas.filter(c => c.estado === 'agendada').length, color: '#C4B5E8' },
    { label: 'Canceladas', value: citas.filter(c => c.estado === 'cancelada').length, color: '#E8A0C4' },
  ]

  // Relación médico-paciente — top médicos por citas
  const citasPorMedico = medicos.map(m => ({
    medico: m,
    total: citas.filter(c => c.medico === m.id).length,
    completadas: citas.filter(c => c.medico === m.id && c.estado === 'completada').length,
    ingresos: citas.filter(c => c.medico === m.id && c.estado === 'completada')
      .reduce((acc, c) => acc + parseFloat(c.ingreso_generado || '0'), 0),
  })).sort((a, b) => b.total - a.total)

  return (
    <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: 'var(--void)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <Aurora colorStops={['#9B8EC4', '#7C6FBF', '#C4B5E8']} amplitude={0.4} speed={0.1} />
      </div>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.03, backgroundImage: 'linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      <div style={{ position: 'relative', zIndex: 10, padding: '32px 48px', maxWidth: 1600, margin: '0 auto' }}>

        {/* HEADER */}
        <FadeContent direction="down" duration={0.5}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <motion.button onClick={() => router.push('/dashboard')}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text)' }}>
                <ArrowLeftIcon />
              </motion.button>
              <div>
                <h1 className="font-display" style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>Citas</h1>
                <p style={{ fontSize: 15, color: 'var(--muted)', marginTop: 4 }}>{user?.clinica_nombre} · {citasFiltradas.length} registros</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <motion.button onClick={() => { setShowModal(true); setError('') }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 22px', borderRadius: 14, background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(155,142,196,0.3)' }}>
                <PlusIcon /> Agendar cita
              </motion.button>
              <ThemeToggle />
            </div>
          </div>
        </FadeContent>

        {/* STATS */}
        <FadeContent direction="up" delay={0.1} duration={0.5}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 36 }}>
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                style={{ padding: '24px', borderRadius: 24, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)' }}>
                <p className="font-display" style={{ fontSize: 40, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 8 }}>
                  <CountUp to={s.value} duration={1} />
                </p>
                <p style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 500 }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </FadeContent>

        {/* GRID PRINCIPAL */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>

          {/* LISTA CITAS */}
          <div>
            {/* Filtros */}
            <FadeContent direction="up" delay={0.2} duration={0.4}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
                    <SearchIcon />
                  </div>
                  <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
                    placeholder="Buscar paciente o médico..."
                    style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 12, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, outline: 'none' }} />
                </div>

                {/* Filtro estado */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['todos', ...Object.keys(estadoConfig)].map(e => {
                    const cfg = estadoConfig[e]
                    return (
                      <motion.button key={e} onClick={() => setFiltroEstado(e)}
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        style={{
                          padding: '8px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none',
                          background: filtroEstado === e ? `${cfg?.color || 'var(--primary)'}25` : 'rgba(255,255,255,0.03)',
                          color: filtroEstado === e ? (cfg?.color || 'var(--primary)') : 'var(--muted)',
                          borderWidth: 1, borderStyle: 'solid',
                          borderColor: filtroEstado === e ? `${cfg?.color || 'var(--primary)'}50` : 'var(--border)',
                        }}>
                        {e === 'todos' ? 'Todos' : cfg?.label}
                      </motion.button>
                    )
                  })}
                </div>

                {/* Filtro médico */}
                <select value={filtroMedico} onChange={e => setFiltroMedico(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
                  <option value="todos">Todos los médicos</option>
                  {medicos.map(m => (
                    <option key={m.id} value={String(m.id)}>Dr. {m.nombre} {m.apellido}</option>
                  ))}
                </select>
              </div>
            </FadeContent>

            <FadeContent direction="up" delay={0.25} duration={0.4}>
              <GlowingCard className="p-8">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <h2 className="font-display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Historial de citas</h2>
                  <span style={{ fontSize: 13, fontWeight: 500, padding: '5px 14px', borderRadius: 20, background: 'rgba(155,142,196,0.12)', color: 'var(--primary)', border: '1px solid rgba(155,142,196,0.2)' }}>
                    {citasFiltradas.length} citas
                  </span>
                </div>

                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[1,2,3,4,5].map(i => (
                      <motion.div key={i} animate={{ opacity: [0.3,0.6,0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i*0.15 }}
                        style={{ height: 72, borderRadius: 16, background: 'rgba(255,255,255,0.04)' }} />
                    ))}
                  </div>
                ) : citasFiltradas.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 0' }}>
                    <motion.div animate={{ y: [0,-8,0] }} transition={{ duration: 3, repeat: Infinity }}
                      style={{ color: 'var(--muted)', display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                      <CalendarIcon />
                    </motion.div>
                    <p style={{ fontSize: 16, color: 'var(--muted)' }}>Sin citas que mostrar</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 560, overflowY: 'auto', paddingRight: 4 }}>
                    <AnimatePresence>
                      {citasFiltradas.map((c, i) => {
                        const cfg = estadoConfig[c.estado] || estadoConfig.agendada
                        const ingreso = parseFloat(c.ingreso_generado || '0')
                        return (
                          <motion.div key={c.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ delay: i * 0.02 }}
                            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: `1px solid ${cfg.color}25` }}>

                            {/* Dot estado */}
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, boxShadow: `0 0 6px ${cfg.color}`, flexShrink: 0 }} />

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                                  {c.paciente_nombre || `Paciente #${c.paciente}`}
                                </p>
                                <span style={{ fontSize: 11, color: 'var(--muted)' }}>→</span>
                                <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                                  {c.medico_nombre || `Médico #${c.medico}`}
                                </p>
                              </div>
                              <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                                {new Date(c.fecha_hora_agendada).toLocaleString('es-CR')}
                              </p>
                            </div>

                            {/* Ingreso */}
                            {ingreso > 0 && (
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#A0C4B5', flexShrink: 0 }}>
                                ${ingreso.toFixed(2)}
                              </span>
                            )}

                            {/* Estado badge */}
                            <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}30`, flexShrink: 0 }}>
                              {cfg.label}
                            </span>

                            {/* Eliminar */}
                            <motion.button onClick={() => handleEliminar(c.id)}
                              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(232,160,196,0.08)', border: '1px solid rgba(232,160,196,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--danger)', flexShrink: 0 }}>
                              <TrashIcon />
                            </motion.button>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </GlowingCard>
            </FadeContent>
          </div>

          {/* SIDEBAR — RELACIÓN MÉDICO-PACIENTE */}
          <FadeContent direction="right" delay={0.3} duration={0.4}>
            <GlowingCard className="p-8">
              <h2 className="font-display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>
                Médicos por citas
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {citasPorMedico.filter(m => m.total > 0).map((m, i) => {
                  const maxCitas = citasPorMedico[0]?.total || 1
                  const pct = (m.total / maxCitas) * 100
                  return (
                    <motion.div key={m.medico.id}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.06 }}
                      onClick={() => router.push(`/dashboard/medico/${m.medico.id}`)}
                      style={{ cursor: 'pointer', padding: '16px 18px', borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', transition: 'all 0.2s' }}
                      whileHover={{ background: 'rgba(155,142,196,0.08)' } as any}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700 }}>
                          {m.medico.nombre[0]}{m.medico.apellido[0]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            Dr. {m.medico.nombre} {m.medico.apellido}
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--muted)' }}>{m.medico.especialidad}</p>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p className="font-display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', lineHeight: 1 }}>{m.total}</p>
                          <p style={{ fontSize: 11, color: 'var(--muted)' }}>citas</p>
                        </div>
                      </div>

                      {/* Barra progreso */}
                      <div style={{ height: 4, borderRadius: 2, background: 'rgba(155,142,196,0.12)', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.3 + i * 0.06 }}
                          style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, var(--primary), var(--accent))' }}
                        />
                      </div>

                      {/* Stats rápidos */}
                      <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                        <span style={{ fontSize: 11, color: '#A0C4B5' }}>✓ {m.completadas} completadas</span>
                        <span style={{ fontSize: 11, color: '#A0C4B5' }}>$ {m.ingresos.toFixed(0)}</span>
                      </div>
                    </motion.div>
                  )
                })}
                {citasPorMedico.filter(m => m.total > 0).length === 0 && (
                  <p style={{ fontSize: 14, color: 'var(--muted)', textAlign: 'center', padding: '24px 0' }}>Sin datos de médicos</p>
                )}
              </div>
            </GlowingCard>
          </FadeContent>
        </div>
      </div>

      {/* MODAL AGENDAR */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(13,11,20,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              style={{ width: '100%', maxWidth: 480, background: 'var(--card)', backdropFilter: 'blur(24px)', border: '1px solid var(--border)', borderRadius: 24, padding: 36, boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>

              <h2 className="font-display" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                Agendar cita
              </h2>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>
                Selecciona el paciente, médico y fecha
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Paciente */}
                <div>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Paciente *</p>
                  <select value={form.paciente} onChange={e => setForm({ ...form, paciente: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: form.paciente ? 'var(--text)' : 'var(--muted)', fontSize: 14, outline: 'none' }}>
                    <option value="">Seleccionar paciente...</option>
                    {pacientes.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
                    ))}
                  </select>
                </div>

                {/* Médico */}
                <div>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Médico *</p>
                  <select value={form.medico} onChange={e => setForm({ ...form, medico: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: form.medico ? 'var(--text)' : 'var(--muted)', fontSize: 14, outline: 'none' }}>
                    <option value="">Seleccionar médico...</option>
                    {medicos.filter(m => m.activo).map(m => (
                      <option key={m.id} value={m.id}>Dr. {m.nombre} {m.apellido} — {m.especialidad}</option>
                    ))}
                  </select>
                </div>

                {/* Fecha */}
                <div>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fecha y hora *</p>
                  <input type="datetime-local" value={form.fecha_hora_agendada}
                    onChange={e => setForm({ ...form, fecha_hora_agendada: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, outline: 'none' }} />
                </div>

                {/* Estado */}
                <div>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estado</p>
                  <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, outline: 'none' }}>
                    {Object.entries(estadoConfig).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <p style={{ marginTop: 16, fontSize: 13, color: 'var(--danger)', padding: '10px 14px', borderRadius: 10, background: 'rgba(232,160,196,0.1)', border: '1px solid rgba(232,160,196,0.3)' }}>
                  {error}
                </p>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <motion.button onClick={() => setShowModal(false)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ flex: 1, padding: '14px 0', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
                  Cancelar
                </motion.button>
                <motion.button onClick={handleGuardar} disabled={saving} whileHover={{ scale: saving ? 1 : 1.02 }} whileTap={{ scale: saving ? 1 : 0.98 }}
                  style={{ flex: 2, padding: '14px 0', borderRadius: 14, background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', fontSize: 15, fontWeight: 600, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {saving && <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />}
                  {saving ? 'Agendando...' : 'Agendar cita'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}