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
        <linearGradient id="vgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C4B5E8" />
          <stop offset="50%" stopColor="#9B8EC4" />
          <stop offset="100%" stopColor="#7C6FBF" />
        </linearGradient>
        <linearGradient id="vgGrad2" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#7C6FBF" />
          <stop offset="100%" stopColor="#C4B5E8" />
        </linearGradient>
        <linearGradient id="vgPulse" x1="0" y1="0.5" x2="1" y2="0.5">
          <stop offset="0%" stopColor="#C4B5E8" stopOpacity="0" />
          <stop offset="20%" stopColor="#9B8EC4" />
          <stop offset="80%" stopColor="#9B8EC4" />
          <stop offset="100%" stopColor="#C4B5E8" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Outer ring */}
      <circle cx="256" cy="256" r="240" stroke="url(#vgGrad)" strokeWidth="1.5" strokeOpacity="0.15" fill="none" />

      {/* Shield */}
      <path
        d="M256 56 C256 56 396 96 396 96 C404 98 410 106 410 114 L410 256 C410 340 340 410 256 456 C172 410 102 340 102 256 L102 114 C102 106 108 98 116 96 C116 96 256 56 256 56Z"
        fill="currentColor" fillOpacity="0.06"
        stroke="url(#vgGrad)" strokeWidth="2" strokeOpacity="0.4"
      />

      {/* Inner shield */}
      <path
        d="M256 80 C256 80 378 114 378 114 C384 116 388 122 388 128 L388 256 C388 328 326 390 256 432 C186 390 124 328 124 256 L124 128 C124 122 128 116 134 114 C134 114 256 80 256 80Z"
        fill="none"
        stroke="url(#vgGrad2)" strokeWidth="0.8" strokeOpacity="0.2"
      />

      {/* Eye - top */}
      <path d="M152 264 C152 264 200 188 256 188 C312 188 360 264 360 264" fill="none" stroke="url(#vgGrad)" strokeWidth="3.5" strokeLinecap="round" />

      {/* Eye - bottom */}
      <path d="M152 264 C152 264 200 340 256 340 C312 340 360 264 360 264" fill="none" stroke="url(#vgGrad)" strokeWidth="3.5" strokeLinecap="round" />

      {/* Iris */}
      <circle cx="256" cy="264" r="52" fill="none" stroke="url(#vgGrad2)" strokeWidth="2.5" strokeOpacity="0.7" />
      <circle cx="256" cy="264" r="50" fill="#9B8EC4" fillOpacity="0.15" />
      <circle cx="256" cy="264" r="36" fill="none" stroke="#9B8EC4" strokeWidth="1" strokeOpacity="0.35" />

      {/* Pupil */}
      <circle cx="256" cy="264" r="24" fill="url(#vgGrad)" />
      <circle cx="256" cy="264" r="18" fill="#5A4FA8" fillOpacity="0.6" />

      {/* Shine */}
      <circle cx="268" cy="252" r="7" fill="white" fillOpacity="0.3" />
      <circle cx="272" cy="248" r="3.5" fill="white" fillOpacity="0.5" />

      {/* Pulse line */}
      <path
        d="M160 380 L210 380 L225 362 L240 394 L256 368 L268 380 L285 380 L298 366 L310 388 L322 380 L352 380"
        fill="none" stroke="url(#vgPulse)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.65"
      />

      {/* Accent dots */}
      <circle cx="256" cy="216" r="2.5" fill="#C4B5E8" fillOpacity="0.5" />
      <circle cx="256" cy="312" r="2.5" fill="#C4B5E8" fillOpacity="0.5" />
      <circle cx="208" cy="264" r="2.5" fill="#C4B5E8" fillOpacity="0.5" />
      <circle cx="304" cy="264" r="2.5" fill="#C4B5E8" fillOpacity="0.5" />
    </svg>
  )
}