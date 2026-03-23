'use client'
import { motion } from 'framer-motion'

interface BlurTextProps {
  text: string
  className?: string
  delay?: number
  duration?: number
}

export default function BlurText({
  text,
  className = '',
  delay = 0,
  duration = 0.5,
}: BlurTextProps) {
  return (
    <motion.span
      initial={{ filter: 'blur(12px)', opacity: 0, y: 10 }}
      animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {text}
    </motion.span>
  )
}