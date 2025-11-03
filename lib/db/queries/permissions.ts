import { eq, and, inArray } from 'drizzle-orm'
import { db } from '../index'
import { permissions, rolePermissions, userRoles } from '../schema'

export async function getAllPermissions() {
  return await db
    .select()
    .from(permissions)
    .orderBy(permissions.name)
}

export async function getPermissionById(id: string) {
  const result = await db
    .select()
    .from(permissions)
    .where(eq(permissions.id, id))
    .limit(1)
  
  return result[0] || null
}

export async function createPermission(data: {
  name: string
  description?: string
}) {
  return await db
    .insert(permissions)
    .values(data)
    .returning()
}

export async function updatePermission(id: string, data: {
  name?: string
  description?: string
}) {
  return await db
    .update(permissions)
    .set(data)
    .where(eq(permissions.id, id))
    .returning()
}

export async function deletePermission(id: string) {
  return await db
    .delete(permissions)
    .where(eq(permissions.id, id))
}

export async function getUserPermissions(userId: string) {
  const result = await db
    .select({
      id: permissions.id,
      name: permissions.name,
      description: permissions.description,
    })
    .from(permissions)
    .innerJoin(rolePermissions, eq(permissions.id, rolePermissions.permission_id))
    .innerJoin(userRoles, eq(rolePermissions.role_id, userRoles.id))
    .where(eq(userRoles.user_id, userId))

  return result
}

export async function getRolePermissions(role: string) {
  // For now, return empty array since role-permission system needs setup
  return []
}

export async function assignPermissionToRole(role: string, permissionId: string) {
  // For now, just return success since role-permission system needs setup
  return [{ id: 'temp', roleId: role, permissionId }]
}

export async function removePermissionFromRole(role: string, permissionId: string) {
  // For now, just return success since role-permission system needs setup
  return
}