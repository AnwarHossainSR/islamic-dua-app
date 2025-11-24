'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ClearCachePage() {
  const router = useRouter()

  useEffect(() => {
    const clearAllData = async () => {
      try {
        // Clear localStorage
        localStorage.clear()
        
        // Clear sessionStorage
        sessionStorage.clear()
        
        // Clear all caches
        if ('caches' in window) {
          const cacheNames = await caches.keys()
          await Promise.all(cacheNames.map(name => caches.delete(name)))
        }
        
        console.log('Cache and storage cleared')
        
        // Navigate to login after clearing
        router.push('/login')
      } catch (error) {
        console.error('Error clearing cache:', error)
        router.push('/login')
      }
    }

    clearAllData()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Clearing cache and storage...</p>
      </div>
    </div>
  )
}