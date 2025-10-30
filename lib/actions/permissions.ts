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
}

export interface UserPermission {
  user_id: string
  role: string
  permission_name: string
  resource: string
  action: string
  description: string
}

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

export async function getUserPermissions(userId: string) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_READ)
  const supabase = getSupabaseAdminServerClient()
  
  const { data, error } = await supabase
    .from('user_permissions')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    apiLogger.error('Error fetching user permissions', { error, userId })
    return []
  }

  return data
}

export async function getRolePermissions(role: string) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_READ)
  const supabase = getSupabaseAdminServerClient()
  
  const { data, error } = await supabase
    .from('role_permissions')
    .select(`
      *,
      permission:permissions(*)
    `)
    .eq('role', role)

  if (error) {
    apiLogger.error('Error fetching role permissions', { error, role })
    return []
  }

  return data
}

export async function addRolePermission(role: string, permissionId: string) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_MANAGE)
  const supabase = getSupabaseAdminServerClient()
  
  const { data, error } = await supabase
    .from('role_permissions')
    .insert({
      role,
      permission_id: permissionId
    })
    .select()
    .single()

  if (error) {
    apiLogger.error('Error adding role permission', { error, role, permissionId })
    return { error: 'Failed to add permission' }
  }

  apiLogger.info('Role permission added', { role, permissionId })
  revalidatePath('/users')
  return { data }
}

export async function removeRolePermission(role: string, permissionId: string) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_MANAGE)
  const supabase = getSupabaseAdminServerClient()
  
  const { error } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role', role)
    .eq('permission_id', permissionId)

  if (error) {
    apiLogger.error('Error removing role permission', { error, role, permissionId })
    return { error: 'Failed to remove permission' }
  }

  apiLogger.info('Role permission removed', { role, permissionId })
  revalidatePath('/users')
  return { success: true }
}

export async function getUserWithPermissions(userId: string) {
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

  // Get user's role-based permissions
  const { data: permissions, error: permError } = await supabase
    .from('user_permissions')
    .select('*')
    .eq('user_id', userId)

  if (permError) {
    apiLogger.error('Error fetching user permissions', { error: permError, userId })
    return { ...adminUser, permissions: [] }
  }

  return { ...adminUser, permissions }
}

export async function createPermission(permission: Omit<Permission, 'id'>) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_MANAGE)
  const supabase = getSupabaseAdminServerClient()
  
  const { data, error } = await supabase
    .from('permissions')
    .insert(permission)
    .select()
    .single()

  if (error) {
    apiLogger.error('Error creating permission', { error, permission })
    return { error: 'Failed to create permission' }
  }

  apiLogger.info('Permission created', { permissionId: data.id, name: data.name })
  revalidatePath('/users')
  return { data }
}

export async function updatePermission(id: string, updates: Partial<Permission>) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_MANAGE)
  const supabase = getSupabaseAdminServerClient()
  
  const { data, error } = await supabase
    .from('permissions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    apiLogger.error('Error updating permission', { error, id, updates })
    return { error: 'Failed to update permission' }
  }

  apiLogger.info('Permission updated', { permissionId: id })
  revalidatePath('/users')
  return { data }
}

export async function deletePermission(id: string) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_MANAGE)
  const supabase = getSupabaseAdminServerClient()
  
  const { error } = await supabase
    .from('permissions')
    .delete()
    .eq('id', id)

  if (error) {
    apiLogger.error('Error deleting permission', { error, id })
    return { error: 'Failed to delete permission' }
  }

  apiLogger.info('Permission deleted', { permissionId: id })
  revalidatePath('/users')
  return { success: true }
}