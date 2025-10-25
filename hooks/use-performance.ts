'use client'

import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage?: number
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)

  useEffect(() => {
    const measurePerformance = () => {
      if (typeof window === 'undefined') return

      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart
      const renderTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart

      let memoryUsage: number | undefined
      if ('memory' in performance) {
        const memory = (performance as any).memory
        memoryUsage = memory.usedJSHeapSize / 1024 / 1024 // MB
      }

      setMetrics({
        loadTime: Math.round(loadTime),
        renderTime: Math.round(renderTime),
        memoryUsage: memoryUsage ? Math.round(memoryUsage * 100) / 100 : undefined
      })
    }

    // Measure after page load
    if (document.readyState === 'complete') {
      measurePerformance()
    } else {
      window.addEventListener('load', measurePerformance)
      return () => window.removeEventListener('load', measurePerformance)
    }
  }, [])

  const measureAction = (actionName: string, fn: () => void | Promise<void>) => {
    const start = performance.now()
    
    const result = fn()
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - start
        console.log(`Action "${actionName}" took ${Math.round(duration)}ms`)
      })
    } else {
      const duration = performance.now() - start
      console.log(`Action "${actionName}" took ${Math.round(duration)}ms`)
      return result
    }
  }

  return {
    metrics,
    measureAction
  }
}