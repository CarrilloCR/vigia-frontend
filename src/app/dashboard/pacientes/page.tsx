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
import StarBorder from '../../../components/reactbits/StarBorder'
import GlareHover from '../../../components/reactbits/GlareHover'

interface Paciente {
  id: number
  nombre: string
  apellido: string
  telefono: string
  email: string
  fecha_nacimiento: string
  primera_visita: string
  clinica: number
  sede: number | null
  sede_nombre: string | null
  activo: boolean
}

interface Sede { id: number; nombre: string }

const colores = ['#00C9A7','#FF6B6B','#00C9A7','#4A9EF0','#00A88A','#B06EF5','#00C9A7','#FFD166']

function getColor(nombre: string) {
  let hash = 0
  for (let i = 0; i < nombre.length; i++) hash = nombre.charCodeAt(i) + ((hash << 5) - hash)
  return colores[Math.abs(hash) % colores.length]
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
const EditIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const TrashIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
  </svg>
)
const SearchIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const UserIcon = () => (
  <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)

function calcularEdad(fecha: string) {
  if (!fecha) return null
  const hoy = new Date()
  const nac = new Date(fecha)
  let edad = hoy.getFullYear() - nac.getFullYear()
  const m = hoy.getMonth() - nac.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--
  return edad
}

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [citas, setCitas] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<Paciente | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number; name: string }>({ open: false, id: 0, name: '' })
  const [mostrarInactivos, setMostrarInactivos] = useState(false)
  const [displayLimit, setDisplayLimit] = useState(25)
  const [confirmLimpiarInactivos, setConfirmLimpiarInactivos] = useState(false)
  const [form, setForm] = useState({
    nombre: '', apellido: '', telefono: '', email: '', fecha_nacimiento: '',
    sede: '' as string | number,
  })
  const [sedes, setSedes] = useState<Sede[]>([])
  const router = useRouter()
  const { user, activeClinicaId } = useAuthStore()
  const clinicaId = activeClinicaId || user?.clinica_id || 1
  const toast = useToastStore()
  const [selectedSede, setSelectedSede] = useState<number | null>(user?.sede_id || null)

  useEffect(() => { fetchData() }, [clinicaId, selectedSede, mostrarInactivos])
  useEffect(() => {
    api.get(`/sedes/?clinica=${clinicaId}`).then(res => setSedes(res.data.results || res.data)).catch(() => {})
  }, [clinicaId])

  const fetchData = async () => {
    try {
      const sedeParam = selectedSede ? `&sede=${selectedSede}` : ''
      const inactivosParam = mostrarInactivos ? '&inactivos=true' : ''
      const [pacRes, citRes] = await Promise.all([
        api.get(`/pacientes/?clinica=${clinicaId}${sedeParam}${inactivosParam}&limit=30`),
        api.get(`/citas/?clinica=${clinicaId}${sedeParam}&limit=30`),
      ])
      const pacs = (pacRes.data.results || pacRes.data)
        .filter((p: any) => p.clinica === clinicaId)
        .filter((p: any) => !selectedSede || p.sede === selectedSede)
      setPacientes(pacs)

      // Contar citas por paciente
      const citasList = citRes.data.results || citRes.data
      const conteo: Record<number, number> = {}
      citasList.forEach((c: any) => {
        conteo[c.paciente] = (conteo[c.paciente] || 0) + 1
      })
      setCitas(conteo)
    } catch {
      toast.error('Error al cargar pacientes', 'No se pudo obtener la lista de pacientes y citas.')
    } finally { setLoading(false) }
  }

  const resetForm = () => setForm({ nombre: '', apellido: '', telefono: '', email: '', fecha_nacimiento: '', sede: '' })

  const abrirCrear = () => { resetForm(); setEditando(null); setError(''); setShowModal(true) }

  const abrirEditar = (p: Paciente) => {
    setEditando(p)
    setForm({
      nombre: p.nombre, apellido: p.apellido,
      telefono: p.telefono || '', email: p.email || '',
      fecha_nacimiento: p.fecha_nacimiento || '',
      sede: p.sede ?? '',
    })
    setError(''); setShowModal(true)
  }

  const handleGuardar = async () => {
    if (!form.nombre || !form.apellido) return setError('Nombre y apellido son requeridos.')
    setSaving(true); setError('')
    try {
      const payload = { ...form, clinica: clinicaId, sede: form.sede || null }
      if (editando) {
        await api.patch(`/pacientes/${editando.id}/`, payload)
      } else {
        await api.post('/pacientes/', payload)
      }
      await fetchData()
      setShowModal(false); resetForm(); setEditando(null)
      toast.success(editando ? 'Paciente actualizado' : 'Paciente creado', editando ? 'Los datos del paciente fueron actualizados.' : 'El paciente fue registrado exitosamente.')
    } catch {
      setError('Error al guardar el paciente.')
      toast.error('Error al guardar', 'No se pudo guardar el paciente. Verifica los datos.')
    } finally { setSaving(false) }
  }

  const handleEliminar = async () => {
    try {
      await api.patch(`/pacientes/${confirmDelete.id}/`, { activo: false })
      await fetchData()
      toast.success('Paciente ocultado', 'El paciente fue desactivado del sistema.')
    } catch {
      toast.error('Error al desactivar', 'No se pudo desactivar el paciente.')
    }
    setConfirmDelete({ open: false, id: 0, name: '' })
  }

  const limpiarTodos = async () => {
    if (pacientes.length === 0) { toast.success('Sin pacientes para limpiar'); return }
    setLoading(true)
    await Promise.allSettled(pacientes.map(p => api.delete(`/pacientes/${p.id}/`)))
    await fetchData()
    toast.success(`${pacientes.length} pacientes eliminados`)
    setConfirmLimpiarInactivos(false)
  }

  const pacientesFiltrados = pacientes.filter(p =>
    `${p.nombre} ${p.apellido} ${p.email}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  const stats = [
    { label: 'Total pacientes', value: pacientes.length, color: '#00C9A7' },
    { label: 'Con citas', value: Object.keys(citas).length, color: '#00C9A7' },
    { label: 'Sin citas', value: pacientes.filter(p => !citas[p.id]).length, color: '#FF6B6B' },
    { label: 'Nuevos este mes', value: pacientes.filter(p => {
      const d = new Date(p.primera_visita)
      const ahora = new Date()
      return d.getMonth() === ahora.getMonth() && d.getFullYear() === ahora.getFullYear()
    }).length, color: '#4A9EF0' },
  ]

  return (
    <>
        {/* HEADER */}
        <FadeContent direction="down" duration={0.5}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <h1 className="font-display" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}><GradientText text="Pacientes" className="font-display" /></h1>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>{pacientesFiltrados.length} registrados</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <SedeSelector clinicaId={clinicaId} value={selectedSede} onChange={setSelectedSede} compact />
              <motion.button onClick={() => setMostrarInactivos(v => !v)}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none',
                  background: mostrarInactivos ? 'rgba(255,107,107,0.12)' : 'var(--glass)', backdropFilter: 'blur(20px)',
                  borderWidth: 1, borderStyle: 'solid', borderColor: mostrarInactivos ? 'rgba(255,107,107,0.4)' : 'var(--border)',
                  color: mostrarInactivos ? '#FF6B6B' : 'var(--muted)' }}>
                {mostrarInactivos ? 'Ocultar inactivos' : 'Mostrar inactivos'}
              </motion.button>
              {confirmLimpiarInactivos ? (
                <div style={{ display: 'flex', gap: 6 }}>
                  <motion.button onClick={limpiarTodos} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    style={{ padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(255,107,107,0.4)', background: 'rgba(255,107,107,0.2)', color: '#FF6B6B' }}>
                    ¿Eliminar {pacientes.length}?
                  </motion.button>
                  <motion.button onClick={() => setConfirmLimpiarInactivos(false)} whileHover={{ scale: 1.03 }}
                    style={{ padding: '10px 14px', borderRadius: 12, fontSize: 13, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--glass)', color: 'var(--muted)' }}>
                    Cancelar
                  </motion.button>
                </div>
              ) : (
                <motion.button onClick={() => setConfirmLimpiarInactivos(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  style={{ padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid rgba(255,107,107,0.3)', background: 'rgba(255,107,107,0.08)', color: '#FF6B6B' }}>
                  Limpiar todos
                </motion.button>
              )}
              <Magnet strength={0.3}>
                <motion.button onClick={abrirCrear} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 22px', borderRadius: 14, background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,201,167,0.3)' }}>
                  <PlusIcon /> Agregar paciente
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

        {/* BUSQUEDA */}
        <FadeContent direction="up" delay={0.2} duration={0.4}>
          <div style={{ position: 'relative', marginBottom: 28 }}>
            <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
              <SearchIcon />
            </div>
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, apellido o email..."
              style={{ width: '100%', padding: '13px 16px 13px 44px', borderRadius: 14, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 15, outline: 'none' }} />
          </div>
        </FadeContent>

        {/* TABLA */}
        <FadeContent direction="up" delay={0.25} duration={0.4}>
          <GlowingCard className="p-6 sm:p-8 lg:p-10">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>Lista de pacientes</h2>
              <span style={{ fontSize: 13, fontWeight: 500, padding: '5px 14px', borderRadius: 20, background: 'rgba(0,201,167,0.12)', color: 'var(--primary)', border: '1px solid rgba(0,201,167,0.2)' }}>
                {pacientesFiltrados.length} pacientes
              </span>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1,2,3,4,5].map(i => (
                  <motion.div key={i} animate={{ opacity: [0.3,0.6,0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i*0.15 }}
                    style={{ height: 68, borderRadius: 16, background: 'rgba(255,255,255,0.04)' }} />
                ))}
              </div>
            ) : pacientesFiltrados.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 0' }}>
                <motion.div animate={{ y: [0,-8,0] }} transition={{ duration: 3, repeat: Infinity }}
                  style={{ color: 'var(--muted)', display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                  <UserIcon />
                </motion.div>
                <p className="font-display" style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Sin pacientes</p>
                <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
                  {busqueda ? 'No hay resultados para tu búsqueda' : 'Agrega el primer paciente a tu clínica'}
                </p>
                {!busqueda && (
                  <motion.button onClick={abrirCrear} whileHover={{ scale: 1.03 }}
                    style={{ padding: '11px 24px', borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                    Agregar paciente
                  </motion.button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <AnimatePresence>
                  {pacientesFiltrados.slice(0, displayLimit).map((p, i) => {
                    const color = getColor(p.nombre + p.apellido)
                    const edad = calcularEdad(p.fecha_nacimiento)
                    const numCitas = citas[p.id] || 0
                    return (
                      <motion.div key={p.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{ delay: Math.min(i * 0.02, 0.2) }}
                        style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', transition: 'all 0.2s' }}
                      >
                        {/* Avatar */}
                        <div style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0, background: `linear-gradient(135deg, ${color}, ${color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700 }}>
                          {p.nombre[0]}{p.apellido[0]}
                        </div>

                        {/* Nombre */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>
                            {p.nombre} {p.apellido}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            {p.email && <p style={{ fontSize: 12, color: 'var(--muted)' }}>✉ {p.email}</p>}
                            {p.telefono && <p style={{ fontSize: 12, color: 'var(--muted)' }}>📞 {p.telefono}</p>}
                            {edad !== null && <p style={{ fontSize: 12, color: 'var(--muted)' }}>🎂 {edad} años</p>}
                            {p.sede_nombre && (
                              <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: 'rgba(0,201,167,0.15)', color: '#00C9A7', border: '1px solid rgba(0,201,167,0.3)' }}>
                                {p.sede_nombre}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Citas */}
                        <div style={{ textAlign: 'center', flexShrink: 0 }}>
                          <p className="font-display" style={{ fontSize: 20, fontWeight: 700, color: numCitas > 0 ? color : 'var(--muted)', lineHeight: 1 }}>{numCitas}</p>
                          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>citas</p>
                        </div>

                        {/* Primera visita */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ fontSize: 12, color: 'var(--muted)' }}>Primera visita</p>
                          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginTop: 2 }}>
                            {new Date(p.primera_visita).toLocaleDateString('es-CR')}
                          </p>
                        </div>

                        {/* Acciones */}
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                          {!p.activo && (
                            <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: 'rgba(255,107,107,0.12)', color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.3)' }}>Inactivo</span>
                          )}
                          <motion.button onClick={() => abrirEditar(p)}
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(0,201,167,0.12)', border: '1px solid rgba(0,201,167,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--primary)' }}>
                            <EditIcon />
                          </motion.button>
                          {p.activo ? (
                            <motion.button onClick={() => setConfirmDelete({ open: true, id: p.id, name: `${p.nombre} ${p.apellido}` })}
                              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--danger)' }}>
                              <TrashIcon />
                            </motion.button>
                          ) : (
                            <motion.button onClick={async () => { await api.patch(`/pacientes/${p.id}/`, { activo: true }); fetchData() }}
                              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(0,201,167,0.12)', border: '1px solid rgba(0,201,167,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#00C9A7', fontSize: 16, fontWeight: 700 }}>
                              ↩
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
                {displayLimit < pacientesFiltrados.length && (
                  <motion.button onClick={() => setDisplayLimit(v => v + 50)}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    style={{ marginTop: 8, padding: '12px', borderRadius: 14, background: 'var(--glass)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 14, fontWeight: 500, cursor: 'pointer', width: '100%' }}>
                    Ver más ({pacientesFiltrados.length - displayLimit} restantes)
                  </motion.button>
                )}
              </div>
            )}
          </GlowingCard>
        </FadeContent>

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(13,11,20,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              style={{ width: '100%', maxWidth: 480, background: 'var(--card)', backdropFilter: 'blur(24px)', border: '1px solid var(--border)', borderRadius: 24, padding: 36, boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>

              <h2 className="font-display" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                {editando ? 'Editar paciente' : 'Agregar paciente'}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>
                {editando ? 'Modifica la información del paciente' : 'Ingresa los datos del nuevo paciente'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[{ key: 'nombre', label: 'Nombre *', placeholder: 'Juan' }, { key: 'apellido', label: 'Apellido *', placeholder: 'Pérez' }].map(f => (
                    <div key={f.key}>
                      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</p>
                      <input value={form[f.key as keyof typeof form]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, outline: 'none' }} />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[{ key: 'telefono', label: 'Teléfono', placeholder: '8888-8888', type: 'text' }, { key: 'email', label: 'Email', placeholder: 'paciente@email.com', type: 'email' }].map(f => (
                    <div key={f.key}>
                      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</p>
                      <input type={f.type} value={form[f.key as keyof typeof form]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, outline: 'none' }} />
                    </div>
                  ))}
                </div>

                <div>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fecha de nacimiento</p>
                  <input type="date" value={form.fecha_nacimiento} onChange={e => setForm({ ...form, fecha_nacimiento: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, outline: 'none' }} />
                </div>
                {sedes.length > 0 && (
                  <div>
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sede</p>
                    <select value={form.sede} onChange={e => setForm({ ...form, sede: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, outline: 'none' }}>
                      <option value="">Sin sede específica</option>
                      {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {error && (
                <p style={{ marginTop: 16, fontSize: 13, color: 'var(--danger)', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)' }}>
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
                  {saving ? 'Guardando...' : editando ? 'Guardar cambios' : 'Agregar paciente'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={confirmDelete.open}
        title="Desactivar paciente"
        message={`¿Deseas desactivar a ${confirmDelete.name}? El paciente dejará de aparecer en el sistema (puedes reactivarlo después).`}
        confirmLabel="Desactivar"
        variant="warning"
        onConfirm={handleEliminar}
        onCancel={() => setConfirmDelete({ open: false, id: 0, name: '' })}
      />
    </>
  )
}