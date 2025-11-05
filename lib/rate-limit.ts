interface RateLimitConfig {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max requests per interval
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

const cache = new Map<string, { count: number; reset: number }>()

export function rateLimit(config: RateLimitConfig) {
  return {
    check: (identifier: string): RateLimitResult => {
      const now = Date.now()
      const key = `${identifier}`
      
      const record = cache.get(key)
      const windowStart = now - config.interval
      
      if (!record || record.reset < windowStart) {
        // New window or expired record
        const reset = now + config.interval
        cache.set(key, { count: 1, reset })
        
        return {
          success: true,
          limit: config.uniqueTokenPerInterval,
          remaining: config.uniqueTokenPerInterval - 1,
          reset
        }
      }
      
      if (record.count >= config.uniqueTokenPerInterval) {
        return {
          success: false,
          limit: config.uniqueTokenPerInterval,
          remaining: 0,
          reset: record.reset
        }
      }
      
      record.count++
      
      return {
        success: true,
        limit: config.uniqueTokenPerInterval,
        remaining: config.uniqueTokenPerInterval - record.count,
        reset: record.reset
      }
    }
  }
}

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of cache.entries()) {
    if (record.reset < now) {
      cache.delete(key)
    }
  }
}, 60000) // Clean every minute