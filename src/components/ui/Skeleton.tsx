'use client'
import { CSSProperties } from 'react'

interface SkeletonProps {
  width?: number | string
  height?: number | string
  radius?: number | string
  className?: string
  style?: CSSProperties
}

/** Loading placeholder block — shimmer. Prefer over spinners for content. */
export default function Skeleton({ width = '100%', height = 16, radius = 'var(--r-md)', className = '', style }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius, ...style }}
    />
  )
}

/** Convenience: a card-shaped skeleton. */
export function SkeletonCard({ height = 120 }: { height?: number }) {
  return (
    <div className="glass" style={{ borderRadius: 'var(--r-xl)', padding: 'var(--s-6)', boxShadow: 'var(--shadow-md)' }}>
      <Skeleton width={90} height={11} radius="var(--r-full)" />
      <Skeleton height={height} style={{ marginTop: 18 }} />
    </div>
  )
}
