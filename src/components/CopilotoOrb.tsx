'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../lib/axios'
import { useAuthStore } from '../store/auth'

type Msg = { rol: 'user' | 'ia'; texto: string; ts: number }
type Convo = { id: string; titulo: string; msgs: Msg[]; actualizado: number }

const LS_KEY = 'vigia-copiloto-convos'

function Orbe({ pensando, size = 56 }: { pensando: boolean; size?: number }) {
  const R = pensando ? size * 0.62 : size * 0.42
  const diamantes = [0, 45, 90, 135, 180, 225, 270, 315]
  const particulas = [20, 80, 140, 200, 260, 320]
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ scale: pensando ? [1, 1.15, 1] : 1 }} transition={{ duration: 1.4, repeat: Infinity }}
        style={{ width: size * 0.4, height: size * 0.4, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #7CF5DE, var(--jade) 60%, #06B79B)', boxShadow: '0 0 14px var(--jade)' }} />
      <motion.div animate={{ rotate: 360 }} transition={{ duration: pensando ? 3 : 9, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {diamantes.map((a) => (
          <motion.span key={a} aria-hidden animate={{ x: R * Math.cos((a * Math.PI) / 180), y: R * Math.sin((a * Math.PI) / 180) }}
            transition={{ type: 'spring', stiffness: 120, damping: 16 }}
            style={{ position: 'absolute', width: 5, height: 5, background: 'var(--jade)', borderRadius: 1.5, transform: 'rotate(45deg)', boxShadow: '0 0 6px var(--jade)' }} />
        ))}
      </motion.div>
      <motion.div animate={{ rotate: -360 }} transition={{ duration: pensando ? 4.5 : 14, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {particulas.map((a) => (
          <span key={a} aria-hidden style={{ position: 'absolute', width: 2.5, height: 2.5, borderRadius: '50%', background: 'var(--accent)', opacity: 0.7,
            transform: `translate(${(R + 8) * Math.cos((a * Math.PI) / 180)}px, ${(R + 8) * Math.sin((a * Math.PI) / 180)}px)` }} />
        ))}
      </motion.div>
    </div>
  )
}

const nuevoId = () => Math.random().toString(36).slice(2, 10)

export default function CopilotoOrb() {
  const activeClinicaId = useAuthStore(s => s.activeClinicaId)
  const user = useAuthStore(s => s.user)
  const clinicaId = activeClinicaId ?? user?.clinica_id ?? null

  // Copiloto disponible SOLO en plan Profesional/Enterprise (o super admin).
  const [plan, setPlan] = useState<string | null>(null)
  useEffect(() => {
    if (!clinicaId) return
    api.get(`/clinicas/${clinicaId}/`).then(r => setPlan(r.data.plan)).catch(() => {})
  }, [clinicaId])
  const permitido = user?.rol === 'superadmin' || plan === 'profesional' || plan === 'enterprise'

  const [abierto, setAbierto] = useState(false)
  const [expandido, setExpandido] = useState(false)
  const [pensando, setPensando] = useState(false)
  const [input, setInput] = useState('')
  const [convos, setConvos] = useState<Convo[]>([])
  const [activoId, setActivoId] = useState<string | null>(null)
  const [panel, setPanel] = useState<'chat' | 'historial'>('chat')
  const [busqueda, setBusqueda] = useState('')
  const finRef = useRef<HTMLDivElement>(null)

  // cargar/guardar en localStorage
  useEffect(() => {
    try { const raw = localStorage.getItem(LS_KEY); if (raw) setConvos(JSON.parse(raw)) } catch { /**/ }
  }, [])
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(convos.slice(0, 50))) } catch { /**/ }
  }, [convos])

  const activo = convos.find(c => c.id === activoId) || null
  const msgs = activo?.msgs ?? []

  useEffect(() => { finRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs.length, pensando])

  const nuevaConvo = () => { setActivoId(null); setPanel('chat') }

  const enviar = async () => {
    const q = input.trim()
    if (!q || pensando || !clinicaId) return
    const userMsg: Msg = { rol: 'user', texto: q, ts: Date.now() }
    let convoId = activoId
    if (!convoId) {
      convoId = nuevoId()
      const nueva: Convo = { id: convoId, titulo: q.slice(0, 40), msgs: [userMsg], actualizado: Date.now() }
      setConvos(cs => [nueva, ...cs]); setActivoId(convoId)
    } else {
      setConvos(cs => cs.map(c => c.id === convoId ? { ...c, msgs: [...c.msgs, userMsg], actualizado: Date.now() } : c))
    }
    setInput(''); setPensando(true)
    try {
      const r = await api.post('/ia/copiloto/', { pregunta: q, clinica: clinicaId })
      const iaMsg: Msg = { rol: 'ia', texto: r.data.respuesta, ts: Date.now() }
      setConvos(cs => cs.map(c => c.id === convoId ? { ...c, msgs: [...c.msgs, iaMsg], actualizado: Date.now() } : c))
    } catch (e: any) {
      const iaMsg: Msg = { rol: 'ia', texto: e.response?.data?.error || 'No pude responder ahora.', ts: Date.now() }
      setConvos(cs => cs.map(c => c.id === convoId ? { ...c, msgs: [...c.msgs, iaMsg], actualizado: Date.now() } : c))
    } finally { setPensando(false) }
  }

  const exportar = () => {
    if (!activo) return
    const txt = activo.msgs.map(m => `${m.rol === 'user' ? 'Tú' : 'Copiloto'} · ${new Date(m.ts).toLocaleString('es')}\n${m.texto}\n`).join('\n')
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `copiloto_${activo.titulo.slice(0, 20)}.txt`; a.click(); URL.revokeObjectURL(a.href)
  }

  const sugerencias = ['¿Qué médico tiene más no-shows?', '¿Cómo van los ingresos hoy?', '¿Cuál es la alerta más grave?']
  const convosFiltradas = convos.filter(c =>
    !busqueda || c.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.msgs.some(m => m.texto.toLowerCase().includes(busqueda.toLowerCase())))

  const dims = expandido
    ? { width: 'min(760px, calc(100vw - 40px))', height: 'min(80vh, 720px)' }
    : { width: 'min(400px, calc(100vw - 40px))', height: 'min(560px, 74vh)' }

  // Gating por plan: si no está permitido, no se muestra el orbe.
  if (!permitido) return null

  return (
    <>
      <AnimatePresence>
        {abierto && (
          <motion.div initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            style={{ position: 'fixed', bottom: 96, right: 24, ...dims, zIndex: 9200, display: 'flex', flexDirection: 'column',
              borderRadius: 22, overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
            {/* Header */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--sunken)' }}>
              <Orbe pensando={pensando} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="font-display" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Copiloto Vigía</p>
                <p style={{ fontSize: 11.5, color: pensando ? 'var(--primary)' : 'var(--muted)', margin: 0 }}>{pensando ? 'Pensando…' : 'Pregúntame sobre tu clínica'}</p>
              </div>
              {[
                { t: '＋', f: nuevaConvo, title: 'Nueva conversación' },
                { t: panel === 'historial' ? '‹' : '≡', f: () => setPanel(p => p === 'chat' ? 'historial' : 'chat'), title: 'Historial' },
                { t: expandido ? '⤡' : '⤢', f: () => setExpandido(e => !e), title: 'Agrandar' },
                { t: '↧', f: exportar, title: 'Exportar' },
                { t: '✕', f: () => setAbierto(false), title: 'Cerrar' },
              ].map((b, i) => (
                <button key={i} onClick={b.f} title={b.title}
                  style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', fontSize: 13, flexShrink: 0 }}>{b.t}</button>
              ))}
            </div>

            {panel === 'historial' ? (
              <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
                <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar en conversaciones…"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 12, background: 'var(--sunken)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 13, marginBottom: 12, outline: 'none' }} />
                {convosFiltradas.length === 0 ? <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', marginTop: 20 }}>Sin conversaciones.</p>
                  : convosFiltradas.map(c => (
                    <div key={c.id} onClick={() => { setActivoId(c.id); setPanel('chat') }}
                      style={{ padding: '10px 12px', borderRadius: 12, background: c.id === activoId ? 'rgba(0,214,178,0.1)' : 'var(--sunken)', border: '1px solid var(--border)', marginBottom: 8, cursor: 'pointer' }}>
                      <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.titulo}</p>
                      <p style={{ fontSize: 11, color: 'var(--muted)', margin: '2px 0 0' }}>{c.msgs.length} mensajes · {new Date(c.actualizado).toLocaleDateString('es')}</p>
                    </div>
                  ))}
              </div>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {msgs.length === 0 && (
                    <div style={{ margin: 'auto', textAlign: 'center' }}>
                      <div style={{ display: 'inline-block' }}><Orbe pensando={false} size={72} /></div>
                      <p style={{ fontSize: 13, color: 'var(--muted)', margin: '14px 0 12px' }}>Preguntame sobre los datos de tu clínica.</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {sugerencias.map(s => (
                          <button key={s} onClick={() => setInput(s)}
                            style={{ fontSize: 12.5, padding: '8px 12px', borderRadius: 12, background: 'var(--sunken)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', textAlign: 'left' }}>{s}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {msgs.map((m, i) => (
                    <div key={i} style={{ alignSelf: m.rol === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                      <div style={{ padding: '10px 13px', borderRadius: 14, fontSize: 13.5, lineHeight: 1.5, whiteSpace: 'pre-wrap',
                        background: m.rol === 'user' ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'var(--sunken)',
                        color: m.rol === 'user' ? '#032' : 'var(--text)', border: m.rol === 'user' ? 'none' : '1px solid var(--border)' }}>{m.texto}</div>
                    </div>
                  ))}
                  {pensando && <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 13 }}><Orbe pensando size={30} /> pensando…</div>}
                  <div ref={finRef} />
                </div>
                <div style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                  <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') enviar() }} placeholder="Escribe tu pregunta…"
                    style={{ flex: 1, padding: '11px 14px', borderRadius: 12, background: 'var(--sunken)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 13.5, outline: 'none' }} />
                  <motion.button onClick={enviar} disabled={pensando || !input.trim()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    style={{ width: 44, borderRadius: 12, border: 'none', color: 'white', cursor: pensando || !input.trim() ? 'not-allowed' : 'pointer', opacity: pensando || !input.trim() ? 0.5 : 1, background: 'linear-gradient(135deg, var(--primary), var(--accent))', fontSize: 16 }}>↑</motion.button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button data-tour="copiloto" onClick={() => setAbierto(v => !v)} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} aria-label="Copiloto Vigía"
        style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9200, width: 60, height: 60, borderRadius: '50%',
          background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
        <Orbe pensando={pensando} size={44} />
      </motion.button>
    </>
  )
}
