import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { AuthBootstrap } from '@/components/providers/AuthBootstrap'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'ArNet - Enterprise AI Platform',
  description: 'Plataforma empresarial de atendimento com inteligência artificial',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="font-sans antialiased bg-zinc-950 text-zinc-100">
        <AuthBootstrap>
          <AuthGuard>{children}</AuthGuard>
        </AuthBootstrap>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
