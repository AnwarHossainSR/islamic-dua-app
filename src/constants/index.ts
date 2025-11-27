export const APP_NAME = 'Islamic Dua App'

export const QUERY_KEYS = {
  USER: 'user',
  CHALLENGES: 'challenges',
  CHALLENGE: (id: string) => ['challenge', id],
  ACTIVITIES: 'activities',
  ACTIVITY: (id: string) => ['activity', id],
  DUAS: 'duas',
  DUA: (id: string) => ['dua', id],
  DASHBOARD: 'dashboard',
} as const

export const CHALLENGE_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
} as const

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  EDITOR: 'editor',
} as const
