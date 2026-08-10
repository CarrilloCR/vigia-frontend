'use client'
import { useId } from 'react'

interface SparklineProps {
  data: number[]
  color?: string
  width?: number
  height?: number
  /** show a soft area fill under the line */
  fill?: boolean
  strokeWidth?: number
  className?: string
}

/**
 * Tiny word-sized chart (Tremor-style) — pure SVG, no deps.
 * Renders a normalized line + optional gradient area for a KPI series.
 */
export default function Sparkline({
  data, color = 'var(--jade)', width = 120, height = 36,
  fill = true, strokeWidth = 2, className = '',
}: SparklineProps) {
  const id = useId().replace(/:/g, '')
  if (!data || data.length === 0) {
    return <div style={{ width, height }} className={className} />
  }
  if (data.length === 1) data = [data[0], data[0]]

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pad = strokeWidth + 1
  const w = width
  const h = height
  const stepX = (w - pad * 2) / (data.length - 1)
  const pts = data.map((v, i) => {
    const x = pad + i * stepX
    const y = pad + (1 - (v - min) / range) * (h - pad * 2)
    return [x, y] as const
  })
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L${pts[pts.length - 1][0].toFixed(1)},${h} L${pts[0][0].toFixed(1)},${h} Z`
  const last = pts[pts.length - 1]

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={className} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={areaPath} fill={`url(#spark-${id})`} />}
      <path d={linePath} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={strokeWidth + 0.5} fill={color} />
    </svg>
  )
}
