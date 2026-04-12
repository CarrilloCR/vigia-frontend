'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/auth'
import api from '../lib/axios'
import { useToastStore } from '../store/toast'
import Aurora from '../components/reactbits/Aurora'
import GlowingCard from '../components/reactbits/GlowingCard'
import AnimatedInput from '../components/reactbits/AnimatedInput'
import PasswordRequirements, { validatePassword } from '../components/ui/PasswordRequirements'
import ThemeToggle from '../components/ui/ThemeToggle'
import VigiaLogo from '../components/ui/VigiaLogo'

const BoltIcon = () => (
  <svg width="22" height="22" fill="none" stroke="#9B8EC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)
const AiIcon = () => (
  <svg width="22" height="22" fill="none" stroke="#9B8EC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
  </svg>
)
const ChartIcon = () => (
  <svg width="22" height="22" fill="none" stroke="#9B8EC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
)
const BellIcon = () => (
  <svg width="22" height="22" fill="none" stroke="#9B8EC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const MailIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)
const LockIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const UserIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)
const HospitalIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
)
const AlertIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)

const features = [
  { icon: <BoltIcon />, title: 'Detección en tiempo real', desc: 'Anomalías detectadas automáticamente en tus KPIs' },
  { icon: <AiIcon />, title: 'IA integrada con Claude', desc: 'Recomendaciones contextuales e inteligentes' },
  { icon: <ChartIcon />, title: '8 KPIs médicos especializados', desc: 'Métricas clínicas monitoreadas 24/7' },
  { icon: <BellIcon />, title: 'Notificaciones instantáneas', desc: 'Alertas por email cuando algo cambia' },
]

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { setAuth, isAuthenticated } = useAuthStore()
  const toast = useToastStore()

  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [registerData, setRegisterData] = useState({
    nombre: '', email: '', password: '', confirmar: '', nombre_clinica: ''
  })

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard')
  }, [isAuthenticated, router])

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) return setError('Completa todos los campos.')
    setLoading(true); setError('')
    try {
      const res = await api.post('/auth/login/', loginData)
      setAuth(res.data.user, res.data.tokens.access, res.data.tokens.refresh)
      toast.success('Bienvenido', `Hola ${res.data.user.nombre}, ingresaste correctamente.`)
      router.push('/dashboard')
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Credenciales inválidas o error del servidor.'
      setError(msg)
    } finally { setLoading(false) }
  }

  const handleRegister = async () => {
    if (!registerData.nombre || !registerData.email || !registerData.password || !registerData.nombre_clinica)
      return setError('Completa todos los campos.')
    if (!validatePassword(registerData.password))
      return setError('La contraseña no cumple todos los requisitos.')
    if (registerData.password !== registerData.confirmar)
      return setError('Las contraseñas no coinciden.')
    setLoading(true); setError('')
    try {
      const res = await api.post('/auth/register/', {
        nombre: registerData.nombre, email: registerData.email,
        password: registerData.password, nombre_clinica: registerData.nombre_clinica,
      })
      setAuth(res.data.user, res.data.tokens.access, res.data.tokens.refresh)
      toast.success('Cuenta creada', 'Tu acceso está en revisión. Recibirás confirmación pronto.')
      router.push('/dashboard')
    } catch (err: any) {
      const data = err.response?.data
      const msg = data?.error || data?.email?.[0] || data?.detail || 'Error al crear la cuenta. Verifica los datos.'
      setError(msg)
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      width: '100vw', minHeight: '100vh',
      backgroundColor: 'var(--void)',
      display: 'flex', position: 'relative', overflow: 'hidden',
    }}>
      <Aurora colorStops={['#9B8EC4', '#7C6FBF', '#C4B5E8']} amplitude={1.2} speed={0.35} />

      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04,
        backgroundImage: 'linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      {/* Theme toggle */}
      <div style={{ position: 'absolute', top: 28, right: 28, zIndex: 20 }}>
        <ThemeToggle />
      </div>

      {/* LEFT PANEL */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{
          width: '44%', minHeight: '100vh',
          flexDirection: 'column', justifyContent: 'center',
          alignItems: 'flex-end',
          padding: '80px 80px 80px 64px',
          position: 'relative', zIndex: 10,
        }}
        className="hidden lg:flex"
      >
        {/* Logo */}
        <motion.div
          style={{ marginBottom: 36 }}
          animate={{ filter: ['drop-shadow(0 0 20px rgba(155,142,196,0.4))', 'drop-shadow(0 0 50px rgba(155,142,196,0.75))', 'drop-shadow(0 0 20px rgba(155,142,196,0.4))'] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <VigiaLogo size={260} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-display"
          style={{ fontSize: 86, fontWeight: 800, color: 'var(--text)', lineHeight: 1, letterSpacing: -4, marginBottom: 24 }}
        >
          Vigía
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          style={{ fontSize: 20, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 64 }}
        >
          Sistema de Alertas Inteligentes<br />para Clínicas Médicas
        </motion.p>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + i * 0.1 }}
              style={{ display: 'flex', alignItems: 'center', gap: 20 }}
            >
              <div style={{
                width: 54, height: 54, borderRadius: 16, flexShrink: 0,
                background: 'rgba(155,142,196,0.1)',
                border: '1px solid rgba(155,142,196,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {f.icon}
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{f.title}</p>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* RIGHT PANEL */}
      <div
        className="w-full lg:w-[56%] px-6 sm:px-10 lg:pl-20 lg:pr-12"
        style={{
          minHeight: '100vh',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 40, paddingBottom: 40,
          position: 'relative', zIndex: 10,
        }}
      >
        <div style={{ width: '100%', maxWidth: 520 }}>
          <GlowingCard className="p-8 sm:p-10 lg:p-12">

            {/* Mobile logo */}
            <div className="lg:!hidden" style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 40 }}>
              <VigiaLogo size={80} />
              <div>
                <p className="font-display" style={{ fontWeight: 700, fontSize: 26, color: 'var(--text)' }}>Vigía</p>
                <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 2 }}>Alertas Inteligentes</p>
              </div>
            </div>

            {/* Title */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode + 'title'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={{ marginBottom: 36 }}
              >
                <h2 className="font-display" style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
                  {mode === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
                </h2>
                <p style={{ fontSize: 16, color: 'var(--muted)' }}>
                  {mode === 'login' ? 'Ingresa tus credenciales para continuar' : 'Completa el formulario para comenzar'}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Tabs */}
            <div style={{
              display: 'flex', background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)', borderRadius: 16, padding: 5, marginBottom: 36,
            }}>
              {(['login', 'register'] as const).map((m) => (
                <motion.button
                  key={m}
                  onClick={() => { setMode(m); setError('') }}
                  style={{
                    flex: 1, padding: '14px 0', borderRadius: 13,
                    fontSize: 15, fontWeight: 500, cursor: 'pointer',
                    border: 'none', background: 'transparent',
                    position: 'relative', overflow: 'hidden',
                    color: mode === m ? 'white' : 'var(--muted)',
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  {mode === m && (
                    <motion.div
                      layoutId="tab"
                      style={{
                        position: 'absolute', inset: 0, borderRadius: 13,
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                      }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span style={{ position: 'relative', zIndex: 1 }}>
                    {m === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                  </span>
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
                  style={{ display: 'flex', flexDirection: 'column', gap: 22 }}
                >
                  <AnimatedInput
                    label="Correo electrónico" type="email"
                    value={loginData.email}
                    onChange={v => setLoginData({ ...loginData, email: v })}
                    placeholder="admin@clinica.com" icon={<MailIcon />}
                  />
                  <AnimatedInput
                    label="Contraseña" type="password"
                    value={loginData.password}
                    onChange={v => setLoginData({ ...loginData, password: v })}
                    placeholder="••••••••" icon={<LockIcon />}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
                >
                  <AnimatedInput
                    label="Nombre completo" value={registerData.nombre}
                    onChange={v => setRegisterData({ ...registerData, nombre: v })}
                    placeholder="Dr. Juan Pérez" icon={<UserIcon />}
                  />
                  <AnimatedInput
                    label="Correo electrónico" type="email" value={registerData.email}
                    onChange={v => setRegisterData({ ...registerData, email: v })}
                    placeholder="admin@clinica.com" icon={<MailIcon />}
                  />
                  <AnimatedInput
                    label="Nombre de la clínica" value={registerData.nombre_clinica}
                    onChange={v => setRegisterData({ ...registerData, nombre_clinica: v })}
                    placeholder="Clínica San José" icon={<HospitalIcon />}
                  />
                  <div>
                    <AnimatedInput
                      label="Contraseña" type="password" value={registerData.password}
                      onChange={v => setRegisterData({ ...registerData, password: v })}
                      placeholder="Crea una contraseña segura" icon={<LockIcon />}
                    />
                    <AnimatePresence>
                      {registerData.password && <PasswordRequirements password={registerData.password} />}
                    </AnimatePresence>
                  </div>
                  <AnimatedInput
                    label="Confirmar contraseña" type="password" value={registerData.confirmar}
                    onChange={v => setRegisterData({ ...registerData, confirmar: v })}
                    placeholder="Repite tu contraseña" icon={<LockIcon />}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    marginTop: 22, padding: '14px 18px', borderRadius: 14,
                    background: 'rgba(232,160,196,0.1)',
                    border: '1px solid rgba(232,160,196,0.3)',
                    color: 'var(--danger)', fontSize: 14,
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                >
                  <AlertIcon /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Button */}
            <motion.button
              onClick={mode === 'login' ? handleLogin : handleRegister}
              disabled={loading || (mode === 'register' && registerData.password.length > 0 && !validatePassword(registerData.password))}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              style={{
                width: '100%', marginTop: 32, padding: '19px 0', borderRadius: 18,
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                color: 'white', fontSize: 16, fontWeight: 600,
                border: 'none',
                cursor: (loading || (mode === 'register' && registerData.password.length > 0 && !validatePassword(registerData.password))) ? 'not-allowed' : 'pointer',
                boxShadow: '0 10px 32px rgba(155,142,196,0.45)',
                opacity: (loading || (mode === 'register' && registerData.password.length > 0 && !validatePassword(registerData.password))) ? 0.5 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 20, height: 20, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}
                  />
                  Procesando...
                </>
              ) : mode === 'login' ? 'Ingresar al sistema' : 'Crear cuenta'}
            </motion.button>

            {/* Footer */}
            <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)', marginTop: 28 }}>
              {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
              <motion.button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
                whileHover={{ scale: 1.05 }}
                style={{
                  color: 'var(--primary)', fontWeight: 600,
                  background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: 14,
                }}
              >
                {mode === 'login' ? 'Regístrate gratis' : 'Inicia sesión'}
              </motion.button>
            </p>
          </GlowingCard>
        </div>
      </div>
    </div>
  )
}