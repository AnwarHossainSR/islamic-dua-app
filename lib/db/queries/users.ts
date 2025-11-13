import { eq, and, desc } from 'drizzle-orm'
import { db } from '../index'
import { adminUsers, userRoles, permissions, rolePermissions } from '../schema'

export async function getAllAdminUsers() {
  return await db
    .select({
      id: adminUsers.id,
      user_id: adminUsers.user_id,
      email: adminUsers.email,
      role: adminUsers.role,
      is_active: adminUsers.is_active,
      created_at: adminUsers.created_at,
      updated_at: adminUsers.updated_at,
    })
    .from(adminUsers)
    .orderBy(desc(adminUsers.created_at))
}

export async function getAdminUserById(id: string) {
  const result = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1)
  
  return result[0] || null
}

export async function getAdminUserByUserId(userId: string) {
  const result = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.user_id, userId))
    .limit(1)
  
  return result[0] || null
}

export async function createAdminUser(data: {
  user_id: string
  email: string
  role: 'user' | 'editor' | 'admin' | 'super_admin'
}) {
  return await db
    .insert(adminUsers)
    .values(data)
    .returning()
}

export async function updateAdminUser(id: string, data: {
  email?: string
  role?: 'user' | 'editor' | 'admin' | 'super_admin'
  is_active?: boolean
}) {
  return await db
    .update(adminUsers)
    .set({ ...data, updated_at: Date.now() })
    .where(eq(adminUsers.id, id))
    .returning()
}

export async function deleteAdminUser(id: string) {
  return await db
    .delete(adminUsers)
    .where(eq(adminUsers.id, id))
}

export async function getUserRole(userId: string) {
  const result = await db
    .select()
    .from(userRoles)
    .where(eq(userRoles.user_id, userId))
    .limit(1)
  
  return result[0] || null
}

export async function createUserRole(userId: string, role: 'user' | 'editor' | 'admin' | 'super_admin') {
  return await db
    .insert(userRoles)
    .values({ user_id: userId, role })
    .returning()
}

export async function updateUserRole(userId: string, role: 'user' | 'editor' | 'admin' | 'super_admin') {
  return await db
    .update(userRoles)
    .set({ role, updated_at: Date.now() })
    .where(eq(userRoles.user_id, userId))
    .returning()
}