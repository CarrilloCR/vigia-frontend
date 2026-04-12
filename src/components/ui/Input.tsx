'use client'
import { useState } from 'react'

interface InputProps {
  label?: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  icon?: string
}

export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  icon,
}: InputProps) {
  const [focused, setFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
          {label}
        </label>
      )}
      <div
        className="relative flex items-center rounded-2xl transition-all duration-200"
        style={{
          background: 'var(--glass)',
          border: `1px solid ${focused ? 'var(--primary)' : error ? 'var(--danger)' : 'var(--border)'}`,
          boxShadow: focused
            ? '0 0 0 3px rgba(155, 142, 196, 0.18), var(--shadow-sm)'
            : 'var(--shadow-sm)',
        }}
      >
        {icon && (
          <span className="pl-4 text-lg" style={{ color: 'var(--muted)' }}>{icon}</span>
        )}
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="w-full px-5 py-4 bg-transparent outline-none text-sm"
          style={{ color: 'var(--text)' }}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="pr-4 text-lg"
            style={{ color: 'var(--muted)' }}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>
      )}
    </div>
  )
}