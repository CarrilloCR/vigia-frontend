'use client'

interface VigiaLogoProps {
  size?: number
  className?: string
}

export default function VigiaLogo({ size = 48, className }: VigiaLogoProps) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Main jade gradient */}
        <linearGradient id="lgJade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#00FFD1" />
          <stop offset="50%"  stopColor="#00C9A7" />
          <stop offset="100%" stopColor="#00957A" />
        </linearGradient>
        {/* Orchid accent */}
        <linearGradient id="lgOrch" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#D4A8FF" />
          <stop offset="100%" stopColor="#B06EF5" />
        </linearGradient>
        {/* Sapphire accent */}
        <linearGradient id="lgSap" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   stopColor="#4A9EF0" />
          <stop offset="100%" stopColor="#A0D4FF" />
        </linearGradient>
        {/* Glow filter */}
        <filter id="glowJade" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glowStrong" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* Corner clip */}
        <clipPath id="hexClip">
          <rect x="8" y="8" width="104" height="104" rx="22" />
        </clipPath>
      </defs>

      {/* Background hexagon-rect */}
      <rect x="8" y="8" width="104" height="104" rx="22"
        fill="url(#lgJade)" fillOpacity="0.07"
        stroke="url(#lgJade)" strokeWidth="1.5" strokeOpacity="0.6"
      />
      {/* Inner border */}
      <rect x="13" y="13" width="94" height="94" rx="18"
        fill="none"
        stroke="url(#lgJade)" strokeWidth="0.75" strokeOpacity="0.25"
        strokeDasharray="6 10"
      />

      {/* Corner accent dots */}
      <circle cx="22"  cy="22"  r="2.5" fill="#00C9A7" fillOpacity="0.7" />
      <circle cx="98"  cy="22"  r="2.5" fill="#4A9EF0" fillOpacity="0.7" />
      <circle cx="22"  cy="98"  r="2.5" fill="#B06EF5" fillOpacity="0.7" />
      <circle cx="98"  cy="98"  r="2.5" fill="#FFD166" fillOpacity="0.5" />

      {/* ── The V shape ── */}
      {/* Left arm of V (going down-right to center) */}
      <path
        d="M22 28 L60 88"
        stroke="url(#lgJade)"
        strokeWidth="7"
        strokeLinecap="round"
        filter="url(#glowJade)"
      />
      {/* Right arm of V (going up-left to center) */}
      <path
        d="M60 88 L98 28"
        stroke="url(#lgOrch)"
        strokeWidth="7"
        strokeLinecap="round"
        filter="url(#glowJade)"
      />

      {/* ECG pulse cut into the V — horizontal bar with pulse wave */}
      {/* This crosses the V at the midpoint, creating the pulse line identity mark */}
      <g filter="url(#glowStrong)">
        <path
          d="M26 58 L38 58 L43 48 L49 68 L54 53 L59 58 L70 58 L75 48 L81 68 L87 53 L92 58"
          stroke="url(#lgSap)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.95"
        />
      </g>

      {/* Apex dot at V bottom */}
      <circle cx="60" cy="88" r="4" fill="url(#lgJade)" filter="url(#glowStrong)" />
      <circle cx="60" cy="88" r="2" fill="#00FFD1" />

      {/* Top crossbar on both arms — bracket accent */}
      <line x1="16" y1="28" x2="30" y2="28" stroke="#00C9A7" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <line x1="90" y1="28" x2="104" y2="28" stroke="#B06EF5" strokeWidth="3" strokeLinecap="round" opacity="0.6" />

      {/* Subtle scan line (horizontal, very thin) */}
      <line x1="13" y1="60" x2="107" y2="60" stroke="url(#lgJade)" strokeWidth="0.5" strokeOpacity="0.18" />
    </svg>
  )
}
