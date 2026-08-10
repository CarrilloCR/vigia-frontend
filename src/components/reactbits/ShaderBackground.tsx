'use client'
import { MeshGradient } from '@paper-design/shaders-react'
import { useThemeStore } from '../../store/theme'

interface ShaderBackgroundProps {
  speed?: number
  distortion?: number
  swirl?: number
  className?: string
}

const DARK = ['#05090F', '#00D6B2', '#0B3A44', '#4A9EF0', '#5B2E86']
const LIGHT = ['#EAF5F2', '#7FE0D0', '#AEDCF3', '#CDBEF0', '#8FE6D6']

/**
 * GPU mesh-gradient background (paper-shaders) — real animated shader.
 * Theme-aware: dark deep-teal mesh in dark mode, soft bright mesh in light.
 */
export default function ShaderBackground({
  speed = 0.6, distortion = 0.8, swirl = 0.6, className = '',
}: ShaderBackgroundProps) {
  const isDark = useThemeStore(s => s.isDark)
  return (
    <div className={className} aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <MeshGradient
        colors={isDark ? DARK : LIGHT}
        speed={speed}
        distortion={distortion}
        swirl={swirl}
        style={{ width: '100%', height: '100%' }}
      />
      {/* veil so foreground stays legible in each theme */}
      <div style={{
        position: 'absolute', inset: 0,
        background: isDark
          ? 'radial-gradient(ellipse 90% 80% at 50% 40%, transparent 20%, rgba(5,9,15,0.55) 100%), linear-gradient(180deg, rgba(5,9,15,0.30), rgba(5,9,15,0.55))'
          : 'radial-gradient(ellipse 95% 85% at 50% 40%, rgba(242,247,246,0.10) 20%, rgba(242,247,246,0.60) 100%), linear-gradient(180deg, rgba(242,247,246,0.35), rgba(242,247,246,0.55))',
      }} />
    </div>
  )
}
