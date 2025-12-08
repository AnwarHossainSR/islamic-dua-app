export const APP_NAME = 'Heaven Rose Islamic';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  CHALLENGES: '/challenges',
  CHALLENGE_DETAIL: (id: string) => `/challenges/${id}`,
  CHALLENGE_PROGRESS: (id: string) => `/challenges/progress/${id}`,
  ACTIVITIES: '/activities',
  ACTIVITY_DETAIL: (id: string) => `/activities/${id}`,
  DUAS: '/duas',
  DUA_DETAIL: (id: string) => `/duas/${id}`,
  SETTINGS: '/settings',
  MISSED_CHALLENGES: '/missed-challenges',
  ADMIN_USERS: '/users',
  ADMIN_PERMISSIONS: '/users/permissions',
  ADMIN_LOGS: '/admin/logs',
} as const;
