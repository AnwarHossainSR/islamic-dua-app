export const APP_NAME = 'Heaven Rose Islamic';

// Route names for React Navigation
export const ROUTES = {
  // Auth
  LOGIN: 'Login',
  SIGNUP: 'Signup',

  // Main tabs
  DASHBOARD: 'Dashboard',
  CHALLENGES: 'Challenges',
  ACTIVITIES: 'Activities',
  DUAS: 'Duas',
  SETTINGS: 'Settings',

  // Detail screens
  CHALLENGE_DETAIL: 'ChallengeDetail',
  CHALLENGE_PROGRESS: 'ChallengeProgress',
  CHALLENGE_FORM: 'ChallengeForm',
  CHALLENGE_PREVIEW: 'ChallengePreview',
  ACTIVITY_DETAIL: 'ActivityDetail',
  DUA_DETAIL: 'DuaDetail',
  DUA_ADD: 'DuaAdd',
  DUA_EDIT: 'DuaEdit',

  // Other screens
  MISSED_CHALLENGES: 'MissedChallenges',
  AI_CHAT: 'AIChat',

  // Admin screens
  ADMIN_USERS: 'AdminUsers',
  ADMIN_PERMISSIONS: 'AdminPermissions',
  ADMIN_USER_PERMISSIONS: 'AdminUserPermissions',
  ADMIN_LOGS: 'AdminLogs',
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];
