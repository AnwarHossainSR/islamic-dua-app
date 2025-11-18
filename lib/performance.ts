// Performance monitoring utilities for Next.js 16
export function measurePerformance<T>(name: string, fn: () => T): T {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`)
  }
  
  return result
}

export async function measureAsyncPerformance<T>(
  name: string, 
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now()
  const result = await fn()
  const end = performance.now()
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`)
  }
  
  return result
}

// Web Vitals tracking
export function trackWebVitals() {
  if (typeof window !== 'undefined') {
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(console.log)
      onINP(console.log)
      onFCP(console.log)
      onLCP(console.log)
      onTTFB(console.log)
    })
  }
}