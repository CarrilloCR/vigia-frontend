'use client'
import { motion, useAnimationControls } from 'framer-motion'
import { useEffect, useState } from 'react'

const LINE_PTS = [0,58, 22,44, 44,52, 66,28, 88,40, 110,22, 132,34, 154,16, 176,28]
const BAR_H = [52, 32, 68, 45, 72, 38, 80, 55]
const JADE = '#00C9A7'
const SAPPHIRE = '#4A9EF0'
const ORCHID = '#B06EF5'
const CORAL = '#FF6B6B'
const GOLD = '#F5C518'

function linePath(pts: number[]) {
  let d = ''
  for (let i = 0; i < pts.length; i += 2) {
    d += i === 0 ? `M ${pts[i]} ${pts[i+1]}` : ` L ${pts[i]} ${pts[i+1]}`
  }
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
  {
    title: '⚠️ Alerta crítica',
    body: 'Tasa de ausencias supera umbral',
    color: CORAL,
    x: -210, y: -60,
    delay: 1.4,
  },
  {
    title: '📈 KPI +12%',
    body: 'Ocupación de citas al alza',
    color: JADE,
    x: 170, y: -30,
    delay: 1.8,
  },
  {
    title: '🔔 3 reportes',
    body: 'Generados esta semana',
    color: ORCHID,
    x: -160, y: 120,
    delay: 2.2,
  },
]

export default function KpiScene3D() {
  const [tick, setTick] = useState(0)
  const lineCtrl = useAnimationControls()

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 3200)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    lineCtrl.start({ pathLength: [0, 1], transition: { duration: 1.8, ease: 'easeInOut' } })
  }, [tick, lineCtrl])

  return (
    <div style={{ position: 'relative', width: '100%', height: 340, display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 8 }}>

      {/* Ambient glow blobs */}
      <motion.div
        animate={{ scale: [1, 1.25, 1], opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${JADE}30, transparent 70%)`, pointerEvents: 'none' }}
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.08, 0.16, 0.08] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${ORCHID}25, transparent 70%)`, left: '60%', top: '20%', pointerEvents: 'none' }}
      />

      {/* Monitor */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        style={{
          position: 'relative',
          transform: 'perspective(900px) rotateX(8deg) rotateY(-16deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        <motion.div
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'relative' }}
        >
          {/* Bezel */}
          <div style={{
            background: 'linear-gradient(160deg, rgba(22,14,42,0.97), rgba(12,8,28,0.98))',
            borderRadius: 16,
            padding: '10px 10px 6px',
            border: '1.5px solid rgba(0,201,167,0.28)',
            boxShadow: `
              0 0 0 1px rgba(0,0,0,0.6),
              0 24px 48px rgba(0,0,0,0.6),
              0 0 60px rgba(0,201,167,0.08),
              inset 0 1px 0 rgba(255,255,255,0.06)
            `,
          }}>
            {/* Screen */}
            <div style={{
              width: 300,
              background: 'linear-gradient(180deg, #080512 0%, #0b0818 100%)',
              borderRadius: 10,
              padding: '10px 12px',
              overflow: 'hidden',
              position: 'relative',
            }}>
              {/* Scanline overlay */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 10, pointerEvents: 'none',
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
                zIndex: 10,
              }} />

              {/* Title bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: CORAL }} />
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: GOLD }} />
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: JADE }} />
                <span style={{ marginLeft: 8, fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, fontFamily: 'monospace' }}>VIGÍA — DASHBOARD</span>
                <motion.div
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: JADE }}
                />
              </div>

              {/* KPI cards row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5, marginBottom: 10 }}>
                {kpis.map((k, i) => (
                  <motion.div
                    key={k.label}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.15 }}
                    style={{
                      background: `${k.color}12`,
                      border: `1px solid ${k.color}28`,
                      borderRadius: 8,
                      padding: '6px 7px',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: k.color, lineHeight: 1, fontFamily: 'monospace' }}>{k.value}</div>
                    <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{k.label}</div>
                    <div style={{ fontSize: 7, color: k.color, marginTop: 1 }}>{k.delta}</div>
                  </motion.div>
                ))}
              </div>

              {/* Line chart */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', marginBottom: 4, letterSpacing: 0.5, fontFamily: 'monospace' }}>OCUPACIÓN 30 DÍAS</div>
                <svg width="276" height="52" viewBox="0 0 180 62" style={{ display: 'block' }}>
                  <defs>
                    <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={JADE} stopOpacity="0.28" />
                      <stop offset="100%" stopColor={JADE} stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={SAPPHIRE} stopOpacity="0.18" />
                      <stop offset="100%" stopColor={SAPPHIRE} stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Grid lines */}
                  {[15, 30, 45].map(y => (
                    <line key={y} x1="0" y1={y} x2="180" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  ))}

                  {/* Area fill */}
                  <motion.path
                    d={areaPath(LINE_PTS, 62)}
                    fill="url(#lg1)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8, duration: 0.6 }}
                  />

                  {/* Line */}
                  <motion.path
                    d={linePath(LINE_PTS)}
                    stroke={JADE}
                    strokeWidth="1.8"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={lineCtrl}
                  />

                  {/* Dots on line */}
                  {LINE_PTS.reduce<{x:number,y:number}[]>((acc,_,i) => {
                    if (i % 2 === 0) acc.push({ x: LINE_PTS[i], y: LINE_PTS[i+1] })
                    return acc
                  }, []).map((pt, i) => (
                    <motion.circle
                      key={i}
                      cx={pt.x} cy={pt.y} r="2.5"
                      fill={JADE}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.8 + i * 0.08 }}
                    />
                  ))}
                </svg>
              </div>

              {/* Bar mini chart */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', marginBottom: 4, letterSpacing: 0.5, fontFamily: 'monospace' }}>CITAS / SEMANA</div>
                <svg width="276" height="36" viewBox="0 0 180 40" style={{ display: 'block' }}>
                  {BAR_H.map((h, i) => (
                    <motion.rect
                      key={i}
                      x={i * 22 + 2}
                      y={40 - h * 0.42}
                      width="16"
                      height={h * 0.42}
                      rx="3"
                      fill={i === BAR_H.indexOf(Math.max(...BAR_H)) ? JADE : `${SAPPHIRE}90`}
                      initial={{ scaleY: 0, originY: 1 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.6 + i * 0.07, duration: 0.5, ease: 'easeOut' }}
                    />
                  ))}
                </svg>
              </div>

              {/* Alert rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {alertItems.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.0 + i * 0.2 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '4px 8px', borderRadius: 6,
                      background: `${a.color}10`,
                      border: `1px solid ${a.color}22`,
                    }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                      style={{ width: 6, height: 6, borderRadius: '50%', background: a.color, flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)', flex: 1, fontFamily: 'monospace' }}>{a.text}</span>
                    <span style={{ fontSize: 7, fontWeight: 700, color: a.color, padding: '1px 5px', borderRadius: 4, background: `${a.color}20` }}>{a.severity}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Stand neck */}
          <div style={{
            width: 40, height: 20,
            background: 'linear-gradient(180deg, rgba(30,20,55,0.95), rgba(18,12,36,0.9))',
            margin: '0 auto',
            clipPath: 'polygon(30% 0%, 70% 0%, 85% 100%, 15% 100%)',
          }} />
          {/* Stand base */}
          <div style={{
            width: 130, height: 8,
            background: 'linear-gradient(180deg, rgba(28,18,52,0.9), rgba(16,10,32,0.85))',
            margin: '0 auto', borderRadius: '0 0 8px 8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }} />
        </motion.div>
      </motion.div>

      {/* Floating cards */}
      {floatingCards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8, x: card.x * 0.7, y: card.y + 20 }}
          animate={{ opacity: 1, scale: 1, x: card.x, y: card.y }}
          transition={{ delay: card.delay, duration: 0.6, ease: 'backOut' }}
          style={{
            position: 'absolute',
            background: 'rgba(10,6,22,0.9)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${card.color}35`,
            borderRadius: 12,
            padding: '8px 12px',
            minWidth: 130,
            boxShadow: `0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px ${card.color}15`,
            pointerEvents: 'none',
          }}
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3.5 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 3 }}>{card.title}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>{card.body}</div>
            <div style={{ marginTop: 5, height: 1.5, borderRadius: 2, background: `linear-gradient(90deg, ${card.color}60, transparent)` }} />
          </motion.div>
        </motion.div>
      ))}

      {/* Orbiting data particles */}
      {[0, 1, 2, 3].map(i => (
        <motion.div
          key={i}
          animate={{
            rotate: 360,
          }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            width: 200 + i * 40,
            height: 200 + i * 40,
            borderRadius: '50%',
            border: `1px dashed rgba(0,201,167,${0.04 - i * 0.008})`,
            pointerEvents: 'none',
          }}
        >
          <motion.div
            style={{
              position: 'absolute',
              top: -3, left: '50%',
              width: 5, height: 5,
              borderRadius: '50%',
              background: [JADE, SAPPHIRE, ORCHID, GOLD][i],
              boxShadow: `0 0 8px ${[JADE, SAPPHIRE, ORCHID, GOLD][i]}`,
              transform: 'translateX(-50%)',
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}
