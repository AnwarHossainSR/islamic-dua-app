import bundleAnalyzer from '@next/bundle-analyzer'
import type { NextConfig } from 'next'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
    serverActions: {
      allowedOrigins: ['islamic-dua-app.vercel.app', 'localhost:3000'],
    },
  },
  cacheComponents: true,
  reactCompiler: true,
  typedRoutes: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Force revalidation in production
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ]
  },
}

export default withBundleAnalyzer(nextConfig)
