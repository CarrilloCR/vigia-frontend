import type { Metadata } from 'next'
import './globals.css'
import ThemeProvider from '../components/ThemeProvider'

export const metadata: Metadata = {
  title: 'Vigía — Sistema de Alertas Inteligentes',
  description: 'Monitoreo inteligente de KPIs para clínicas médicas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}