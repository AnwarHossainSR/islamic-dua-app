import { Header } from '@/components/layout/header'
import { NotificationProvider } from '@/components/notifications/notification-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { Toaster } from '@/components/ui/toaster'
import { Analytics } from '@vercel/analytics/next'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import type React from 'react'
import { Suspense } from 'react'
import './globals.css'

// export const dynamic = 'force-dynamic' // Removed for React 19 compatibility

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://islamic-dua-app.vercel.app'),
  title: {
    default: 'Heaven Rose Islamic - Dua & Dhikr App',
    template: '%s | Heaven Rose Islamic',
  },
  description:
    'Your companion for Islamic duas and dhikr with Bangla translations. Track daily challenges, manage activities, and strengthen your spiritual journey.',
  keywords: ['Islamic', 'Dua', 'Dhikr', 'Bangla', 'Prayer', 'Muslim', 'Spiritual', 'Challenge'],
  authors: [{ name: 'Heaven Rose Islamic Team' }],
  creator: 'Heaven Rose Islamic',
  publisher: 'Heaven Rose Islamic',
  generator: 'Next.js',
  manifest: '/manifest.json',
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
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Heaven Rose Islamic',
    startupImage: '/icon-512.jpg',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://islamic-dua-app.vercel.app',
    siteName: 'Heaven Rose Islamic',
    title: 'Heaven Rose Islamic - Dua & Dhikr App',
    description: 'Your companion for Islamic duas and dhikr with Bangla translations',
    images: [
      {
        url: '/icon-512.jpg',
        width: 512,
        height: 512,
        alt: 'Heaven Rose Islamic Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Heaven Rose Islamic - Dua & Dhikr App',
    description: 'Your companion for Islamic duas and dhikr with Bangla translations',
    images: ['/icon-512.jpg'],
  },
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'Religion & Spirituality',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#10b981' },
    { media: '(prefers-color-scheme: dark)', color: '#059669' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-32.jpg" sizes="32x32" type="image/jpeg" />
        <link rel="icon" href="/icon-16.jpg" sizes="16x16" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/icon-192.jpg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://vercel.com" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <NotificationProvider>
              <Suspense fallback={null}>
                <Header />
                {/* className="min-h-[calc(100vh-113px)] px-4 md:px-6 py-6" */}
                <main>{children}</main>
                <Toaster />
              </Suspense>
              <Analytics />
            </NotificationProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
