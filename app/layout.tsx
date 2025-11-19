import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { Analytics } from '@vercel/analytics/react'
import { Header } from '@/components/layout/header'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Heaven Rose Islamic - Your Spiritual Companion',
    template: '%s | Heaven Rose Islamic'
  },
  description: 'A comprehensive Islamic application featuring daily duas, spiritual challenges, and community engagement tools.',
  keywords: ['Islamic', 'Dua', 'Prayer', 'Spiritual', 'Muslim', 'Community', 'Challenges'],
  authors: [{ name: 'Heaven Rose Islamic Team' }],
  creator: 'Heaven Rose Islamic',
  publisher: 'Heaven Rose Islamic',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Heaven Rose Islamic - Your Spiritual Companion',
    description: 'A comprehensive Islamic application featuring daily duas, spiritual challenges, and community engagement tools.',
    siteName: 'Heaven Rose Islamic',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Heaven Rose Islamic - Your Spiritual Companion',
    description: 'A comprehensive Islamic application featuring daily duas, spiritual challenges, and community engagement tools.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          {children}
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}