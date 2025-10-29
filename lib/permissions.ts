import { getSupabaseServerClient } from '@/lib/supabase/server'
import { apiLogger } from './logger'
import { canAccess, Permission, UserRole } from './permissions/constants'

// Re-export constants for server-side use
export * from './permissions/constants'

export async function getUserRole(userId?: string): Promise<UserRole> {
  const supabase = await getSupabaseServerClient()

  if (!userId) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    userId = user?.id
  }

  if (!userId) return 'user'

  const { data } = await supabase.rpc('get_user_role', { user_id: userId })

  return data || 'user'
}

export async function hasPermission(permission: string, userId?: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient()

  if (!userId) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    userId = user?.id
  }

  if (!userId) return false

  const { data } = await supabase.rpc('user_has_permission', {
    user_id: userId,
    permission_name: permission,
  })

  return data || false
}

export async function getUserPermissions(userId?: string): Promise<Permission[]> {
  const supabase = await getSupabaseServerClient()

  if (!userId) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    userId = user?.id
  }

  if (!userId) return []

  const { data } = await supabase
    .from('user_permissions')
    .select('permission_name, resource, action, description')
    .eq('user_id', userId)

  return (
    data?.map(p => ({
      name: p.permission_name,
      resource: p.resource,
      action: p.action,
      description: p.description,
    })) || []
  )
}

export async function requirePermission(permission: string, userId?: string): Promise<void> {
  const hasAccess = await hasPermission(permission, userId)
  if (!hasAccess) {
    apiLogger.error(`Access denied: Missing permission ${permission}`)
    throw new Error(`Access denied: Missing permission ${permission}`)
  }
}

export async function requireRole(requiredRole: UserRole, userId?: string): Promise<void> {
  const userRole = await getUserRole(userId)
  if (!canAccess(userRole, requiredRole)) {
    throw new Error(`Access denied: Requires ${requiredRole} role`)
  }
}
