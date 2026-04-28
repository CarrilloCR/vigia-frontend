'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../lib/axios'
import { useAuthStore } from '../../../store/auth'
import { useToastStore } from '../../../store/toast'
import GlowingCard from '../../../components/reactbits/GlowingCard'
import TiltedCard from '../../../components/reactbits/TiltedCard'
import FadeContent from '../../../components/reactbits/FadeContent'
import CountUp from '../../../components/reactbits/CountUp'
import ConfirmModal from '../../../components/ui/ConfirmModal'
import SedeSelector from '../../../components/ui/SedeSelector'
import SpotlightCard from '../../../components/reactbits/SpotlightCard'
import ScrollReveal from '../../../components/reactbits/ScrollReveal'
import GradientText from '../../../components/reactbits/GradientText'
import Magnet from '../../../components/reactbits/Magnet'
import StarBorder from '../../../components/reactbits/StarBorder'
import GlareHover from '../../../components/reactbits/GlareHover'

interface Sede { id: number; nombre: string }

interface Medico {
  id: number
  nombre: string
  apellido: string
  especialidad: string
  email: string
  telefono: string
  descripcion: string
  foto_url: string
  fecha_ingreso: string
  activo: boolean
  clinica: number
  sede: number | null
  sede_nombre: string | null
}

const especialidades = [
  'Medicina General', 'Pediatría', 'Cardiología', 'Dermatología',
  'Ginecología', 'Neurología', 'Ortopedia', 'Psiquiatría', 'Oncología',
  'Oftalmología', 'Odontología', 'Endocrinología', 'Urología', 'Reumatología',
]

const colores = ['#00C9A7','#FF6B6B','#00C9A7','#4A9EF0','#00A88A','#B06EF5','#00C9A7','#FFD166']

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
const ChartIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
)
const SearchIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const UploadIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
)

function getColor(nombre: string) {
  let hash = 0
  for (let i = 0; i < nombre.length; i++) hash = nombre.charCodeAt(i) + ((hash << 5) - hash)
  return colores[Math.abs(hash) % colores.length]
}

export default function MedicosPage() {
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<Medico | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEsp, setFiltroEsp] = useState('todas')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fotoPreview, setFotoPreview] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number; name: string }>({ open: false, id: 0, name: '' })
  const [form, setForm] = useState({
    nombre: '', apellido: '', especialidad: 'Medicina General',
    email: '', telefono: '', descripcion: '', foto_url: '', fecha_ingreso: '',
    sede: '' as string | number,
  })
  const [sedes, setSedes] = useState<Sede[]>([])
  const router = useRouter()
  const { user } = useAuthStore()
  const toast = useToastStore()
  const { activeClinicaId } = useAuthStore(); const clinicaId = activeClinicaId || 1
  const [selectedSede, setSelectedSede] = useState<number | null>(null)

  useEffect(() => { fetchMedicos() }, [clinicaId, selectedSede])
  useEffect(() => {
    api.get(`/sedes/?clinica=${clinicaId}`).then(res => setSedes(res.data.results || res.data)).catch(() => {})
  }, [clinicaId])

  const fetchMedicos = async () => {
    try {
      const res = await api.get(`/medicos/?clinica=${clinicaId}${selectedSede ? `&sede=${selectedSede}` : ''}`)
      setMedicos(res.data.results || res.data)
    } catch {
      toast.error('Error al cargar médicos', 'No se pudo obtener la lista de médicos.')
    } finally { setLoading(false) }
  }

  const resetForm = () => {
    setForm({ nombre: '', apellido: '', especialidad: 'Medicina General', email: '', telefono: '', descripcion: '', foto_url: '', fecha_ingreso: '', sede: '' })
    setFotoPreview('')
  }

const abrirEditar = (m: Medico) => {
    setEditando(m)
    setForm({
      nombre: m.nombre, apellido: m.apellido, especialidad: m.especialidad,
      email: m.email, telefono: m.telefono || '', descripcion: m.descripcion || '',
      foto_url: m.foto_url || '', fecha_ingreso: m.fecha_ingreso || '',
      sede: m.sede ?? '',
    })
    setFotoPreview(m.foto_url || '')
    setError(''); setShowModal(true)
  }

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) return setError('La imagen no debe superar 2MB.')
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setFotoPreview(base64)
      setForm(prev => ({ ...prev, foto_url: base64 }))
    }
    reader.readAsDataURL(file)
  }

  const handleGuardar = async () => {
    if (!form.nombre || !form.apellido) return setError('Nombre y apellido son requeridos.')
    setSaving(true); setError('')
    try {
      const payload = {
        ...form,
        clinica: clinicaId,
        activo: true,
        sede: form.sede || null,
        fecha_ingreso: form.fecha_ingreso || null,
        email: form.email || '',
      }
      if (editando) {
        await api.patch(`/medicos/${editando.id}/`, payload)
      } else {
        await api.post('/medicos/', payload)
      }
      await fetchMedicos()
      setShowModal(false); resetForm(); setEditando(null)
      toast.success(editando ? 'Médico actualizado' : 'Médico creado', editando ? 'Los datos del médico fueron actualizados.' : 'El médico fue registrado exitosamente.')
    } catch (err: any) {
      const data = err?.response?.data
      const msg = data ? Object.values(data).flat().join(' ') : 'Error al guardar. Verifica los datos.'
      setError(msg)
      toast.error('Error al guardar', msg)
    } finally { setSaving(false) }
  }

  const handleEliminar = async () => {
    try {
      await api.patch(`/medicos/${confirmDelete.id}/`, { activo: false })
      await fetchMedicos()
      toast.success('Médico desactivado', 'El médico fue desactivado correctamente.')
    } catch {
      toast.error('Error al desactivar', 'No se pudo desactivar el médico.')
    }
    setConfirmDelete({ open: false, id: 0, name: '' })
  }

  const medicosFiltrados = medicos.filter(m => {
    const q = busqueda.toLowerCase()
    const coincide = `${m.nombre} ${m.apellido} ${m.especialidad}`.toLowerCase().includes(q)
    const esp = filtroEsp === 'todas' || m.especialidad === filtroEsp
    return coincide && esp && m.activo
  })

  const especialidadesUnicas = [...new Set(medicos.filter(m => m.activo).map(m => m.especialidad))]

  const stats = [
    { label: 'Total médicos', value: medicos.filter(m => m.activo).length, color: '#00C9A7' },
    { label: 'Especialidades', value: especialidadesUnicas.length, color: '#4A9EF0' },
    { label: 'Medicina General', value: medicos.filter(m => m.especialidad === 'Medicina General' && m.activo).length, color: '#00C9A7' },
    { label: 'Otras especialidades', value: medicos.filter(m => m.especialidad !== 'Medicina General' && m.activo).length, color: '#FF6B6B' },
  ]

  return (
    <>
        {/* HEADER */}
        <FadeContent direction="down" duration={0.5}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <h1 className="font-display" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}><GradientText text="Médicos" className="font-display" /></h1>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>{user?.clinica_nombre} · {medicosFiltrados.length} activos</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <SedeSelector clinicaId={clinicaId} value={selectedSede} onChange={setSelectedSede} compact />
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

        {/* FILTROS */}
        <FadeContent direction="up" delay={0.2} duration={0.4}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
                <SearchIcon />
              </div>
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre o especialidad..."
                style={{ width: '100%', padding: '13px 16px 13px 44px', borderRadius: 14, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 15, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['todas', ...especialidadesUnicas].map(esp => (
                <motion.button key={esp} onClick={() => setFiltroEsp(esp)}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  style={{
                    padding: '10px 18px', borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none',
                    background: filtroEsp === esp ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'var(--glass)',
                    backdropFilter: 'blur(20px)', borderWidth: 1, borderStyle: 'solid',
                    borderColor: filtroEsp === esp ? 'transparent' : 'var(--border)',
                    color: filtroEsp === esp ? 'white' : 'var(--muted)',
                  }}>
                  {esp === 'todas' ? 'Todas' : esp}
                </motion.button>
              ))}
            </div>
          </div>
        </FadeContent>

        {/* GRID */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {[1,2,3,4].map(i => (
              <motion.div key={i} animate={{ opacity: [0.3,0.6,0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i*0.2 }}
                style={{ height: 220, borderRadius: 24, background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : medicosFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p className="font-display" style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Sin médicos</p>
            <p style={{ fontSize: 15, color: 'var(--muted)' }}>Los médicos aparecen aquí una vez que su solicitud de acceso es aprobada.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            <AnimatePresence>
              {medicosFiltrados.map((m, i) => {
                const color = getColor(m.nombre + m.apellido)
                return (
                  <FadeContent key={m.id} direction="up" delay={i * 0.05} duration={0.4}>
                    <TiltedCard tiltAmount={4} scaleOnHover={1.01}>
                      <div style={{ padding: '28px', borderRadius: 24, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', height: '100%', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: `${color}12`, pointerEvents: 'none' }} />
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            {m.foto_url ? (
                              <img src={m.foto_url} alt={m.nombre}
                                style={{ width: 56, height: 56, borderRadius: 18, objectFit: 'cover', border: `2px solid ${color}40` }} />
                            ) : (
                              <div style={{ width: 56, height: 56, borderRadius: 18, flexShrink: 0, background: `linear-gradient(135deg, ${color}, ${color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 700, boxShadow: `0 4px 16px ${color}40` }}>
                                {m.nombre[0]}{m.apellido[0]}
                              </div>
                            )}
                            <div>
                              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Dr. {m.nombre} {m.apellido}</p>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: `${color}18`, color: color, border: `1px solid ${color}30` }}>
                                  {m.especialidad}
                                </span>
                                {m.sede_nombre && (
                                  <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 20, background: 'rgba(0,201,167,0.15)', color: '#00C9A7', border: '1px solid rgba(0,201,167,0.3)' }}>
                                    {m.sede_nombre}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <motion.button onClick={() => abrirEditar(m)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(0,201,167,0.12)', border: '1px solid rgba(0,201,167,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--primary)' }}>
                              <EditIcon />
                            </motion.button>
                            <motion.button onClick={() => setConfirmDelete({ open: true, id: m.id, name: `Dr. ${m.nombre} ${m.apellido}` })} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--danger)' }}>
                              <TrashIcon />
                            </motion.button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                          {m.email && <p style={{ fontSize: 13, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>✉ {m.email}</p>}
                          {m.telefono && <p style={{ fontSize: 13, color: 'var(--muted)' }}>📞 {m.telefono}</p>}
                          {m.fecha_ingreso && <p style={{ fontSize: 13, color: 'var(--muted)' }}>📅 Desde {new Date(m.fecha_ingreso).toLocaleDateString('es-CR', { year: 'numeric', month: 'long' })}</p>}
                          {m.descripcion && (
                            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {m.descripcion}
                            </p>
                          )}
                        </div>
                        <motion.button onClick={() => router.push(`/dashboard/medico/${m.id}`)}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          style={{ width: '100%', padding: '11px 0', borderRadius: 12, background: `${color}15`, border: `1px solid ${color}30`, color: color, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                          <ChartIcon /> Ver estadísticas y citas
                        </motion.button>
                      </div>
                    </TiltedCard>
                  </FadeContent>
                )
              })}
            </AnimatePresence>
          </div>
        )}

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(13,11,20,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflowY: 'auto' }}
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              style={{ width: '100%', maxWidth: 560, background: 'var(--card)', backdropFilter: 'blur(24px)', border: '1px solid var(--border)', borderRadius: 24, padding: 36, boxShadow: '0 30px 60px rgba(0,0,0,0.5)', margin: 'auto' }}>

              <h2 className="font-display" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                {editando ? 'Editar médico' : 'Agregar médico'}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>
                {editando ? 'Modifica la información del médico' : 'Completa el perfil del nuevo médico'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* FOTO */}
                <div>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Foto del médico</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 72, height: 72, borderRadius: 18, flexShrink: 0, overflow: 'hidden', border: '2px solid var(--border)', background: fotoPreview ? 'transparent' : 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {fotoPreview ? (
                        <img src={fotoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>
                          {form.nombre?.[0] || '?'}{form.apellido?.[0] || ''}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 18px', borderRadius: 12, cursor: 'pointer', background: 'rgba(0,201,167,0.1)', border: '1px dashed rgba(0,201,167,0.4)', color: 'var(--primary)', fontSize: 14, fontWeight: 500 }}>
                        <UploadIcon />
                        {fotoPreview ? 'Cambiar foto' : 'Subir foto'}
                        <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/gif" style={{ display: 'none' }} onChange={handleFoto} />
                      </label>
                      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>JPG, PNG, WEBP o GIF · Máx. 2MB</p>
                    </div>
                    {fotoPreview && (
                      <motion.button onClick={() => { setFotoPreview(''); setForm(prev => ({ ...prev, foto_url: '' })) }}
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--danger)', flexShrink: 0 }}>
                        <TrashIcon />
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Nombre y Apellido */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[{ key: 'nombre', label: 'Nombre', placeholder: 'Carlos' }, { key: 'apellido', label: 'Apellido', placeholder: 'Méndez' }].map(f => (
                    <div key={f.key}>
                      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label} *</p>
                      <input value={form[f.key as keyof typeof form]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, outline: 'none' }} />
                    </div>
                  ))}
                </div>

                {/* Especialidad */}
                <div>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Especialidad</p>
                  <select value={form.especialidad} onChange={e => setForm({ ...form, especialidad: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, outline: 'none' }}>
                    {especialidades.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>

                {/* Sede */}
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

                {/* Email y Teléfono */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[{ key: 'email', label: 'Email', placeholder: 'doctor@clinica.com', type: 'email' }, { key: 'telefono', label: 'Teléfono', placeholder: '8888-8888', type: 'text' }].map(f => (
                    <div key={f.key}>
                      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</p>
                      <input type={f.type} value={form[f.key as keyof typeof form]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, outline: 'none' }} />
                    </div>
                  ))}
                </div>

                {/* Fecha ingreso */}
                <div>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fecha de ingreso</p>
                  <input type="date" value={form.fecha_ingreso} onChange={e => setForm({ ...form, fecha_ingreso: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, outline: 'none' }} />
                </div>

                {/* Descripción */}
                <div>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Descripción / Bio</p>
                  <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
                    placeholder="Breve descripción del médico, experiencia, subespecialidades..."
                    rows={3}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
                </div>
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
                  {saving ? 'Guardando...' : editando ? 'Guardar cambios' : 'Agregar médico'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={confirmDelete.open}
        title="Desactivar médico"
        message={`¿Estás seguro de que deseas desactivar a ${confirmDelete.name}? El médico dejará de aparecer en el sistema.`}
        confirmLabel="Desactivar"
        variant="warning"
        onConfirm={handleEliminar}
        onCancel={() => setConfirmDelete({ open: false, id: 0, name: '' })}
      />
    </>
  )
}