'use client'

interface ShinyTextProps {
  text: string
  className?: string
  speed?: number
}

export default function ShinyText({ text, className = '', speed = 3 }: ShinyTextProps) {
  return (
    <span
      className={className}
      style={{
        background: `linear-gradient(90deg, var(--muted) 0%, var(--text) 40%, var(--primary) 50%, var(--text) 60%, var(--muted) 100%)`,
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: `shine ${speed}s linear infinite`,
      }}
    >
      {text}
      <style>{`
        @keyframes shine {
          to { background-position: 200% center; }
        }
      `}</style>
    </span>
  )
}