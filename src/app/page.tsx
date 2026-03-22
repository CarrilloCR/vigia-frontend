'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      if (email && password) {
        router.push('/dashboard')
      } else {
        setError('Por favor ingresa tu email y contraseña')
      }
    } catch (err) {
      setError('Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="w-full max-w-md p-8 rounded-2xl shadow-lg" style={{ backgroundColor: 'var(--color-card)' }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
            <span className="text-white text-2xl font-bold">V</span>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-main)' }}>Vigía</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>Sistema de Alertas Inteligentes</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-main)' }}>Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@clinica.com"
              className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
              style={{ borderColor: 'var(--color-secondary)', backgroundColor: 'var(--color-background)', color: 'var(--color-text-main)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-main)' }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
              style={{ borderColor: 'var(--color-secondary)', backgroundColor: 'var(--color-background)', color: 'var(--color-text-main)' }}
            />
          </div>
          {error && <p className="text-sm text-center" style={{ color: 'var(--color-danger)' }}>{error}</p>}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>
      </div>
    </main>
  )
}