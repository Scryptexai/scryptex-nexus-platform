
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AdminProviders } from '@/components/providers/admin-providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SCRYPTEX Admin Control Dashboard',
  description: 'Ultra-secure admin control dashboard for SCRYPTEX platform management',
  robots: 'noindex, nofollow', // Prevent indexing
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="googlebot" content="noindex, nofollow" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="icon" href="/admin-favicon.ico" />
      </head>
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <AdminProviders>
          {children}
        </AdminProviders>
      </body>
    </html>
  )
}
