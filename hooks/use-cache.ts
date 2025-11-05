import { useCallback, useRef } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

export function useCache<T>(ttl: number = 5 * 60 * 1000) { // 5 minutes default
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map())

  const get = useCallback((key: string): T | null => {
    const entry = cache.current.get(key)
    if (!entry) return null
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      cache.current.delete(key)
      return null
    }
    
    return entry.data
  }, [])

  const set = useCallback((key: string, data: T, customTtl?: number) => {
    cache.current.set(key, {
      data,
      timestamp: Date.now(),
      ttl: customTtl || ttl
    })
  }, [ttl])

  const clear = useCallback((key?: string) => {
    if (key) {
      cache.current.delete(key)
    } else {
      cache.current.clear()
    }
  }, [])

  return { get, set, clear }
}