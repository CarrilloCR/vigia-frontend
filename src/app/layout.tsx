import type { Metadata } from 'next'
import './globals.css'
import ThemeProvider from '../components/ThemeProvider'
import CursorEffect from '../components/CursorEffect'

export const metadata: Metadata = {
  title: 'Vigía — Sistema de Alertas Inteligentes',
  description: 'Monitoreo inteligente de KPIs para clínicas médicas',
  icons: { icon: '/logo-mark.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme="dark">
      <body style={{ margin: 0, padding: 0, minHeight: '100vh' }}>
        <ThemeProvider>
          {/* CursorEffect va FUERA del contenedor con zoom: lee coordenadas del
              viewport y el zoom escalaría su sistema de coordenadas. */}
          <CursorEffect />
          <div id="app-zoom" suppressHydrationWarning>
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
