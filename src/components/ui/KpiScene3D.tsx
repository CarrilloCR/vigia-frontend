'use client'
import { motion, useAnimationControls } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const LINE_PTS = [0,58, 22,44, 44,52, 66,28, 88,40, 110,22, 132,34, 154,16, 176,28]
const BAR_H = [52, 32, 68, 45, 72, 38, 80, 55]
const JADE = '#00C9A7'
const SAPPHIRE = '#4A9EF0'
const ORCHID = '#B06EF5'
const CORAL = '#FF6B6B'
const GOLD = '#F5C518'

function linePath(pts: number[]) {
  let d = ''
  for (let i = 0; i < pts.length; i += 2)
    d += i === 0 ? `M ${pts[i]} ${pts[i+1]}` : ` L ${pts[i]} ${pts[i+1]}`
  return d
}
function areaPath(pts: number[], h: number) {
  return linePath(pts) + ` L ${pts[pts.length-2]} ${h} L ${pts[0]} ${h} Z`
}

const kpis = [
  { label: 'Ocupación', value: '94%', color: JADE, delta: '+3%' },
  { label: 'Citas', value: '127', color: SAPPHIRE, delta: '+12' },
  { label: 'KPI Score', value: '8.7', color: ORCHID, delta: '↑' },
]
const alertItems = [
  { color: CORAL, text: 'Ausencias alta', severity: 'ALTA' },
  { color: GOLD, text: 'Espera >30 min', severity: 'MEDIA' },
]
const floatingCards = [
  { title: 'Alerta crítica', body: 'Tasa de ausencias supera umbral', color: CORAL, x: -178, y: -80, z: 40, delay: 1.4 },
  { title: 'KPI +12%', body: 'Ocupación de citas al alza', color: JADE, x: 182, y: -50, z: 60, delay: 1.8 },
  { title: '3 nuevos reportes', body: 'Generados esta semana', color: ORCHID, x: -160, y: 120, z: 30, delay: 2.2 },
]

export default function KpiScene3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 })
  const [zoom, setZoom] = useState(1)
  const [tick, setTick] = useState(0)
  const lineCtrl = useAnimationControls()

  // Chart loop
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 3200)
    return () => clearInterval(id)
  }, [])
  useEffect(() => {
    lineCtrl.start({ pathLength: [0, 1], transition: { duration: 1.8, ease: 'easeInOut' } })
  }, [tick, lineCtrl])

  // Mouse tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width / 2)
    const dy = (e.clientY - cy) / (rect.height / 2)
    setTilt({ x: -dy * 14, y: dx * 14 })
    setGlowPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }
  const handleMouseLeave = () => setTilt({ x: 0, y: 0 })

  // Wheel zoom
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      setZoom(z => Math.max(0.55, Math.min(2.0, z - e.deltaY * 0.0008)))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative', width: '100%', height: 460,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        cursor: 'grab',
      }}
    >
      {/* Ambient glows */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', background: `radial-gradient(circle, ${JADE}28, transparent 70%)`, pointerEvents: 'none' }}
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.07, 0.14, 0.07] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{ position: 'absolute', width: 240, height: 240, borderRadius: '50%', background: `radial-gradient(circle, ${ORCHID}22, transparent 70%)`, left: '58%', top: '18%', pointerEvents: 'none' }}
      />

      {/* 3D scene wrapper — tilt + zoom applied here */}
      <motion.div
        animate={{ rotateX: tilt.x, rotateY: tilt.y, scale: zoom }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        style={{
          position: 'relative',
          transformStyle: 'preserve-3d',
          perspective: 1100,
        }}
      >
        {/* Mouse shimmer overlay (follows cursor) */}
        <div style={{
          position: 'absolute', inset: -60, borderRadius: 24, pointerEvents: 'none', zIndex: 100,
          background: `radial-gradient(ellipse at ${glowPos.x}% ${glowPos.y}%, rgba(0,201,167,0.07) 0%, transparent 55%)`,
          transformStyle: 'preserve-3d',
        }} />

        {/* ── Floating cards (behind monitor via translateZ) ── */}
        {floatingCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
            transition={{
              opacity: { delay: card.delay, duration: 0.5, ease: 'backOut' },
              scale: { delay: card.delay, duration: 0.5, ease: 'backOut' },
              y: { delay: card.delay + 0.5, duration: 3.5 + i * 0.6, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(${card.x}px, ${card.y}px) translateZ(${card.z}px)`,
              background: 'rgba(8,4,18,0.92)',
              backdropFilter: 'blur(18px)',
              border: `1px solid ${card.color}38`,
              borderRadius: 14,
              padding: '10px 14px',
              minWidth: 140,
              maxWidth: 155,
              boxShadow: `0 12px 30px rgba(0,0,0,0.45), 0 0 0 1px ${card.color}12`,
              pointerEvents: 'none',
              zIndex: 5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: card.color, boxShadow: `0 0 6px ${card.color}` }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{card.title}</span>
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.42)', lineHeight: 1.5 }}>{card.body}</div>
            <div style={{ marginTop: 6, height: 1.5, borderRadius: 2, background: `linear-gradient(90deg, ${card.color}70, transparent)` }} />
          </motion.div>
        ))}

        {/* ── Monitor (z=0 center layer) ── */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{ transformStyle: 'preserve-3d', transform: 'translateZ(0px)', position: 'relative', zIndex: 10 }}
        >
          {/* Bezel */}
          <div style={{
            background: 'linear-gradient(160deg, rgba(22,13,44,0.98), rgba(10,6,24,0.99))',
            borderRadius: 18,
            padding: '12px 12px 8px',
            border: '1.5px solid rgba(0,201,167,0.3)',
            boxShadow: `
              0 0 0 1px rgba(0,0,0,0.7),
              0 32px 64px rgba(0,0,0,0.65),
              0 0 80px rgba(0,201,167,0.07),
              inset 0 1px 0 rgba(255,255,255,0.07)
            `,
          }}>
            {/* Screen */}
            <div style={{
              width: 360,
              background: 'linear-gradient(180deg, #060410 0%, #0a0716 100%)',
              borderRadius: 12,
              padding: '12px 14px',
              overflow: 'hidden',
              position: 'relative',
            }}>
              {/* Scanlines */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 12, pointerEvents: 'none', zIndex: 20,
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px)',
              }} />

              {/* Title bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, position: 'relative', zIndex: 1 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: CORAL }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: GOLD }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: JADE }} />
                <span style={{ marginLeft: 8, fontSize: 8, color: 'rgba(255,255,255,0.38)', letterSpacing: 1.2, fontFamily: 'monospace' }}>VIGÍA — DASHBOARD</span>
                <motion.div
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: JADE, boxShadow: `0 0 6px ${JADE}` }}
                />
              </div>

              {/* KPI cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 12, position: 'relative', zIndex: 1 }}>
                {kpis.map((k, i) => (
                  <motion.div
                    key={k.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.15 }}
                    style={{
                      background: `${k.color}12`,
                      border: `1px solid ${k.color}30`,
                      borderRadius: 10,
                      padding: '8px 9px',
                    }}
                  >
                    <div style={{ fontSize: 16, fontWeight: 700, color: k.color, lineHeight: 1, fontFamily: 'monospace' }}>{k.value}</div>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.38)', marginTop: 3 }}>{k.label}</div>
                    <div style={{ fontSize: 8, color: k.color, marginTop: 2, fontWeight: 600 }}>{k.delta}</div>
                  </motion.div>
                ))}
              </div>

              {/* Line chart */}
              <div style={{ marginBottom: 12, position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.28)', marginBottom: 5, letterSpacing: 0.8, fontFamily: 'monospace' }}>OCUPACIÓN 30 DÍAS</div>
                <svg width="332" height="60" viewBox="0 0 180 62" style={{ display: 'block' }}>
                  <defs>
                    <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={JADE} stopOpacity="0.32" />
                      <stop offset="100%" stopColor={JADE} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[15, 30, 45].map(y => (
                    <line key={y} x1="0" y1={y} x2="180" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  ))}
                  <motion.path d={areaPath(LINE_PTS, 62)} fill="url(#lg1)"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9, duration: 0.6 }} />
                  <motion.path d={linePath(LINE_PTS)} stroke={JADE} strokeWidth="2" fill="none"
                    strokeLinecap="round" strokeLinejoin="round"
                    initial={{ pathLength: 0 }} animate={lineCtrl} />
                  {LINE_PTS.reduce<{x:number,y:number}[]>((acc,_,i) => {
                    if (i % 2 === 0) acc.push({ x: LINE_PTS[i], y: LINE_PTS[i+1] })
                    return acc
                  }, []).map((pt, i) => (
                    <motion.circle key={i} cx={pt.x} cy={pt.y} r="3"
                      fill={JADE} stroke="rgba(0,0,0,0.4)" strokeWidth="1"
                      initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.9 + i * 0.08 }} />
                  ))}
                </svg>
              </div>

              {/* Bar chart */}
              <div style={{ marginBottom: 12, position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.28)', marginBottom: 5, letterSpacing: 0.8, fontFamily: 'monospace' }}>CITAS / SEMANA</div>
                <svg width="332" height="38" viewBox="0 0 180 40" style={{ display: 'block' }}>
                  {BAR_H.map((h, i) => (
                    <motion.rect key={i}
                      x={i * 22 + 2} y={40 - h * 0.44} width="17" height={h * 0.44} rx="3"
                      fill={i === BAR_H.indexOf(Math.max(...BAR_H)) ? JADE : `${SAPPHIRE}88`}
                      initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                      style={{ transformOrigin: `${i * 22 + 10}px 40px` }}
                      transition={{ delay: 0.6 + i * 0.07, duration: 0.5, ease: 'easeOut' }} />
                  ))}
                </svg>
              </div>

              {/* Alert rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, position: 'relative', zIndex: 1 }}>
                {alertItems.map((a, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.0 + i * 0.2 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '5px 10px', borderRadius: 8,
                      background: `${a.color}0e`, border: `1px solid ${a.color}22`,
                    }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.4 }}
                      style={{ width: 7, height: 7, borderRadius: '50%', background: a.color, boxShadow: `0 0 5px ${a.color}`, flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.58)', flex: 1, fontFamily: 'monospace' }}>{a.text}</span>
                    <span style={{ fontSize: 8, fontWeight: 700, color: a.color, padding: '2px 6px', borderRadius: 4, background: `${a.color}1e` }}>{a.severity}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Stand */}
          <div style={{ width: 48, height: 24, background: 'linear-gradient(180deg, rgba(28,18,50,0.96), rgba(16,10,32,0.9))', margin: '0 auto', clipPath: 'polygon(28% 0%, 72% 0%, 86% 100%, 14% 100%)' }} />
          <div style={{ width: 150, height: 9, background: 'linear-gradient(180deg, rgba(26,16,48,0.9), rgba(14,8,28,0.85))', margin: '0 auto', borderRadius: '0 0 10px 10px', boxShadow: '0 6px 24px rgba(0,0,0,0.6)' }} />
        </motion.div>

        {/* Zoom hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ delay: 2.5, duration: 2.5, ease: 'easeInOut' }}
          style={{
            position: 'absolute', bottom: -32, left: '50%', transform: 'translateX(-50%)',
            fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 1, whiteSpace: 'nowrap',
            fontFamily: 'monospace', pointerEvents: 'none',
          }}
        >
          scroll to zoom · drag to tilt
        </motion.div>
      </motion.div>
    </div>
  )
}
