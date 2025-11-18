// Auth caching to reduce redundant calls
let userCache: { user: any; timestamp: number } | null = null
const CACHE_DURATION = 5000 // 5 seconds

export function getCachedUser() {
  if (userCache && Date.now() - userCache.timestamp < CACHE_DURATION) {
    return userCache.user
  }
  return null
}

export function setCachedUser(user: any) {
  userCache = {
    user,
    timestamp: Date.now()
  }
}

export function clearUserCache() {
  userCache = null
}