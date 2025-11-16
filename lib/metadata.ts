import { Metadata } from 'next'

export function generatePageMetadata({
  title,
  description,
  path = '',
  image = '/og-image.png'
}: {
  title: string
  description: string
  path?: string
  image?: string
}): Metadata {
  const url = `https://islamic-dua-app.vercel.app${path}`
  
  return {
    title: `${title} | Islamic Dua App`,
    description,
    openGraph: {
      title: `${title} | Islamic Dua App`,
      description,
      url,
      siteName: 'Islamic Dua App',
      images: [{ url: image, width: 1200, height: 630 }],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Islamic Dua App`,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  }
}

export const defaultMetadata: Metadata = {
  title: 'Islamic Dua App - Daily Duas and Spiritual Challenges',
  description: 'A modern Islamic application for daily duas, spiritual challenges, and dhikr tracking. Build your spiritual habits with our comprehensive collection.',
  keywords: ['Islamic', 'Dua', 'Prayer', 'Dhikr', 'Muslim', 'Spiritual', 'Challenge', 'Bangladesh'],
  authors: [{ name: 'Islamic Dua App Team' }],
  creator: 'Islamic Dua App',
  publisher: 'Islamic Dua App',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}