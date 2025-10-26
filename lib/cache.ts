// Cache configuration and utilities
export const CACHE_TAGS = {
  DUAS: 'duas',
  DUA_CATEGORIES: 'dua-categories', 
  CHALLENGES: 'challenges',
  ACTIVITIES: 'activities',
  USER_PROGRESS: 'user-progress'
} as const

export const CACHE_DURATIONS = {
  SHORT: 300,    // 5 minutes
  MEDIUM: 1800,  // 30 minutes  
  LONG: 3600,    // 1 hour
  VERY_LONG: 86400 // 24 hours
} as const

export const getCacheKey = (prefix: string, ...params: (string | number)[]) => {
  return [prefix, ...params.map(p => String(p))].join('-')
}