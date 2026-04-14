'use client'
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

export interface CardData {
  numero: string
  nombre: string
  expiry: string
  cvv: string
}

interface CreditCard3DProps {
  data: CardData
  flipped?: boolean
  className?: string
}

const ChipSVG = () => (
  <svg width="46" height="36" viewBox="0 0 46 36" fill="none">
    <rect width="46" height="36" rx="6" fill="#C9A227" />
    <rect x="6" y="6" width="34" height="24" rx="3" fill="#B8911A" />
    <line x1="6"  y1="12" x2="40" y2="12" stroke="#9A780F" strokeWidth="0.8"/>
    <line x1="6"  y1="18" x2="40" y2="18" stroke="#9A780F" strokeWidth="0.8"/>
    <line x1="6"  y1="24" x2="40" y2="24" stroke="#9A780F" strokeWidth="0.8"/>
    <line x1="15" y1="6"  x2="15" y2="30" stroke="#9A780F" strokeWidth="0.8"/>
    <line x1="23" y1="6"  x2="23" y2="30" stroke="#9A780F" strokeWidth="0.8"/>
    <line x1="31" y1="6"  x2="31" y2="30" stroke="#9A780F" strokeWidth="0.8"/>
  </svg>
)

const VisaLogo = () => (
  <svg viewBox="0 0 60 20" width="58" height="20" fill="none">
    <path d="M22 19H17.2L20.3.5h4.8L22 19zM14.3.5l-4.6 12.7-.5-2.7v-.003L7.6 1.8S7.3.5 5.5.5H.2L.1.9c2 .5 3.8 1.3 5.3 2.2L9.7 19h5L22.7.5H14.3zM51.4 19h4.5l-4.1-18.5h-3.9c-1.7 0-2.1 1.3-2.1 1.3L37.3 19h5.1l1-2.8h6.2L51.4 19zm-6.6-6.8 2.6-7 .9 7h-3.5zM36.9 4.6l.7-4a13 13 0 0 0-4.4-.8c-2.1 0-7.2.9-7.2 5.4 0 4.2 5.9 4.3 5.9 6.5 0 2.2-5.3 1.8-7.1.4l-.7 4.2s2 1 5.1 1c3.1 0 7.7-1.6 7.7-5.6 0-4.3-6-4.7-6-6.5 0-1.9 4.2-1.6 5.5-.8z" fill="white"/>
  </svg>
)

const ContactlessIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <path d="M13 13 Q17 9 17 13 Q17 17 13 13" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M13 13 Q20 7 20 13 Q20 19 13 13" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M13 13 Q23 5 23 13 Q23 21 13 13" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
  </svg>
)

export default function CreditCard3D({ data, flipped = false, className = '' }: CreditCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (flipped) return
    const rect = cardRef.current?.getBoundingClientRect()
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

  const raw = data.numero.replace(/\D/g, '').padEnd(16, '\u2022')
  const groups = [raw.slice(0, 4), raw.slice(4, 8), raw.slice(8, 12), raw.slice(12, 16)]
  const displayName = data.nombre ? data.nombre.toUpperCase().slice(0, 26) : 'NOMBRE APELLIDO'
  const displayExpiry = data.expiry || 'MM/AA'

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }) }}
      className={className}
      style={{ width: 380, height: 240, perspective: 1200, flexShrink: 0 }}
    >
      <motion.div
        animate={{
          rotateX: flipped ? 0 : tilt.x,
          rotateY: flipped ? 180 : tilt.y,
        }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d', position: 'relative' }}
      >
        {/* ── FRONT ─────────────────────────────────────────── */}
        <div style={{
          position: 'absolute', inset: 0,
          WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #1c1148 0%, #3b1e96 42%, #1a0f46 80%, #0d0826 100%)',
          boxShadow: hovered
            ? '0 32px 64px rgba(90,50,220,0.55), 0 0 0 1px rgba(255,255,255,0.12)'
            : '0 20px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.07)',
          overflow: 'hidden',
          padding: '26px 28px 24px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          transition: 'box-shadow 0.3s',
        }}>
          {/* blobs */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(130,80,255,0.13)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -80, left: -40, width: 280, height: 280, borderRadius: '50%', background: 'rgba(60,30,180,0.09)', pointerEvents: 'none' }} />
          {/* shimmer */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 20, background: `radial-gradient(ellipse at ${glowPos.x}% ${glowPos.y}%, rgba(200,180,255,0.09) 0%, transparent 55%)` }} />

          {/* chip + visa */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ChipSVG />
              <ContactlessIcon />
            </div>
            <VisaLogo />
          </div>

          {/* number */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 18 }}>
            {groups.map((g, i) => (
              <span key={i} style={{ fontSize: 21, fontWeight: 600, color: 'rgba(255,255,255,0.92)', letterSpacing: '0.22em', fontFamily: '"Courier New", monospace' }}>{g}</span>
            ))}
          </div>

          {/* name + expiry */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <div>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.1em', marginBottom: 5, textTransform: 'uppercase' }}>Titular</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.88)', letterSpacing: '0.07em', maxWidth: 210, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.1em', marginBottom: 5, textTransform: 'uppercase' }}>Válida hasta</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.88)', letterSpacing: '0.1em', fontFamily: '"Courier New", monospace' }}>{displayExpiry}</p>
            </div>
          </div>
        </div>

        {/* ── BACK ──────────────────────────────────────────── */}
        <div style={{
          position: 'absolute', inset: 0,
          WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #1a1040 0%, #2c1870 45%, #110830 100%)',
          boxShadow: '0 20px 48px rgba(0,0,0,0.55)',
          overflow: 'hidden',
        }}>
          {/* magnetic stripe */}
          <div style={{ width: '100%', height: 50, marginTop: 28, background: 'linear-gradient(to bottom, #111 0%, #0a0a0a 50%, #111 100%)' }} />

          {/* signature + cvv */}
          <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
            <div style={{ flex: 1, height: 42, borderRadius: 5, background: 'repeating-linear-gradient(45deg, #f5f2ed, #f5f2ed 2px, #ede9e2 2px, #ede9e2 10px)', display: 'flex', alignItems: 'center', paddingLeft: 10 }}>
              <span style={{ fontSize: 11, color: '#aaa', fontStyle: 'italic', fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}>Firma autorizada</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', marginBottom: 5, letterSpacing: '0.08em', textTransform: 'uppercase' }}>CVV</p>
              <div style={{ background: 'white', borderRadius: 7, padding: '9px 18px', fontFamily: '"Courier New", monospace', fontSize: 20, fontWeight: 700, color: '#1a1040', letterSpacing: '0.22em', minWidth: 68, textAlign: 'center' }}>
                {data.cvv || '\u2022\u2022\u2022'}
              </div>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: 18, right: 24 }}><VisaLogo /></div>
          <p style={{ position: 'absolute', bottom: 14, left: 24, fontSize: 8, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.04em', maxWidth: 240 }}>
            Esta tarjeta es propiedad del banco emisor. Si la encuentra, devuélvala a la sucursal más cercana.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
