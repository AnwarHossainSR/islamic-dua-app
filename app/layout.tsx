import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Header } from "@/components/layout/header"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Heaven Rose Islamic - Dua & Dhikr App",
  description: "Your companion for Islamic duas and dhikr with Bangla translations",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Heaven Rose Islamic",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Heaven Rose Islamic",
    title: "Heaven Rose Islamic - Dua & Dhikr App",
    description: "Your companion for Islamic duas and dhikr with Bangla translations",
  },
  twitter: {
    card: "summary",
    title: "Heaven Rose Islamic - Dua & Dhikr App",
    description: "Your companion for Islamic duas and dhikr with Bangla translations",
  },
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
        <link rel="apple-touch-icon" href="/icon-192.jpg" />
        <meta name="theme-color" content="#10b981" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <Suspense fallback={null}>
            <Header />
            <main className="container min-h-[calc(100vh-4rem)] py-6">{children}</main>
            <Toaster />
          </Suspense>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
