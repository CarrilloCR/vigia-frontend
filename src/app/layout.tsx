import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vigía - Sistema de Alertas Inteligentes',
  description: 'Monitoreo inteligente de KPIs para clínicas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}