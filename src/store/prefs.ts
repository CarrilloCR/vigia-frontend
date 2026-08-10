import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Idioma = 'es' | 'en'
export type FontSize = 'sm' | 'md' | 'lg' | 'xl'

// Escala global de la interfaz por tamaño de fuente (accesibilidad).
export const FONT_SCALE: Record<FontSize, number> = { sm: 0.9, md: 1, lg: 1.12, xl: 1.28 }

interface PrefsState {
  animaciones: boolean      // false → reduce-motion (desactiva animaciones)
  compacto: boolean         // true → densidad compacta
  autoRefresh: boolean      // true → dashboard refresca datos periódicamente
  cursorCustom: boolean     // true → cursor personalizado; false → cursor normal
  sonido: boolean           // true → sonido al recibir alertas nuevas
  idioma: Idioma
  fontSize: FontSize        // escala de la interfaz (accesibilidad)
  set: (patch: Partial<PrefsState>) => void
}

/** Aplica las preferencias que se reflejan en <html> (clases + zoom global). */
export function applyPrefs(p: Pick<PrefsState, 'animaciones' | 'compacto'> & Partial<Pick<PrefsState, 'fontSize'>>) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.toggle('reduce-motion', !p.animaciones)
  root.classList.toggle('compact', p.compacto)
  // Zoom escala TODO (incl. medidas en px) — accesibilidad real sin refactor a rem.
  // Se aplica al contenedor #app-zoom (NO a <html>) para que el cursor custom,
  // que vive fuera de ese contenedor y lee coords del viewport, no se descuadre.
  const scale = FONT_SCALE[p.fontSize ?? 'md']
  const target = document.getElementById('app-zoom')
  ;(root.style as any).zoom = ''
  if (target) (target.style as any).zoom = String(scale)
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      animaciones: true,
      compacto: false,
      autoRefresh: true,
      cursorCustom: true,
      sonido: true,
      idioma: 'es',
      fontSize: 'md',
      set: (patch) =>
        set((state) => {
          const next = { ...state, ...patch }
          applyPrefs(next)
          return patch
        }),
    }),
    {
      name: 'vigia-prefs',
      onRehydrateStorage: () => (state) => {
        if (state) applyPrefs(state)
      },
    }
  )
)
