'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedListProps {
  items: { id: number | string; content: ReactNode }[]
  gap?: number
}

export default function AnimatedList({ items, gap = 12 }: AnimatedListProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      <AnimatePresence initial={false}>
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04, ease: 'easeOut' }}
          >
            {item.content}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}