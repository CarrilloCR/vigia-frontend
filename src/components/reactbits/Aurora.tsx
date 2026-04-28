'use client'
import { useEffect, useRef } from 'react'

interface AuroraProps {
  colorStops?: string[]
  amplitude?: number
  speed?: number
}

export default function Aurora({
  colorStops = ['#00C9A7', '#4A9EF0', '#B06EF5'],
  amplitude = 1.0,
  speed = 0.5,
}: AuroraProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animFrame: number
    let t = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    const draw = () => {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      colorStops.forEach((color, i) => {
        const x = width * (0.2 + i * 0.3)
        const y = height * 0.5 + Math.sin(t * speed + i * 2) * height * 0.15 * amplitude
        const radius = width * 0.35

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
        gradient.addColorStop(0, color + '40')
        gradient.addColorStop(0.5, color + '15')
        gradient.addColorStop(1, 'transparent')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.ellipse(x, y, radius, radius * 0.6, t * 0.1 + i, 0, Math.PI * 2)
        ctx.fill()
      })

      t += 0.01
      animFrame = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animFrame)
      window.removeEventListener('resize', resize)
    }
  }, [colorStops, amplitude, speed])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  )
}