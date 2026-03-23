'use client'
import { motion } from 'framer-motion'
import { useThemeStore } from '../..//store/theme'

export default function ThemeToggle() {
  const { isDark, toggle } = useThemeStore()

  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="w-10 h-10 rounded-xl flex items-center justify-center glass glass-hover transition-all"
      style={{ border: '1px solid var(--border)' }}
    >
      <motion.span
        key={isDark ? 'dark' : 'light'}
        initial={{ rotate: -30, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="text-lg"
      >
        {isDark ? '☀️' : '🌙'}
      </motion.span>
    </motion.button>
  )
}