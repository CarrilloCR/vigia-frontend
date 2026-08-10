'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/auth'
import api from '../lib/axios'
import { TOUR_STEPS, type TourStep } from '../lib/tourSteps'

type Rect = { top: number; left: number; width: number; height: number }

/**
 * Recorrido guiado tipo "spotlight": resalta elementos REALES de cada página
 * (por data-tour), con flecha + cuadro explicativo, y navega de una página a la
 * siguiente. Aparece la 1ª vez tras aceptar términos/plan, o desde el botón de
 * Documentación (evento 'vigia-open-guia').
 */
export default function GuidedTour() {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuthStore(s => s.user)
  const activeClinicaId = useAuthStore(s => s.activeClinicaId)
  const clinicaId = activeClinicaId ?? user?.clinica_id ?? null
  const key = user?.id ? `vigia-guia-${user.id}` : null
  const tosKey = user?.id ? `vigia-tos-${user.id}` : null

  const [plan, setPlan] = useState<string | null>(null)
  const esAdmin = user?.rol === 'superadmin' || user?.rol === 'admin'
  const esSuper = user?.rol === 'superadmin'
  const puede = useCallback((g?: TourStep['gate']) => {
    if (!g) return true
    if (g === 'admin') return esAdmin
    if (g === 'pro') return esSuper || plan === 'profesional' || plan === 'enterprise'
    return esSuper || (plan !== null && plan !== 'gratis')  // 'plan'
  }, [esAdmin, esSuper, plan])

  const [abierto, setAbierto] = useState(false)
  const [idx, setIdx] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Pasos visibles según rol/plan (los que el usuario no puede usar se omiten).
  const pasos = TOUR_STEPS.filter(s => puede(s.gate))
  const paso = pasos[idx]

  useEffect(() => {
    if (clinicaId) api.get(`/clinicas/${clinicaId}/`).then(r => setPlan(r.data.plan)).catch(() => setPlan('gratis'))
  }, [clinicaId])

  useEffect(() => {
    if (!key || !tosKey) return
    const yaVista = () => { try { return localStorage.getItem(key) === '1' } catch { return false } }
    const tosOk = () => { try { return localStorage.getItem(tosKey) === '1' } catch { return false } }
    if (!yaVista() && tosOk()) empezar()
    const onTos = () => { if (!yaVista()) empezar() }
    const onOpen = () => empezar()
    window.addEventListener('vigia-tos-done', onTos)
    window.addEventListener('vigia-open-guia', onOpen)
    return () => { window.removeEventListener('vigia-tos-done', onTos); window.removeEventListener('vigia-open-guia', onOpen) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, tosKey])

  // El estado del tour vive en sessionStorage: al navegar entre páginas el layout
  // remonta este componente, y así no se pierde el recorrido en curso.
  useEffect(() => {
    try {
      const s = sessionStorage.getItem('vigia-tour')
      if (s !== null) { setIdx(Number(s) || 0); setAbierto(true) }
    } catch { /* */ }
  }, [])

  const empezar = () => { try { sessionStorage.setItem('vigia-tour', '0') } catch {}; setIdx(0); setAbierto(true) }
  const cerrar = () => {
    try { if (key) localStorage.setItem(key, '1'); sessionStorage.removeItem('vigia-tour') } catch { /* */ }
    if (pollRef.current) clearInterval(pollRef.current)
    setAbierto(false); setRect(null)
  }

  // Localiza el elemento del paso actual (navegando de página si hace falta) y
  // calcula su posición. Reintenta hasta que el elemento esté montado.
  useEffect(() => {
    if (!abierto || !paso) return
    if (pollRef.current) clearInterval(pollRef.current)

    if (pathname !== paso.ruta) { router.push(paso.ruta); return }

    let tries = 0
    const buscar = () => {
      const el = document.querySelector(`[data-tour="${paso.sel}"]`) as HTMLElement | null
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // pequeño delay para que termine el scroll antes de medir
        setTimeout(() => {
          const r = el.getBoundingClientRect()
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
        }, 220)
        if (pollRef.current) clearInterval(pollRef.current)
      } else if (++tries > 30) {
        if (pollRef.current) clearInterval(pollRef.current) // no se encontró → deja pasar
      }
    }
    buscar()
    pollRef.current = setInterval(buscar, 120)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, idx, pathname, paso?.sel])

  // Recalcula al hacer scroll/resize.
  useEffect(() => {
    if (!abierto || !paso) return
    const recalc = () => {
      const el = document.querySelector(`[data-tour="${paso.sel}"]`) as HTMLElement | null
      if (el) { const r = el.getBoundingClientRect(); setRect({ top: r.top, left: r.left, width: r.width, height: r.height }) }
    }
    window.addEventListener('scroll', recalc, true)
    window.addEventListener('resize', recalc)
    return () => { window.removeEventListener('scroll', recalc, true); window.removeEventListener('resize', recalc) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, paso?.sel])

  const ir = (d: number) => {
    const n = idx + d
    if (n < 0) return
    if (n >= pasos.length) { cerrar(); return }
    try { sessionStorage.setItem('vigia-tour', String(n)) } catch {}
    setRect(null); setIdx(n)
  }

  if (!abierto || !paso) return null

  // Posición del cuadro explicativo: debajo del objetivo si hay lugar, si no arriba.
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const TW = 340
  let tipTop = 0, tipLeft = 0, abajo = true
  if (rect) {
    abajo = rect.top + rect.height + 190 < vh
    tipTop = abajo ? rect.top + rect.height + 16 : Math.max(16, rect.top - 190)
    tipLeft = Math.min(Math.max(16, rect.left + rect.width / 2 - TW / 2), vw - TW - 16)
  } else {
    tipTop = vh / 2 - 90; tipLeft = vw / 2 - TW / 2
  }

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 10050 }}>
        {/* Spotlight: recuadro que ilumina el objetivo y oscurece el resto */}
        {rect && (
          <motion.div
            initial={false}
            animate={{ top: rect.top - 8, left: rect.left - 8, width: rect.width + 16, height: rect.height + 16 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            style={{ position: 'fixed', borderRadius: 14, pointerEvents: 'none',
              boxShadow: '0 0 0 3px var(--primary), 0 0 0 9999px rgba(4,3,12,0.74), 0 0 30px rgba(0,214,178,0.5)' }} />
        )}
        {/* Si aún no hay objetivo, oscurece todo */}
        {!rect && <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,3,12,0.74)' }} />}

        {/* Flecha apuntando al objetivo */}
        {rect && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ position: 'fixed', left: tipLeft + TW / 2 - 9, top: abajo ? tipTop - 14 : tipTop + 176, width: 0, height: 0,
              borderLeft: '9px solid transparent', borderRight: '9px solid transparent',
              [abajo ? 'borderBottom' : 'borderTop']: '14px solid var(--surface)' as any, filter: 'drop-shadow(0 -2px 2px rgba(0,0,0,0.3))', zIndex: 2 }} />
        )}

        {/* Cuadro explicativo */}
        <motion.div key={idx} initial={{ opacity: 0, y: abajo ? -8 : 8 }} animate={{ opacity: 1, y: 0 }}
          style={{ position: 'fixed', top: tipTop, left: tipLeft, width: TW, background: 'var(--surface)', border: '1px solid var(--primary)', borderRadius: 16, padding: 18, boxShadow: '0 24px 60px rgba(0,0,0,0.5)', zIndex: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="eyebrow" style={{ color: 'var(--primary)' }}>Paso {idx + 1} de {pasos.length}</span>
            <button onClick={cerrar} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 12 }}>Saltar</button>
          </div>
          <h3 className="font-display" style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', margin: '0 0 5px' }}>{paso.titulo}</h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>{paso.texto}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 16 }}>
            <button onClick={() => ir(-1)} disabled={idx === 0}
              style={{ padding: '8px 14px', borderRadius: 10, background: 'transparent', border: '1px solid var(--border)', color: idx === 0 ? 'var(--border)' : 'var(--muted)', cursor: idx === 0 ? 'default' : 'pointer', fontSize: 12.5 }}>← Atrás</button>
            <motion.button onClick={() => ir(1)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              style={{ padding: '8px 18px', borderRadius: 10, border: 'none', color: '#032', fontWeight: 700, cursor: 'pointer', fontSize: 12.5, background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
              {idx === pasos.length - 1 ? 'Finalizar' : 'Siguiente →'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
