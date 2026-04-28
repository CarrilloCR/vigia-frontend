'use client'
import { motion } from 'framer-motion'

interface GradientTextProps {
  text: string
  className?: string
  gradient?: string
  animate?: boolean
  delay?: number
}

export default function GradientText({
  text,
  className = '',
  gradient = 'linear-gradient(135deg, #70FFE0 0%, #00C9A7 35%, #4A9EF0 65%, #B06EF5 100%)',
  animate = true,
  delay = 0,
}: GradientTextProps) {
  return (
    <motion.span
      initial={animate ? { opacity: 0, y: 10 } : {}}
      animate={animate ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
      style={{
        backgroundImage: gradient,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
        backgroundSize: animate ? '200% 200%' : '100%',
        display: 'inline-block',
      }}
    >
      {text}
    </motion.span>
  )
}
