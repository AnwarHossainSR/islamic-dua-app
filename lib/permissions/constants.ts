export type UserRole = 'user' | 'editor' | 'super_admin'

export interface Permission {
  name: string
  resource: string
  action: string
  description?: string
}

export const PERMISSIONS = {
  // Challenges
  CHALLENGES_CREATE: 'challenges.create',
  CHALLENGES_READ: 'challenges.read', 
  CHALLENGES_UPDATE: 'challenges.update',
  CHALLENGES_DELETE: 'challenges.delete',
  CHALLENGES_MANAGE: 'challenges.manage',
  
  // Duas
  DUAS_CREATE: 'duas.create',
  DUAS_READ: 'duas.read',
  DUAS_UPDATE: 'duas.update', 
  DUAS_DELETE: 'duas.delete',
  DUAS_MANAGE: 'duas.manage',
  
  // Users
  USERS_READ: 'users.read',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  USERS_MANAGE: 'users.manage',
  
  // Settings
  SETTINGS_READ: 'settings.read',
  SETTINGS_UPDATE: 'settings.update',
  SETTINGS_MANAGE: 'settings.manage',
  
  // Logs
  LOGS_READ: 'logs.read',
  LOGS_DELETE: 'logs.delete',
  LOGS_MANAGE: 'logs.manage',
  
  // Activities
  ACTIVITIES_READ: 'activities.read',
  ACTIVITIES_MANAGE: 'activities.manage',
  
  // Dashboard
  DASHBOARD_READ: 'dashboard.read',
  DASHBOARD_MANAGE: 'dashboard.manage'
} as const

export function canAccess(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    'user': 0,
    'editor': 1, 
    'super_admin': 2
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}