'use server'

import { apiLogger } from '@/lib/logger'
import { PERMISSIONS } from '@/lib/permissions/constants'
import { revalidatePath } from 'next/cache'
import { checkPermission } from './auth'
import { getAllPermissions as getAllPermissionsQuery, createPermission as createPermissionQuery, updatePermission as updatePermissionQuery, deletePermission as deletePermissionQuery, getUserPermissions as getUserPermissionsQuery } from '../db/queries/permissions'
import { getAdminUserByUserId } from '../db/queries/users'

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
  
  try {
    return await getAllPermissionsQuery()
  } catch (error) {
    apiLogger.error('Error fetching permissions with Drizzle', { error })
    return []
  }
}

export async function getUserPermissions(userId: string) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_READ)
  
  try {
    return await getUserPermissionsQuery(userId)
  } catch (error) {
    apiLogger.error('Error fetching user permissions with Drizzle', { error, userId })
    return []
  }
}

export async function getRolePermissions(role: string) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_READ)
  return []
}

export async function addRolePermission(role: string, permissionId: string) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_MANAGE)
  revalidatePath('/users')
  return { success: true }
}

export async function removeRolePermission(role: string, permissionId: string) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_MANAGE)
  revalidatePath('/users')
  return { success: true }
}

export async function getUserWithPermissions(userId: string) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_READ)
  
  const adminUser = await getAdminUserByUserId(userId)
  if (!adminUser) return null

  return { ...adminUser, permissions: [] }
}

export async function createPermission(permission: Omit<Permission, 'id'>) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_MANAGE)
  
  try {
    const result = await createPermissionQuery({
      name: permission.name,
      description: permission.description
    })
    const data = result[0]
    
    apiLogger.info('Permission created', { permissionId: data.id, name: data.name })
    revalidatePath('/users')
    return { data }
  } catch (error) {
    apiLogger.error('Error creating permission with Drizzle', { error, permission })
    return { error: 'Failed to create permission' }
  }
}

export async function updatePermission(id: string, updates: Partial<Permission>) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_MANAGE)
  
  try {
    const result = await updatePermissionQuery(id, {
      name: updates.name,
      description: updates.description
    })
    const data = result[0]
    
    apiLogger.info('Permission updated', { permissionId: id })
    revalidatePath('/users')
    return { data }
  } catch (error) {
    apiLogger.error('Error updating permission with Drizzle', { error, id, updates })
    return { error: 'Failed to update permission' }
  }
}

export async function deletePermission(id: string) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_MANAGE)
  
  try {
    await deletePermissionQuery(id)
    
    apiLogger.info('Permission deleted', { permissionId: id })
    revalidatePath('/users')
    return { success: true }
  } catch (error) {
    apiLogger.error('Error deleting permission with Drizzle', { error, id })
    return { error: 'Failed to delete permission' }
  }
}