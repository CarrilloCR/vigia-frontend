import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  isDark: boolean
  toggle: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: true,
      toggle: () =>
        set((state) => {
          const newIsDark = !state.isDark
          document.documentElement.setAttribute(
            'data-theme',
            newIsDark ? 'dark' : 'light'
          )
          return { isDark: newIsDark }
        }),
    }),
    {
      name: 'vigia-theme',
    }
  )
)