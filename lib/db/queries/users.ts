import { eq, and, desc } from 'drizzle-orm'
import { db } from '../index'
import { adminUsers, userRoles, permissions, rolePermissions } from '../schema'

export async function getAllAdminUsers() {
  return await db
    .select({
      id: adminUsers.id,
      userId: adminUsers.userId,
      email: adminUsers.email,
      role: adminUsers.role,
      isActive: adminUsers.isActive,
      createdAt: adminUsers.createdAt,
      updatedAt: adminUsers.updatedAt,
    })
    .from(adminUsers)
    .orderBy(desc(adminUsers.createdAt))
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
    .where(eq(adminUsers.userId, userId))
    .limit(1)
  
  return result[0] || null
}

export async function createAdminUser(data: {
  userId: string
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
  isActive?: boolean
}) {
  return await db
    .update(adminUsers)
    .set({ ...data, updatedAt: new Date() })
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
    .where(eq(userRoles.userId, userId))
    .limit(1)
  
  return result[0] || null
}

export async function createUserRole(userId: string, role: 'user' | 'editor' | 'admin' | 'super_admin') {
  return await db
    .insert(userRoles)
    .values({ userId, role })
    .returning()
}

export async function updateUserRole(userId: string, role: 'user' | 'editor' | 'admin' | 'super_admin') {
  return await db
    .update(userRoles)
    .set({ role, updatedAt: new Date() })
    .where(eq(userRoles.userId, userId))
    .returning()
}