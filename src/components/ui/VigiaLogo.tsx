'use client'

interface VigiaLogoProps {
  size?: number
  className?: string
}

export default function VigiaLogo({ size = 48, className }: VigiaLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Main purple-violet */}
        <linearGradient id="vgMain" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E0D4F7" />
          <stop offset="35%" stopColor="#9B8EC4" />
          <stop offset="70%" stopColor="#7C6FBF" />
          <stop offset="100%" stopColor="#5A4FA8" />
        </linearGradient>
        {/* Warm rose-coral accent */}
        <linearGradient id="vgRose" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F2A7C3" />
          <stop offset="50%" stopColor="#E8A0C4" />
          <stop offset="100%" stopColor="#D47BA8" />
        </linearGradient>
        {/* Teal-mint accent */}
        <linearGradient id="vgTeal" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#5BC4A8" />
          <stop offset="50%" stopColor="#7AD4B8" />
          <stop offset="100%" stopColor="#A0E8D0" />
        </linearGradient>
        {/* Deep iris gradient */}
        <radialGradient id="vgIris" cx="0.45" cy="0.4" r="0.6">
          <stop offset="0%" stopColor="#C4B5E8" />
          <stop offset="40%" stopColor="#9B8EC4" />
          <stop offset="75%" stopColor="#6B5FB0" />
          <stop offset="100%" stopColor="#4A3F8F" />
        </radialGradient>
        {/* Pupil deep */}
        <radialGradient id="vgPupil" cx="0.4" cy="0.38" r="0.55">
          <stop offset="0%" stopColor="#3D2E7A" />
          <stop offset="100%" stopColor="#1A1440" />
        </radialGradient>
        {/* Pulse line multicolor */}
        <linearGradient id="vgPulse" x1="0" y1="0.5" x2="1" y2="0.5">
          <stop offset="0%" stopColor="#5BC4A8" stopOpacity="0.2" />
          <stop offset="20%" stopColor="#5BC4A8" />
          <stop offset="40%" stopColor="#9B8EC4" />
          <stop offset="60%" stopColor="#E8A0C4" />
          <stop offset="80%" stopColor="#E8A0C4" />
          <stop offset="100%" stopColor="#E8A0C4" stopOpacity="0.2" />
        </linearGradient>
        {/* Shield fill */}
        <linearGradient id="vgShield" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#9B8EC4" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#5A4FA8" stopOpacity="0.15" />
        </linearGradient>
        {/* Eye fill glow */}
        <radialGradient id="vgEyeGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#9B8EC4" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#9B8EC4" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer decorative ring */}
      <circle cx="256" cy="256" r="244" stroke="url(#vgMain)" strokeWidth="3" strokeOpacity="0.2" fill="none" />
      <circle cx="256" cy="256" r="236" stroke="url(#vgTeal)" strokeWidth="1" strokeOpacity="0.12" fill="none" strokeDasharray="8 16" />

      {/* Shield body */}
      <path
        d="M256 48 C256 48 410 94 410 94 C420 97 428 107 428 118 L428 264 C428 355 350 425 256 472 C162 425 84 355 84 264 L84 118 C84 107 92 97 102 94 C102 94 256 48 256 48Z"
        fill="url(#vgShield)"
        stroke="url(#vgMain)" strokeWidth="4.5" strokeLinejoin="round"
      />

      {/* Shield inner line */}
      <path
        d="M256 76 C256 76 390 116 390 116 C398 118 404 126 404 134 L404 264 C404 342 334 404 256 446 C178 404 108 342 108 264 L108 134 C108 126 114 118 122 116 C122 116 256 76 256 76Z"
        fill="none"
        stroke="url(#vgRose)" strokeWidth="1.5" strokeOpacity="0.25" strokeLinejoin="round"
      />

      {/* Eye glow background */}
      <ellipse cx="256" cy="258" rx="130" ry="80" fill="url(#vgEyeGlow)" />

      {/* Eye shape - top arc */}
      <path
        d="M126 258 C126 258 180 168 256 168 C332 168 386 258 386 258"
        fill="none" stroke="url(#vgMain)" strokeWidth="7" strokeLinecap="round"
      />
      {/* Eye shape - bottom arc */}
      <path
        d="M126 258 C126 258 180 348 256 348 C332 348 386 258 386 258"
        fill="none" stroke="url(#vgMain)" strokeWidth="7" strokeLinecap="round"
      />

      {/* Eye inner glow line - top */}
      <path
        d="M148 258 C148 258 196 184 256 184 C316 184 364 258 364 258"
        fill="none" stroke="url(#vgTeal)" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.35"
      />
      {/* Eye inner glow line - bottom */}
      <path
        d="M148 258 C148 258 196 332 256 332 C316 332 364 258 364 258"
        fill="none" stroke="url(#vgRose)" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.35"
      />

      {/* Lash accents - top */}
      <line x1="196" y1="194" x2="186" y2="166" stroke="url(#vgTeal)" strokeWidth="3.5" strokeLinecap="round" strokeOpacity="0.6" />
      <line x1="256" y1="172" x2="256" y2="142" stroke="url(#vgMain)" strokeWidth="3.5" strokeLinecap="round" strokeOpacity="0.7" />
      <line x1="316" y1="194" x2="326" y2="166" stroke="url(#vgRose)" strokeWidth="3.5" strokeLinecap="round" strokeOpacity="0.6" />

      {/* Iris outer ring */}
      <circle cx="256" cy="258" r="68" fill="none" stroke="url(#vgMain)" strokeWidth="5" strokeOpacity="0.8" />

      {/* Iris fill */}
      <circle cx="256" cy="258" r="65" fill="url(#vgIris)" fillOpacity="0.35" />

      {/* Iris detail rings */}
      <circle cx="256" cy="258" r="52" fill="none" stroke="#C4B5E8" strokeWidth="1.5" strokeOpacity="0.4" />
      <circle cx="256" cy="258" r="44" fill="none" stroke="url(#vgRose)" strokeWidth="1" strokeOpacity="0.25" />

      {/* Iris spokes */}
      <line x1="256" y1="196" x2="256" y2="212" stroke="#C4B5E8" strokeWidth="1.5" strokeOpacity="0.3" strokeLinecap="round" />
      <line x1="256" y1="304" x2="256" y2="320" stroke="#C4B5E8" strokeWidth="1.5" strokeOpacity="0.3" strokeLinecap="round" />
      <line x1="194" y1="258" x2="210" y2="258" stroke="#C4B5E8" strokeWidth="1.5" strokeOpacity="0.3" strokeLinecap="round" />
      <line x1="302" y1="258" x2="318" y2="258" stroke="#C4B5E8" strokeWidth="1.5" strokeOpacity="0.3" strokeLinecap="round" />

      {/* Pupil */}
      <circle cx="256" cy="258" r="32" fill="url(#vgPupil)" />
      <circle cx="256" cy="258" r="30" fill="none" stroke="#9B8EC4" strokeWidth="1.5" strokeOpacity="0.4" />

      {/* Shine spots */}
      <circle cx="272" cy="244" r="10" fill="white" fillOpacity="0.35" />
      <circle cx="278" cy="238" r="5" fill="white" fillOpacity="0.6" />
      <circle cx="242" cy="272" r="4" fill="white" fillOpacity="0.12" />

      {/* Pulse/heartbeat line - thick & colorful */}
      <path
        d="M108 396 L168 396 L190 370 L212 420 L234 378 L252 396 L280 396 L300 372 L320 414 L338 396 L404 396"
        fill="none" stroke="url(#vgPulse)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"
      />

      {/* Small decorative dots - multicolor */}
      <circle cx="136" cy="162" r="4" fill="#5BC4A8" fillOpacity="0.5" />
      <circle cx="376" cy="162" r="4" fill="#E8A0C4" fillOpacity="0.5" />
      <circle cx="136" cy="370" r="3.5" fill="#E8A0C4" fillOpacity="0.4" />
      <circle cx="376" cy="370" r="3.5" fill="#5BC4A8" fillOpacity="0.4" />

      {/* Corner accents on shield */}
      <circle cx="256" cy="78" r="5" fill="url(#vgMain)" fillOpacity="0.6" />
      <circle cx="108" cy="138" r="3.5" fill="#5BC4A8" fillOpacity="0.5" />
      <circle cx="404" cy="138" r="3.5" fill="#E8A0C4" fillOpacity="0.5" />
    </svg>
  )
}