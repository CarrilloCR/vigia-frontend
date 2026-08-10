'use client'
import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface Blob {
  color: string
  size: number
  x: string
  y: string
  dx: number
  dy: number
  dur: number
}

interface AuroraMeshProps {
  /** override default brand blobs */
  colors?: string[]
  /** overall opacity of the mesh */
  intensity?: number
  className?: string
}

/**
 * Lightweight animated gradient mesh (GPU transforms only — no WebGL).
 * Replaces the heavy Aurora/Ribbons for a calmer, cheaper editorial ambient.
 */
export default function AuroraMesh({
  colors = ['#00D6B2', '#4A9EF0', '#B06EF5', '#FF6B6B'],
  intensity = 0.55,
  className = '',
}: AuroraMeshProps) {
  const blobs: Blob[] = useMemo(() => [
    { color: colors[0], size: 620, x: '-8%',  y: '-12%', dx: 60,  dy: 40,  dur: 22 },
    { color: colors[1], size: 520, x: '65%',  y: '10%',  dx: -50, dy: 60,  dur: 27 },
    { color: colors[2], size: 560, x: '30%',  y: '70%',  dx: 70,  dy: -40, dur: 24 },
    { color: colors[3] ?? colors[0], size: 400, x: '80%', y: '75%', dx: -40, dy: -50, dur: 30 },
  ], [colors])

  return (
    <div
      className={className}
      aria-hidden
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}
    >
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, scale: 1 }}
          animate={{ x: [0, b.dx, 0], y: [0, b.dy, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: b.dur, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', left: b.x, top: b.y,
            width: b.size, height: b.size, borderRadius: '50%',
            background: `radial-gradient(circle at 50% 50%, ${b.color}, transparent 68%)`,
            filter: 'blur(70px)',
            opacity: intensity,
            mixBlendMode: 'screen',
          }}
        />
      ))}
    </div>
  )
}
