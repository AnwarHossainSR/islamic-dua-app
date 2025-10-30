'use server'

import { apiLogger } from '@/lib/logger'
import { PERMISSIONS } from '@/lib/permissions/constants'
import { getSupabaseAdminServerClient, getSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkPermission } from './auth'

export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
  created_at: string
}

export interface Role {
  role: string
  permissions: Permission[]
}

export interface UserWithPermissions {
  id: string
  user_id: string
  email: string
  role: string
  is_active: boolean
  created_at: string
  permissions: Permission[]
}

// Get all permissions
export async function getAllPermissions() {
  await checkPermission(PERMISSIONS.ADMIN_USERS_READ)
  const supabase = getSupabaseAdminServerClient()
  
  const { data, error } = await supabase
    .from('permissions')
    .select('*')
    .order('resource', { ascending: true })
    .order('action', { ascending: true })

  if (error) {
    apiLogger.error('Error fetching permissions', { error })
    return []
  }

  return data
}

// Get permissions for a specific role
export async function getRolePermissions(role: string): Promise<Permission[]> {
  await checkPermission(PERMISSIONS.ADMIN_USERS_READ)
  const supabase = getSupabaseAdminServerClient()
  
  const { data, error } = await supabase
    .from('role_permissions')
    .select(`
      permission:permissions(*)
    `)
    .eq('role', role)

  if (error) {
    apiLogger.error('Error fetching role permissions', { error, role })
    return []
  }

  return (data.map(item => item.permission).filter(Boolean) as unknown) as Permission[]
}

// Get all roles with their permissions
export async function getAllRolesWithPermissions(): Promise<Role[]> {
  await checkPermission(PERMISSIONS.ADMIN_USERS_READ)
  const supabase = getSupabaseAdminServerClient()
  
  const roles = ['user', 'editor', 'admin', 'super_admin']
  const rolesWithPermissions: Role[] = []

  for (const role of roles) {
    const permissions = await getRolePermissions(role)
    rolesWithPermissions.push({ role, permissions })
  }

  return rolesWithPermissions
}

// Add permission to role
export async function addPermissionToRole(role: string, permissionId: string) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_MANAGE)
  const supabase = getSupabaseAdminServerClient()
  const userSupabase = await getSupabaseServerClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('role_permissions')
    .insert({
      role,
      permission_id: permissionId
    })
    .select()

  if (error) {
    apiLogger.error('Error adding permission to role', { error, role, permissionId, userEmail: user?.email })
    return { error: 'Failed to add permission to role' }
  }

  apiLogger.info('Permission added to role', { role, permissionId, userEmail: user?.email })
  revalidatePath('/users')
  revalidatePath('/users/permissions')
  revalidatePath('/users/[id]/permissions', 'page')
  return { success: true }
}

// Remove permission from role
export async function removePermissionFromRole(role: string, permissionId: string) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_MANAGE)
  const supabase = getSupabaseAdminServerClient()
  const userSupabase = await getSupabaseServerClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  
  const { error } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role', role)
    .eq('permission_id', permissionId)

  if (error) {
    apiLogger.error('Error removing permission from role', { error, role, permissionId, userEmail: user?.email })
    return { error: 'Failed to remove permission from role' }
  }

  apiLogger.info('Permission removed from role', { role, permissionId, userEmail: user?.email })
  revalidatePath('/users')
  revalidatePath('/users/permissions')
  revalidatePath('/users/[id]/permissions', 'page')
  return { success: true }
}

// Create new permission
export async function createPermission(permission: Omit<Permission, 'id' | 'created_at'>) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_MANAGE)
  const supabase = getSupabaseAdminServerClient()
  const userSupabase = await getSupabaseServerClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('permissions')
    .insert(permission)
    .select()
    .single()

  if (error) {
    apiLogger.error('Error creating permission', { error, permission, userEmail: user?.email })
    return { error: 'Failed to create permission' }
  }

  apiLogger.info('Permission created', { permissionId: data.id, name: data.name, userEmail: user?.email })
  revalidatePath('/users')
  revalidatePath('/users/permissions')
  return { data }
}

// Update permission
export async function updatePermission(id: string, updates: Partial<Omit<Permission, 'id' | 'created_at'>>) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_MANAGE)
  const supabase = getSupabaseAdminServerClient()
  const userSupabase = await getSupabaseServerClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('permissions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    apiLogger.error('Error updating permission', { error, id, updates, userEmail: user?.email })
    return { error: 'Failed to update permission' }
  }

  apiLogger.info('Permission updated', { permissionId: id, userEmail: user?.email })
  revalidatePath('/users')
  revalidatePath('/users/permissions')
  return { data }
}

// Delete permission
export async function deletePermission(id: string) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_MANAGE)
  const supabase = getSupabaseAdminServerClient()
  const userSupabase = await getSupabaseServerClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  
  const { error } = await supabase
    .from('permissions')
    .delete()
    .eq('id', id)

  if (error) {
    apiLogger.error('Error deleting permission', { error, id, userEmail: user?.email })
    return { error: 'Failed to delete permission' }
  }

  apiLogger.info('Permission deleted', { permissionId: id, userEmail: user?.email })
  revalidatePath('/users')
  revalidatePath('/users/permissions')
  return { success: true }
}

// Get user with all permissions (role-based)
export async function getUserWithAllPermissions(userId: string) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_READ)
  const supabase = getSupabaseAdminServerClient()
  
  // Get user info
  const { data: adminUser, error: userError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (userError) {
    apiLogger.error('Error fetching admin user', { error: userError, userId })
    return null
  }

  // Get auth user for email
  const { data: authUsers } = await supabase.auth.admin.listUsers()
  const authUser = authUsers.users.find(u => u.id === userId)

  // Get role permissions
  const permissions = await getRolePermissions(adminUser.role)

  return {
    ...adminUser,
    email: authUser?.email || 'Unknown',
    permissions
  }
}