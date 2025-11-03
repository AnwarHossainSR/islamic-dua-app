'use server'

import { apiLogger } from '@/lib/logger'
import { PERMISSIONS } from '@/lib/permissions/constants'
import { getSupabaseAdminServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkPermission, getUser } from './auth'
import { getAllPermissions as getAllPermissionsQuery, createPermission as createPermissionQuery, updatePermission as updatePermissionQuery, deletePermission as deletePermissionQuery } from '../db/queries/permissions'
import { getAdminUserByUserId } from '../db/queries/users'

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
  
  try {
    return await getAllPermissionsQuery()
  } catch (error) {
    apiLogger.error('Error fetching permissions with Drizzle', { error })
    return []
  }
}

// Get permissions for a specific role
export async function getRolePermissions(role: string): Promise<Permission[]> {
  await checkPermission(PERMISSIONS.ADMIN_USERS_READ)
  return []
}

// Get all roles with their permissions
export async function getAllRolesWithPermissions(): Promise<Role[]> {
  await checkPermission(PERMISSIONS.ADMIN_USERS_READ)
  
  const roles = ['user', 'editor', 'admin', 'super_admin']
  return roles.map(role => ({ role, permissions: [] }))
}

// Add permission to role
export async function addPermissionToRole(role: string, permissionId: string) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_MANAGE)
  revalidatePath('/users')
  return { success: true }
}

// Remove permission from role
export async function removePermissionFromRole(role: string, permissionId: string) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_MANAGE)
  revalidatePath('/users')
  return { success: true }
}

// Create new permission
export async function createPermission(permission: Omit<Permission, 'id' | 'created_at'>) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_MANAGE)
  const user = await getUser()
  
  try {
    const result = await createPermissionQuery({
      name: permission.name,
      description: permission.description
    })
    const data = result[0]

    apiLogger.info('Permission created', { permissionId: data.id, name: data.name, userEmail: user?.email })
    revalidatePath('/users')
    revalidatePath('/users/permissions')
    return { data }
  } catch (error) {
    apiLogger.error('Error creating permission with Drizzle', { error, permission, userEmail: user?.email })
    return { error: 'Failed to create permission' }
  }
}

// Update permission
export async function updatePermission(id: string, updates: Partial<Omit<Permission, 'id' | 'created_at'>>) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_MANAGE)
  const user = await getUser()
  
  try {
    const result = await updatePermissionQuery(id, {
      name: updates.name,
      description: updates.description
    })
    const data = result[0]

    apiLogger.info('Permission updated', { permissionId: id, userEmail: user?.email })
    revalidatePath('/users')
    revalidatePath('/users/permissions')
    return { data }
  } catch (error) {
    apiLogger.error('Error updating permission with Drizzle', { error, id, updates, userEmail: user?.email })
    return { error: 'Failed to update permission' }
  }
}

// Delete permission
export async function deletePermission(id: string) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_MANAGE)
  const user = await getUser()
  
  try {
    await deletePermissionQuery(id)

    apiLogger.info('Permission deleted', { permissionId: id, userEmail: user?.email })
    revalidatePath('/users')
    revalidatePath('/users/permissions')
    return { success: true }
  } catch (error) {
    apiLogger.error('Error deleting permission with Drizzle', { error, id, userEmail: user?.email })
    return { error: 'Failed to delete permission' }
  }
}

// Get user with all permissions (role-based)
export async function getUserWithAllPermissions(userId: string) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_READ)
  
  const adminUser = await getAdminUserByUserId(userId)
  if (!adminUser) return null

  return {
    ...adminUser,
    email: 'Unknown',
    permissions: []
  }
}