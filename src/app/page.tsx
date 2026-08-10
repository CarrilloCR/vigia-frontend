'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/auth'
import api from '../lib/axios'
import { useToastStore } from '../store/toast'
import ShaderBackground from '../components/reactbits/ShaderBackground'
import HeroDemo3D from '../components/reactbits/HeroDemo3D'
import AnimatedInput from '../components/reactbits/AnimatedInput'
import PasswordRequirements, { validatePassword } from '../components/ui/PasswordRequirements'
import ThemeToggle from '../components/ui/ThemeToggle'
import VigiaLogo from '../components/ui/VigiaLogo'

const MailIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
)
const LockIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
)
const UserIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
)
const AlertIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
)

const stats = [
  { n: '11', l: 'KPIs vigilados',
    icon: <path d="M3 3v18h18M7 14l3-4 3 3 4-6" /> },
  { n: '24/7', l: 'Monitoreo activo',
    icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></> },
  { n: '<1min', l: 'Detección de anomalías',
    icon: <path d="M13 2 3 14h7l-1 8 10-12h-7z" /> },
  { n: 'IA', l: 'Análisis con Claude',
    icon: <><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17l-1.9-5.1L4.5 10l5.6-1.4z" /><circle cx="18" cy="18" r="1.6" /><circle cx="6" cy="17" r="1.2" /></> },
]

interface ClinicaPublica { id: number; nombre: string; sedes: { id: number; nombre: string }[] }

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [demoOpen, setDemoOpen] = useState(false)  // modal con el recorrido de producto
  const router = useRouter()
  const { setAuth, isAuthenticated } = useAuthStore()
  const toast = useToastStore()

  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [registerData, setRegisterData] = useState({ nombre: '', email: '', password: '', confirmar: '' })
  const [clinicasPublicas, setClinicasPublicas] = useState<ClinicaPublica[]>([])
  const [selectedClinicaId, setSelectedClinicaId] = useState<number | null>(null)
  const [selectedSedeId, setSelectedSedeId] = useState<number | null>(null)

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard')
  }, [isAuthenticated, router])

  useEffect(() => {
    api.get('/clinicas/publico/').then(res => setClinicasPublicas(res.data)).catch(() => {})
  }, [])

  const sedesDeClinica = clinicasPublicas.find(c => c.id === selectedClinicaId)?.sedes ?? []

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) return setError('Completa todos los campos.')
    setLoading(true); setError('')
    try {
      const res = await api.post('/auth/login/', loginData)
      setAuth(res.data.user, res.data.tokens.access, res.data.tokens.refresh)
      toast.success('Bienvenido', `Hola ${res.data.user.nombre}, ingresaste correctamente.`)
      router.push('/dashboard')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string; detail?: string } } }
      setError(e.response?.data?.error || e.response?.data?.detail || 'Credenciales inválidas o error del servidor.')
    } finally { setLoading(false) }
  }

  const handleRegister = async () => {
    if (!registerData.nombre || !registerData.email || !registerData.password)
      return setError('Nombre, email y contraseña son requeridos.')
    if (!selectedClinicaId) return setError('Selecciona una clínica.')
    if (!validatePassword(registerData.password)) return setError('La contraseña no cumple todos los requisitos.')
    if (registerData.password !== registerData.confirmar) return setError('Las contraseñas no coinciden.')
    setLoading(true); setError('')
    try {
      const payload: Record<string, unknown> = {
        nombre: registerData.nombre,
        email: registerData.email,
        password: registerData.password,
        clinica_id: selectedClinicaId,
      }
      if (selectedSedeId) payload.sede_id = selectedSedeId
      const res = await api.post('/auth/register/', payload)
      setAuth(res.data.user, res.data.tokens.access, res.data.tokens.refresh)
      toast.success('Cuenta creada', res.data.message || 'Tu acceso está en revisión. Recibirás confirmación pronto.')
      router.push('/dashboard')
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: string; email?: string[]; detail?: string } } }).response?.data
      setError(data?.error || data?.email?.[0] || data?.detail || 'Error al crear la cuenta. Verifica los datos.')
    } finally { setLoading(false) }
  }

  const registerBlocked = mode === 'register' && registerData.password.length > 0 && !validatePassword(registerData.password)
  const selectStyle = (filled: boolean): React.CSSProperties => ({
    width: '100%', padding: '13px 15px', borderRadius: 'var(--r-md)',
    border: '1px solid var(--border)', background: 'var(--sunken)',
    color: filled ? 'var(--text)' : 'var(--muted)', fontSize: 14, outline: 'none', cursor: 'pointer',
  })

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'var(--void)', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      <ShaderBackground />

      <div style={{ position: 'absolute', top: 24, right: 24, zIndex: 30, display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Botón "?" → abre el recorrido de producto (video/demo oculto por defecto). */}
        <motion.button onClick={() => setDemoOpen(true)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
          title="Ver cómo funciona Vigía"
          style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--glass)', backdropFilter: 'blur(12px)', color: 'var(--primary)', cursor: 'pointer', fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(0,214,178,0.2)' }}>
          ?
        </motion.button>
        <ThemeToggle />
      </div>

      {/* Modal: recorrido/demo del producto (aparece al tocar "?") */}
      <AnimatePresence>
        {demoOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDemoOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(4,3,12,0.82)', backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 760, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <p className="eyebrow" style={{ color: 'var(--primary)' }}>Recorrido</p>
                  <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: '2px 0 0' }}>Cómo funciona Vigía</h3>
                </div>
                <button onClick={() => setDemoOpen(false)}
                  style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--sunken)', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
              </div>
              {/* Video real del producto: dashboard, KPIs y configuración. */}
              <video controls autoPlay loop muted playsInline
                style={{ display: 'block', width: '100%', maxHeight: '70vh', background: 'var(--void)' }}>
                <source src="/preview-dashboard.webm" type="video/webm" />
                <source src="/preview-dashboard.mp4" type="video/mp4" />
              </video>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── LEFT · brand storytelling ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex"
        style={{
          width: '50%', minHeight: '100vh',
          flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end',
          paddingRight: 'clamp(40px, 5vw, 88px)', paddingLeft: 'clamp(24px, 3vw, 56px)',
          paddingTop: 'clamp(48px, 8vh, 96px)', paddingBottom: 'clamp(40px, 6vh, 72px)',
          position: 'relative', zIndex: 10,
        }}
      >
        <div style={{ width: '100%', maxWidth: 540, display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div>
            <motion.span initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="eyebrow" style={{ marginBottom: 20, display: 'inline-flex' }}>
              Inteligencia clínica en tiempo real
            </motion.span>

            {/* Wordmark — the logo IS the "V" of Vigía */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: 'flex', alignItems: 'flex-end', gap: 0 }}>
              <div style={{ filter: 'drop-shadow(0 0 34px rgba(0,214,178,0.45))', marginBottom: '-0.06em', flexShrink: 0 }}>
                <VigiaLogo size={172} />
              </div>
              <span
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 700, fontSize: 'clamp(3.4rem, 7vw, 6.4rem)', lineHeight: 1.32,
                  letterSpacing: '-0.02em', marginLeft: '-0.18em',
                  background: 'linear-gradient(115deg, #2ED4C6 0%, #4FA0EC 48%, #A86CF2 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}
              >
                igía
              </span>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              style={{ fontSize: 19, color: 'var(--sub)', marginTop: 20, maxWidth: 480, lineHeight: 1.55 }}>
              Vigía monitorea los indicadores de tu clínica <strong style={{ color: 'var(--text)' }}>24/7</strong> y detecta cada anomalía —cancelaciones, no-shows, caídas de ingresos— <strong style={{ color: 'var(--text)' }}>antes de que cuesten</strong>.
            </motion.p>

          </div>

          {/* Hero — frame 3D con dashboard animado: alertas/KPIs de ejemplo cambiando. */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <HeroDemo3D />
          </motion.div>

          {/* Stats — 2×2 sobrio, acento jade unificado */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingTop: 22, borderTop: '1px solid var(--hairline)' }}>
            {stats.map((s, i) => (
              <motion.div key={s.l}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ x: 3 }}
                style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,214,178,0.10)', border: '1px solid rgba(0,214,178,0.28)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="tnum" style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.02em', color: 'var(--text)' }}>{s.n}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3, lineHeight: 1.25 }}>{s.l}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ─── RIGHT · auth ─── */}
      <div className="w-full lg:w-[50%] px-6 sm:px-10 justify-center lg:justify-start lg:pl-[clamp(40px,5vw,88px)]"
        style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 48, paddingBottom: 48, position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: '100%', maxWidth: 480, padding: 'clamp(28px, 4vw, 44px)',
            borderRadius: 'var(--r-xl)', background: 'var(--glass)',
            backdropFilter: 'blur(28px) saturate(1.6)', WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)',
          }}
        >
          {/* Mobile brand */}
          <div className="lg:!hidden" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <VigiaLogo size={56} />
            <div>
              <p className="font-display" style={{ fontWeight: 800, fontSize: 24, color: 'var(--text)', letterSpacing: '-0.02em' }}>Vigía</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Alertas inteligentes</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={mode + 'title'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} style={{ marginBottom: 30 }}>
              <span className="eyebrow" style={{ marginBottom: 12, display: 'inline-flex' }}>
                {mode === 'login' ? 'Acceso' : 'Registro'}
              </span>
              <h2 className="display-md" style={{ color: 'var(--text)', marginBottom: 8 }}>
                {mode === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
              </h2>
              <p style={{ fontSize: 15, color: 'var(--muted)' }}>
                {mode === 'login' ? 'Ingresa tus credenciales para continuar' : 'Completa el formulario para comenzar'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Tabs */}
          <div style={{ display: 'flex', background: 'var(--sunken)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)', padding: 4, marginBottom: 30 }}>
            {(['login', 'register'] as const).map(m => (
              <motion.button key={m} onClick={() => { setMode(m); setError('') }} whileTap={{ scale: 0.97 }}
                style={{ flex: 1, padding: '12px 0', borderRadius: 'var(--r-sm)', fontSize: 14.5, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'transparent', position: 'relative', color: mode === m ? '#03130F' : 'var(--muted)' }}>
                {mode === m && (
                  <motion.div layoutId="authtab" transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
                    style={{ position: 'absolute', inset: 0, borderRadius: 'var(--r-sm)', background: 'linear-gradient(135deg, var(--jade), #06B79B)', boxShadow: 'var(--shadow-brand)' }} />
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>{m === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</span>
              </motion.button>
            ))}
          </div>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.div key="login" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <AnimatedInput label="Correo electrónico" type="email" value={loginData.email} onChange={v => setLoginData({ ...loginData, email: v })} placeholder="admin@clinica.com" icon={<MailIcon />} />
                <AnimatedInput label="Contraseña" type="password" value={loginData.password} onChange={v => setLoginData({ ...loginData, password: v })} placeholder="••••••••" icon={<LockIcon />} />
              </motion.div>
            ) : (
              <motion.div key="register" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <AnimatedInput label="Nombre completo" value={registerData.nombre} onChange={v => setRegisterData({ ...registerData, nombre: v })} placeholder="Dr. Juan Pérez" icon={<UserIcon />} />
                <AnimatedInput label="Correo electrónico" type="email" value={registerData.email} onChange={v => setRegisterData({ ...registerData, email: v })} placeholder="admin@clinica.com" icon={<MailIcon />} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: 'var(--sub)', marginBottom: 7, fontWeight: 500 }}>Clínica *</label>
                    <select value={selectedClinicaId ?? ''} onChange={e => { setSelectedClinicaId(Number(e.target.value) || null); setSelectedSedeId(null) }} style={selectStyle(!!selectedClinicaId)}>
                      <option value="">Selecciona una clínica...</option>
                      {clinicasPublicas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                  {selectedClinicaId && sedesDeClinica.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
                      <label style={{ display: 'block', fontSize: 13, color: 'var(--sub)', marginBottom: 7, fontWeight: 500 }}>Sede <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(opcional)</span></label>
                      <select value={selectedSedeId ?? ''} onChange={e => setSelectedSedeId(Number(e.target.value) || null)} style={selectStyle(!!selectedSedeId)}>
                        <option value="">Sin sede específica</option>
                        {sedesDeClinica.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                      </select>
                    </motion.div>
                  )}
                </div>
                <div>
                  <AnimatedInput label="Contraseña" type="password" value={registerData.password} onChange={v => setRegisterData({ ...registerData, password: v })} placeholder="Crea una contraseña segura" icon={<LockIcon />} />
                  <AnimatePresence>{registerData.password && <PasswordRequirements password={registerData.password} />}</AnimatePresence>
                </div>
                <AnimatedInput label="Confirmar contraseña" type="password" value={registerData.confirmar} onChange={v => setRegisterData({ ...registerData, confirmar: v })} placeholder="Repite tu contraseña" icon={<LockIcon />} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ marginTop: 20, padding: '13px 16px', borderRadius: 'var(--r-md)', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: 'var(--danger)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertIcon /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            onClick={mode === 'login' ? handleLogin : handleRegister}
            disabled={loading || registerBlocked}
            whileHover={{ scale: loading || registerBlocked ? 1 : 1.02, y: loading || registerBlocked ? 0 : -1 }}
            whileTap={{ scale: loading || registerBlocked ? 1 : 0.98 }}
            style={{
              width: '100%', marginTop: 28, padding: '17px 0', borderRadius: 'var(--r-md)',
              background: 'linear-gradient(135deg, var(--jade), #06B79B)', color: '#03130F',
              fontSize: 15.5, fontWeight: 700, border: '1px solid rgba(0,214,178,0.5)', letterSpacing: '0.01em',
              cursor: loading || registerBlocked ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--shadow-brand)', opacity: loading || registerBlocked ? 0.5 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            {loading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ width: 19, height: 19, border: '2.5px solid rgba(3,19,15,0.35)', borderTopColor: '#03130F', borderRadius: '50%' }} />
                Procesando...
              </>
            ) : mode === 'login' ? 'Ingresar al sistema' : 'Crear cuenta'}
          </motion.button>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)', marginTop: 24 }}>
            {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <motion.button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }} whileHover={{ scale: 1.05 }}
              style={{ color: 'var(--jade)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
              {mode === 'login' ? 'Regístrate gratis' : 'Inicia sesión'}
            </motion.button>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
