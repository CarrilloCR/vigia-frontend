'use client'
import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface PageShellProps {
  children: ReactNode
  /** narrower reading width for text-heavy pages */
  width?: 'default' | 'narrow' | 'wide'
  className?: string
}

const maxW = { narrow: 1120, default: 1440, wide: 1600 }

/**
 * Editorial page wrapper: consistent max-width, responsive gutters, entrance.
 * Use as the outer container of every dashboard sub-page.
 */
export default function PageShell({ children, width = 'default', className = '' }: PageShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: maxW[width], margin: '0 auto',
        paddingLeft: 'clamp(20px, 4vw, 56px)',
        paddingRight: 'clamp(20px, 4vw, 56px)',
        paddingTop: 'clamp(24px, 3vw, 40px)',
        paddingBottom: 'clamp(40px, 5vw, 72px)',
      }}
    >
      {children}
    </motion.div>
  )
}
