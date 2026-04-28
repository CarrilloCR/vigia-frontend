'use client'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Aurora from '../components/reactbits/Aurora'
import ShinyText from '../components/reactbits/ShinyText'

export default function NotFound() {
  const router = useRouter()

  return (
    <div style={{
      width: '100vw', minHeight: '100vh',
      backgroundColor: 'var(--void)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <Aurora colorStops={['#FF6B6B', '#00C9A7', '#4A9EF0']} amplitude={0.6} speed={0.15} />
      </div>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 520, padding: '0 24px' }}>
        {/* 404 Number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.h1
            className="font-display"
            animate={{
              textShadow: [
                '0 0 20px rgba(0,201,167,0.3)',
                '0 0 60px rgba(0,201,167,0.6)',
                '0 0 20px rgba(0,201,167,0.3)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{
              fontSize: 160,
              fontWeight: 900,
              color: 'var(--text)',
              lineHeight: 1,
              letterSpacing: -8,
              marginBottom: 8,
              background: 'linear-gradient(135deg, var(--primary), var(--accent), #FF6B6B)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            404
          </motion.h1>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="font-display" style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>
            Página no encontrada
          </h2>
          <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 8 }}>
            La ruta que buscas no existe o fue movida.
          </p>
          <ShinyText text="Verifica la URL e intenta nuevamente" className="font-display" speed={3} />
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 40 }}
        >
          <motion.button
            onClick={() => router.push('/dashboard')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{
              padding: '16px 36px', borderRadius: 16,
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              color: 'white', fontSize: 15, fontWeight: 600,
              border: 'none', cursor: 'pointer',
              boxShadow: '0 8px 28px rgba(0,201,167,0.4)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            Ir al Dashboard
          </motion.button>

          <motion.button
            onClick={() => router.back()}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{
              padding: '16px 36px', borderRadius: 16,
              background: 'var(--glass)', backdropFilter: 'blur(20px)',
              border: '1px solid var(--border)',
              color: 'var(--text)', fontSize: 15, fontWeight: 500,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Volver atrás
          </motion.button>
        </motion.div>

        {/* Floating particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              x: [0, (i % 2 === 0 ? 15 : -15), 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.4,
            }}
            style={{
              position: 'absolute',
              width: 6 + i * 2,
              height: 6 + i * 2,
              borderRadius: '50%',
              background: `rgba(0,201,167,${0.15 + i * 0.05})`,
              top: `${20 + i * 15}%`,
              left: `${10 + i * 18}%`,
              pointerEvents: 'none',
            }}
          />
        ))}
      </div>
    </div>
  )
}
