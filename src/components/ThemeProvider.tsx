'use client'
import { useEffect } from 'react'
import { useThemeStore } from '../store/theme'
import ToastContainer from './ui/ToastContainer'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isDark } = useThemeStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    // Aplicar dark mode por defecto al cargar
    const stored = localStorage.getItem('vigia-theme')
    if (!stored) {
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  return (
    <>
      {children}
      <ToastContainer />
    </>
  )
}