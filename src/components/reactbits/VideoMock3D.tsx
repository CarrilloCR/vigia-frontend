'use client'
import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * Floating 3D browser frame showing a REAL screen-recording of the Vigía
 * dashboard in use (public/preview-dashboard.{mp4,webm}). Perspective +
 * mouse-parallax tilt + gentle float. Real product footage — no mockup data.
 */
export default function VideoMock3D() {
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
      style={{ perspective: 1500, width: '100%', maxWidth: 520, height: 360, position: 'relative' }}>
      {/* depth card behind */}
      <motion.div aria-hidden animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: 40, left: 70, right: -8, height: 240, borderRadius: 'var(--r-xl)', background: 'var(--surface)', border: '1px solid var(--hairline)', boxShadow: 'var(--shadow-lg)', transform: 'rotateY(-13deg) rotateX(6deg) translateZ(-70px)', opacity: 0.4 }} />

      {/* browser frame */}
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d', rotateX: rotX, rotateY: rotY, width: '100%', maxWidth: 480 }}>
        <div style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', background: 'var(--card)', border: '1px solid var(--border-hover)', boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,214,178,0.18)' }}>
          {/* browser chrome */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: 'var(--sunken)', borderBottom: '1px solid var(--hairline)' }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--coral)' }} />
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--gold)' }} />
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--jade)' }} />
            <div style={{ flex: 1, margin: '0 10px', display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 'var(--r-full)', background: 'var(--card)', border: '1px solid var(--hairline)' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--jade)" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span style={{ fontSize: 10.5, color: 'var(--muted)', fontWeight: 500 }}>app.vigia.health/dashboard</span>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 9.5, fontWeight: 700, color: 'var(--jade)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--jade)', boxShadow: '0 0 8px var(--jade)' }} />EN VIVO
            </span>
          </div>
          {/* real footage */}
          <video autoPlay loop muted playsInline
            style={{ display: 'block', width: '100%', height: 'auto', background: 'var(--void)' }}>
            <source src="/preview-dashboard.webm" type="video/webm" />
            <source src="/preview-dashboard.mp4" type="video/mp4" />
          </video>
        </div>
      </motion.div>
    </div>
  )
}
