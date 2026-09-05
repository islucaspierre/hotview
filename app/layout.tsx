import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Baloo_2, Inter } from 'next/font/google'
import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _baloo2 = Baloo_2({ subsets: ['latin'], variable: '--font-baloo-2' })

export const metadata: Metadata = {
  title: 'Hotview | Sua vitrine digital no WhatsApp',
  description: 'A plataforma para pequenos negócios criarem sua própria vitrine digital e venderem diretamente pelo WhatsApp.',
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#003f36',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`dark bg-background ${_inter.variable} ${_baloo2.variable}`}>
      <body className="antialiased font-sans">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
