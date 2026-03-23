'use client'
import { motion } from 'framer-motion'

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
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            boxShadow: '0 0 30px rgba(155, 142, 196, 0.5)',
          }}
        >
          <span className="text-white font-bold text-2xl font-display">V</span>
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