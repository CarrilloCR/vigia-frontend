'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../lib/axios'
import { useAuthStore } from '../../../store/auth'
import { useToastStore } from '../../../store/toast'
import GlowingCard from '../../../components/reactbits/GlowingCard'
import FadeContent from '../../../components/reactbits/FadeContent'
import CountUp from '../../../components/reactbits/CountUp'
import ConfirmModal from '../../../components/ui/ConfirmModal'
import SedeSelector from '../../../components/ui/SedeSelector'
import SpotlightCard from '../../../components/reactbits/SpotlightCard'
import ScrollReveal from '../../../components/reactbits/ScrollReveal'
import GradientText from '../../../components/reactbits/GradientText'
import TiltedCard from '../../../components/reactbits/TiltedCard'
import Magnet from '../../../components/reactbits/Magnet'

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
const EditIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
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
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number }>({ open: false, id: 0 })
  const [editModal, setEditModal] = useState<{ open: boolean; cita: Cita | null }>({ open: false, cita: null })
  const [editEstado, setEditEstado] = useState('')
  const [mostrarCanceladas, setMostrarCanceladas] = useState(false)
  const [form, setForm] = useState({
    paciente: '', medico: '', fecha_hora_agendada: '', estado: 'agendada',
  })
  const router = useRouter()
  const { user } = useAuthStore()
  const toast = useToastStore()
  const { activeClinicaId } = useAuthStore(); const clinicaId = activeClinicaId || 1
  const [selectedSede, setSelectedSede] = useState<number | null>(null)

  useEffect(() => { fetchData() }, [clinicaId, selectedSede])

  const fetchData = async () => {
    try {
      const sedeParam = selectedSede ? `&sede=${selectedSede}` : ''
      const [citasRes, medicosRes, pacientesRes] = await Promise.all([
        api.get(`/citas/?clinica=${clinicaId}${sedeParam}`),
        api.get(`/medicos/?clinica=${clinicaId}`),
        api.get(`/pacientes/?clinica=${clinicaId}`),
      ])
      setCitas(citasRes.data.results || citasRes.data)
      setMedicos(medicosRes.data.results || medicosRes.data)
      setPacientes(pacientesRes.data.results || pacientesRes.data)
    } catch {
      toast.error('Error al cargar citas', 'No se pudo obtener la información de citas.')
    } finally { setLoading(false) }
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
      toast.success('Cita agendada', 'La cita fue creada exitosamente.')
    } catch {
      setError('Error al agendar la cita.')
      toast.error('Error al agendar', 'No se pudo crear la cita. Verifica los datos.')
    } finally { setSaving(false) }
  }

  const handleEliminar = async () => {
    try {
      await api.patch(`/citas/${confirmDelete.id}/`, { estado: 'cancelada' })
      await fetchData()
      toast.success('Cita cancelada', 'La cita fue cancelada correctamente.')
    } catch {
      toast.error('Error al cancelar', 'No se pudo cancelar la cita.')
    }
    setConfirmDelete({ open: false, id: 0 })
  }

  const abrirEditarCita = (c: Cita) => {
    setEditModal({ open: true, cita: c })
    setEditEstado(c.estado)
  }

  const handleGuardarEstado = async () => {
    if (!editModal.cita) return
    try {
      await api.patch(`/citas/${editModal.cita.id}/`, { estado: editEstado })
      await fetchData()
      setEditModal({ open: false, cita: null })
      toast.success('Estado actualizado', 'El estado de la cita fue actualizado.')
    } catch {
      toast.error('Error', 'No se pudo actualizar el estado.')
    }
  }

  const citasFiltradas = citas.filter(c => {
    const q = busqueda.toLowerCase()
    const coincide = `${c.paciente_nombre} ${c.medico_nombre}`.toLowerCase().includes(q)
    const estado = filtroEstado === 'todos' || c.estado === filtroEstado
    const medico = filtroMedico === 'todos' || String(c.medico) === filtroMedico
    const canceladaOk = mostrarCanceladas || c.estado !== 'cancelada'
    return coincide && estado && medico && canceladaOk
  })

  const stats = [
    { label: 'Total citas', value: citas.length, color: '#9B8EC4' },
    { label: 'Completadas', value: citas.filter(c => c.estado === 'completada').length, color: '#A0C4B5' },
    { label: 'Agendadas', value: citas.filter(c => c.estado === 'agendada').length, color: '#C4B5E8' },
    { label: 'Canceladas', value: citas.filter(c => c.estado === 'cancelada').length, color: '#E8A0C4' },
  ]

  // Relación médico-paciente — basado en citas filtradas
  const citasParaSidebar = filtroMedico !== 'todos' || filtroEstado !== 'todos' || busqueda ? citasFiltradas : citas
  const citasPorMedico = medicos.map(m => ({
    medico: m,
    total: citasParaSidebar.filter(c => c.medico === m.id).length,
    completadas: citasParaSidebar.filter(c => c.medico === m.id && c.estado === 'completada').length,
    ingresos: citasParaSidebar.filter(c => c.medico === m.id && c.estado === 'completada')
      .reduce((acc, c) => acc + parseFloat(c.ingreso_generado || '0'), 0),
  })).filter(m => m.total > 0).sort((a, b) => b.total - a.total)

  return (
    <>
        {/* HEADER */}
        <FadeContent direction="down" duration={0.5}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <h1 className="font-display" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}><GradientText text="Citas" className="font-display" /></h1>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>{citasFiltradas.length} registros</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <SedeSelector clinicaId={clinicaId} value={selectedSede} onChange={setSelectedSede} compact />
              <Magnet strength={0.3}>
                <motion.button onClick={() => { setShowModal(true); setError('') }}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 22px', borderRadius: 14, background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(155,142,196,0.3)' }}>
                  <PlusIcon /> Agendar cita
                </motion.button>
              </Magnet>
            </div>
          </div>
        </FadeContent>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 36 }}>
          {stats.map((s, i) => (
            <ScrollReveal key={i} delay={i * 0.09} direction="up">
              <TiltedCard tiltAmount={7} scaleOnHover={1.03}>
                <div style={{ padding: '24px', borderRadius: 24, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)' }}>
                  <p className="font-display" style={{ fontSize: 40, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 8 }}>
                    <CountUp to={s.value} duration={1} />
                  </p>
                  <p style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 500 }}>{s.label}</p>
                </div>
              </TiltedCard>
            </ScrollReveal>
          ))}
        </div>

        {/* GRID PRINCIPAL */}
        <div style={{ display: 'grid', gridTemplateColumns: citasPorMedico.length > 0 ? 'minmax(0,1fr) min(340px,36%)' : '1fr', gap: 24 }}>

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
                          padding: '9px 16px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none',
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

                {/* Toggle canceladas */}
                <motion.button onClick={() => setMostrarCanceladas(v => !v)}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  style={{
                    padding: '9px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none',
                    background: mostrarCanceladas ? 'rgba(232,160,196,0.15)' : 'rgba(255,255,255,0.03)',
                    color: mostrarCanceladas ? '#E8A0C4' : 'var(--muted)',
                    borderWidth: 1, borderStyle: 'solid',
                    borderColor: mostrarCanceladas ? 'rgba(232,160,196,0.4)' : 'var(--border)',
                  }}>
                  {mostrarCanceladas ? 'Ocultar canceladas' : 'Mostrar canceladas'}
                </motion.button>

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
              <GlowingCard className="p-6 sm:p-8 lg:p-10">
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

                            {/* Editar estado */}
                            <motion.button onClick={() => abrirEditarCita(c)}
                              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(155,142,196,0.08)', border: '1px solid rgba(155,142,196,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--primary)', flexShrink: 0 }}>
                              <EditIcon />
                            </motion.button>

                            {/* Cancelar cita */}
                            {c.estado !== 'cancelada' && (
                              <motion.button onClick={() => setConfirmDelete({ open: true, id: c.id })}
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(232,160,196,0.08)', border: '1px solid rgba(232,160,196,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--danger)', flexShrink: 0 }}>
                                <TrashIcon />
                              </motion.button>
                            )}
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
            <GlowingCard className="p-6 sm:p-8 lg:p-10">
              <h2 className="font-display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>
                Médicos por citas
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {citasPorMedico.map((m, i) => {
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
                {citasPorMedico.length === 0 && (
                  <p style={{ fontSize: 14, color: 'var(--muted)', textAlign: 'center', padding: '24px 0' }}>Sin datos de médicos</p>
                )}
              </div>
            </GlowingCard>
          </FadeContent>
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

      {/* MODAL EDITAR ESTADO */}
      <AnimatePresence>
        {editModal.open && editModal.cita && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(13,11,20,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={e => { if (e.target === e.currentTarget) setEditModal({ open: false, cita: null }) }}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              style={{ width: '100%', maxWidth: 400, background: 'var(--card)', backdropFilter: 'blur(24px)', border: '1px solid var(--border)', borderRadius: 24, padding: 32, boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>
              <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Editar cita</h2>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
                {editModal.cita.paciente_nombre} → {editModal.cita.medico_nombre}
              </p>
              <div>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estado</p>
                <select value={editEstado} onChange={e => setEditEstado(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, outline: 'none' }}>
                  {Object.entries(estadoConfig).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <motion.button onClick={() => setEditModal({ open: false, cita: null })} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ flex: 1, padding: '13px 0', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                  Cancelar
                </motion.button>
                <motion.button onClick={handleGuardarEstado} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ flex: 2, padding: '13px 0', borderRadius: 14, background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                  Guardar cambios
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={confirmDelete.open}
        title="Cancelar cita"
        message="¿Estás seguro de que deseas cancelar esta cita? Se marcará como cancelada."
        confirmLabel="Cancelar cita"
        variant="danger"
        onConfirm={handleEliminar}
        onCancel={() => setConfirmDelete({ open: false, id: 0 })}
      />
    </>
  )
}