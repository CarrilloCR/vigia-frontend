'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/auth'
import api from '../lib/axios'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import ThemeToggle from '../components/ui/ThemeToggle'
import Particles from '../components/ui/Particles'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const { setAuth, isAuthenticated } = useAuthStore()

  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [registerData, setRegisterData] = useState({
    nombre: '', email: '', password: '', confirmar: '', nombre_clinica: ''
  })

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard')
  }, [isAuthenticated, router])

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      setError('Completa todos los campos.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login/', loginData)
      setAuth(res.data.user, res.data.tokens.access, res.data.tokens.refresh)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!registerData.nombre || !registerData.email || !registerData.password || !registerData.nombre_clinica) {
      setError('Completa todos los campos.')
      return
    }
    if (registerData.password !== registerData.confirmar) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/register/', {
        nombre: registerData.nombre,
        email: registerData.email,
        password: registerData.password,
        nombre_clinica: registerData.nombre_clinica,
      })
      setAuth(res.data.user, res.data.tokens.access, res.data.tokens.refresh)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear la cuenta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: 'var(--void)' }}>

      <Particles />

      {/* Theme toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md mx-4 glass rounded-3xl p-8 relative z-10"
        style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ boxShadow: ['0 0 20px rgba(155,142,196,0.3)', '0 0 40px rgba(155,142,196,0.6)', '0 0 20px rgba(155,142,196,0.3)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
          >
            <span className="text-white text-2xl font-bold font-display">V</span>
          </motion.div>
          <h1 className="text-3xl font-bold font-display" style={{ color: 'var(--text)' }}>Vigía</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Sistema de Alertas Inteligentes</p>
        </div>

        {/* Mode tabs */}
        <div className="flex rounded-xl p-1 mb-6" style={{ backgroundColor: 'var(--surface)' }}>
          {(['login', 'register'] as const).map((m) => (
            <motion.button
              key={m}
              onClick={() => { setMode(m); setError(''); setSuccess('') }}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: mode === m ? 'var(--primary)' : 'transparent',
                color: mode === m ? 'white' : 'var(--muted)',
              }}
              whileTap={{ scale: 0.98 }}
            >
              {m === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </motion.button>
          ))}
        </div>

        {/* Forms */}
        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <Input
                label="Correo electrónico"
                type="email"
                value={loginData.email}
                onChange={(v) => setLoginData({ ...loginData, email: v })}
                placeholder="admin@clinica.com"
                icon="📧"
              />
              <Input
                label="Contraseña"
                type="password"
                value={loginData.password}
                onChange={(v) => setLoginData({ ...loginData, password: v })}
                placeholder="••••••••"
                icon="🔒"
              />
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <Input
                label="Nombre completo"
                value={registerData.nombre}
                onChange={(v) => setRegisterData({ ...registerData, nombre: v })}
                placeholder="Dr. Juan Pérez"
                icon="👤"
              />
              <Input
                label="Correo electrónico"
                type="email"
                value={registerData.email}
                onChange={(v) => setRegisterData({ ...registerData, email: v })}
                placeholder="admin@clinica.com"
                icon="📧"
              />
              <Input
                label="Nombre de la clínica"
                value={registerData.nombre_clinica}
                onChange={(v) => setRegisterData({ ...registerData, nombre_clinica: v })}
                placeholder="Clínica San José"
                icon="🏥"
              />
              <Input
                label="Contraseña"
                type="password"
                value={registerData.password}
                onChange={(v) => setRegisterData({ ...registerData, password: v })}
                placeholder="Mínimo 8 caracteres"
                icon="🔒"
              />
              <Input
                label="Confirmar contraseña"
                type="password"
                value={registerData.confirmar}
                onChange={(v) => setRegisterData({ ...registerData, confirmar: v })}
                placeholder="Repite tu contraseña"
                icon="🔒"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error/Success */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 px-4 py-3 rounded-xl text-sm"
              style={{
                backgroundColor: 'rgba(232, 160, 196, 0.15)',
                border: '1px solid rgba(232, 160, 196, 0.3)',
                color: 'var(--danger)',
              }}
            >
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <div className="mt-6">
          <Button
            fullWidth
            size="lg"
            loading={loading}
            onClick={mode === 'login' ? handleLogin : handleRegister}
          >
            {mode === 'login' ? 'Ingresar al sistema' : 'Crear cuenta'}
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: 'var(--muted)' }}>
          {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            className="font-medium hover:opacity-80 transition-opacity"
            style={{ color: 'var(--primary)' }}
          >
            {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </motion.div>
    </main>
  )
}