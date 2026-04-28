'use client'
import { motion } from 'framer-motion'
import VigiaLogo from './VigiaLogo'

export default function PageLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'var(--void)' }}
    >
      <div className="flex flex-col items-center gap-6">
        <motion.div
          animate={{
            filter: ['drop-shadow(0 0 12px rgba(0,201,167,0.3))', 'drop-shadow(0 0 30px rgba(0,201,167,0.7))', 'drop-shadow(0 0 12px rgba(0,201,167,0.3))'],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <VigiaLogo size={96} />
        </motion.div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--primary)' }}
            />
          ))}
        </div>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Cargando Vigía...</p>
      </div>
    </motion.div>
  )
}