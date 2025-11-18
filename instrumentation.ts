export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { performance, PerformanceObserver } = await import('perf_hooks')
    
    // Monitor Web Vitals
    const obs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log(`${entry.name}: ${entry.duration}ms`)
      }
    })
    
    obs.observe({ entryTypes: ['measure'] })
    
    // Log memory usage
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        const memUsage = process.memoryUsage()
        console.log('Memory Usage:', {
          rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        })
      }, 30000) // Every 30 seconds
    }
  }
}