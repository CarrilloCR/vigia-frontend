'use client'
import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * Hero del login: frame de navegador flotante en 3D (perspectiva + parallax con
 * el mouse) que muestra un DASHBOARD ANIMADO de Vigía — KPIs, gráfico y alertas
 * de ejemplo cambiando en vivo con transiciones. Sin video: todo animado, con el
 * look ACTUAL de la app.
 */
const JADE = '#00D6B2'; const CORAL = '#FF6B6B'; const BLUE = '#4A9EF0'; const GOLD = '#F5C518'

const ALERTAS = [
  { sev: 'crítica', c: CORAL, t: 'Ingresos ↓ 68% · Sede Central' },
  { sev: 'alta', c: GOLD, t: 'No-show ↑ 3.5× · Dr. Vargas' },
  { sev: 'crítica', c: CORAL, t: 'Cancelaciones · pico 288%' },
  { sev: 'media', c: BLUE, t: 'NPS bajó a 42 en Sede Norte' },
  { sev: 'alta', c: GOLD, t: 'Reagendadas ↑ 41% esta semana' },
]

const KPIS = [
  { l: 'Ingresos', vals: ['$204k', '$198k', '$211k'], c: JADE },
  { l: 'No-show', vals: ['5.2%', '6.1%', '4.8%'], c: CORAL },
  { l: 'Cancelac.', vals: ['8.1%', '7.4%', '9.0%'], c: GOLD },
  { l: 'NPS', vals: ['57', '54', '61'], c: BLUE },
]

function Mock() {
  const [tick, setTick] = useState(0)
  const [feed, setFeed] = useState<number[]>([0, 1, 2])
  useEffect(() => {
    const a = setInterval(() => setTick(t => t + 1), 2200)
    const b = setInterval(() => setFeed(f => {
      const next = (f[0] + 1) % ALERTAS.length
      return [next, f[0], f[1]]
    }), 2600)
    return () => { clearInterval(a); clearInterval(b) }
  }, [])
  // Alturas de barras que cambian por tick (una marca anomalía).
  const bars = Array.from({ length: 10 }, (_, i) => {
    const base = 30 + ((i * 37 + tick * 23) % 90)
    return { h: base, anom: i === (7 + tick) % 10 && base > 70 }
  })
  return (
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--void)' }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        {KPIS.map((k, i) => (
          <div key={i} style={{ padding: '8px 9px', borderRadius: 10, background: 'var(--sunken)', border: '1px solid var(--border)' }}>
            <div style={{ height: 20, overflow: 'hidden' }}>
              <AnimatePresence mode="popLayout">
                <motion.p key={k.vals[tick % k.vals.length]} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.35 }}
                  style={{ fontSize: 15, fontWeight: 800, color: k.c, margin: 0, lineHeight: 1.2 }}>{k.vals[tick % k.vals.length]}</motion.p>
              </AnimatePresence>
            </div>
            <p style={{ fontSize: 9, color: 'var(--muted)', margin: '2px 0 0' }}>{k.l}</p>
          </div>
        ))}
      </div>
      {/* Gráfico animado */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 74, padding: '0 2px', borderRadius: 10, background: 'var(--sunken)', border: '1px solid var(--border)', paddingTop: 8, paddingBottom: 6, paddingLeft: 6, paddingRight: 6 }}>
        {bars.map((b, i) => (
          <motion.div key={i} animate={{ height: b.h }} transition={{ type: 'spring', stiffness: 120, damping: 16 }}
            style={{ flex: 1, borderRadius: 3, minHeight: 4, background: b.anom ? CORAL : JADE, boxShadow: b.anom ? `0 0 10px ${CORAL}` : 'none' }} />
        ))}
      </div>
      {/* Feed de alertas cambiando */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 96 }}>
        <AnimatePresence mode="popLayout">
          {feed.map((idx, pos) => {
            const a = ALERTAS[idx]
            return (
              <motion.div key={`${idx}-${pos}`} layout
                initial={{ opacity: 0, x: 22, scale: 0.96 }} animate={{ opacity: pos === 0 ? 1 : 0.6, x: 0, scale: 1 }} exit={{ opacity: 0, x: -22 }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 9, background: pos === 0 ? `${a.c}18` : 'var(--sunken)', border: `1px solid ${pos === 0 ? a.c + '55' : 'var(--border)'}` }}>
                <motion.span animate={{ scale: pos === 0 ? [1, 1.4, 1] : 1 }} transition={{ duration: 1.4, repeat: Infinity }}
                  style={{ width: 7, height: 7, borderRadius: '50%', background: a.c, boxShadow: `0 0 8px ${a.c}`, flexShrink: 0 }} />
                <span style={{ fontSize: 10.5, color: 'var(--text)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.t}</span>
                <span style={{ fontSize: 8.5, fontWeight: 700, color: a.c, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{a.sev}</span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function HeroDemo3D() {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-16, -3]), { stiffness: 120, damping: 18 })
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [9, -2]), { stiffness: 120, damping: 18 })
  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect(); if (!r) return
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => { mx.set(0); my.set(0) }

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ perspective: 1500, width: '100%', maxWidth: 520, height: 320, position: 'relative' }}>
      {/* carta de profundidad detrás */}
      <motion.div aria-hidden animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: 40, left: 70, right: -8, height: 250, borderRadius: 'var(--r-xl)', background: 'var(--surface)', border: '1px solid var(--hairline)', boxShadow: 'var(--shadow-lg)', transform: 'rotateY(-13deg) rotateX(6deg) translateZ(-70px)', opacity: 0.4 }} />

      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d', rotateX: rotX, rotateY: rotY, width: '100%', maxWidth: 480 }}>
        <div style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', background: 'var(--card)', border: '1px solid var(--border-hover)', boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,214,178,0.18)' }}>
          {/* chrome */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: 'var(--sunken)', borderBottom: '1px solid var(--hairline)' }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--coral)' }} />
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--gold)' }} />
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--jade)' }} />
            <div style={{ flex: 1, margin: '0 10px', display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 'var(--r-full)', background: 'var(--card)', border: '1px solid var(--hairline)' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--jade)" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span style={{ fontSize: 10.5, color: 'var(--muted)', fontWeight: 500 }}>app.vigia.health/dashboard</span>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 9.5, fontWeight: 700, color: 'var(--jade)' }}>
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--jade)', boxShadow: '0 0 8px var(--jade)' }} />EN VIVO
            </span>
          </div>
          <Mock />
        </div>
      </motion.div>
    </div>
  )
}
