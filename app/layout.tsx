import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Krishi Bandhu',
  description: 'Official Government Portal to help farmers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
