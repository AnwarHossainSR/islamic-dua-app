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
        
        // Unregister service workers
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations()
          await Promise.all(registrations.map(reg => reg.unregister()))
        }
        
        // Clear all cookies
        document.cookie.split(";").forEach(cookie => {
          const eqPos = cookie.indexOf("=")
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
          // Clear for current path
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
          // Clear for root domain
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
          // Clear for parent domain
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`
        })
        
        // Clear IndexedDB
        if ('indexedDB' in window) {
          const databases = await indexedDB.databases()
          await Promise.all(databases.map(db => {
            if (db.name) {
              const deleteReq = indexedDB.deleteDatabase(db.name)
              return new Promise(resolve => {
                deleteReq.onsuccess = () => resolve(true)
                deleteReq.onerror = () => resolve(false)
              })
            }
          }))
        }
        
        console.log('All cache, storage, cookies, and databases cleared')
        
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