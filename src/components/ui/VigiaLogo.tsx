'use client'

interface VigiaLogoProps {
  size?: number
  className?: string
}

/**
 * Vigía brand mark — public/logo-mark.svg (a copy of Vigia.svg whose viewBox
 * is cropped tight+square to the artwork, so it centers and fills cleanly at
 * any size). The original Vigia.svg is left untouched.
 */
export default function VigiaLogo({ size = 48, className }: VigiaLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-mark.svg"
      alt="Vigía"
      width={size}
      height={size}
      className={className}
      draggable={false}
      style={{ display: 'block', width: size, height: size, objectFit: 'contain', userSelect: 'none', flexShrink: 0 }}
    />
  )
}
