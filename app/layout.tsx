import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ask Me Girl!',
  icons: {
    icon: '/favicon.ico',
  },
  description: 'Your Sassy Smart Bestie'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
