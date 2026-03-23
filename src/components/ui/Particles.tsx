'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Particle {
  width: number
  height: number
  left: string
  top: string
  duration: number
  delay: number
}

export default function Particles() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    setParticles(
      [...Array(6)].map((_, i) => ({
        width: Math.random() * 300 + 100,
        height: Math.random() * 300 + 100,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: Math.random() * 4 + 4,
        delay: i * 0.8,
      }))
    )
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-10"
          style={{
            width: p.width,
            height: p.height,
            background: 'radial-gradient(circle, var(--primary), transparent)',
            left: p.left,
            top: p.top,
          }}
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
        />
      ))}
    </div>
  )
}