'use server'

import { apiLogger } from '@/lib/logger'
import { PERMISSIONS } from '@/lib/permissions/constants'
import { getSupabaseAdminServerClient, getSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkPermission, getUser } from './auth'
import { getAllAdminUsers, getAdminUserByUserId, createAdminUser as createAdminUserQuery, updateAdminUser as updateAdminUserQuery, deleteAdminUser } from '../db/queries/users'

export interface AdminUser {
  id: string
  user_id: string
  email: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getAdminUsers() {
  await checkPermission(PERMISSIONS.ADMIN_USERS_READ)
  
  try {
    return await getAllAdminUsers()
  } catch (error) {
    apiLogger.error('Error fetching admin users with Drizzle', { error })
    return []
  }
}

export async function addAdminUser(email: string, role: string = 'admin', password?: string) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_CREATE)
  const supabase = getSupabaseAdminServerClient()

  // First, check if user already exists
  const { data: users, error: userError } = await supabase.auth.admin.listUsers()

  if (userError) {
    apiLogger.error('Error fetching users', { error: userError })
    return { error: 'Failed to fetch users' }
  }

  let user = users.users.find(u => u.email === email)
  let generatedPassword = null
  let userCreated = false

  // If user doesn't exist, create them
  if (!user) {
    generatedPassword = password || Math.random().toString(36).slice(-8) + 'A1!'
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: generatedPassword,
      email_confirm: true,
    })

    if (createError) {
      apiLogger.error('Error creating user', { error: createError, email })
      return { error: 'Failed to create user' }
    }

    user = newUser.user
    userCreated = true
  }

  // Check if user is already an admin
  try {
    const existingAdmin = await getAdminUserByUserId(user.id)
    if (existingAdmin) {
      return { error: 'User is already an admin' }
    }

    // Add user as admin
    const result = await createAdminUserQuery({
      userId: user.id,
      email: user.email || email,
      role: role as 'user' | 'editor' | 'admin' | 'super_admin'
    })
    const data = result[0]

    const currentUser = await getUser()
    apiLogger.info('Admin user added', {
      email,
      role,
      adminUserId: data.id,
      userCreated,
      generatedPassword: userCreated ? generatedPassword : 'N/A',
      actionBy: currentUser?.email
    })
    revalidatePath('/users')
    return {
      data,
      userCreated,
      generatedPassword: userCreated ? generatedPassword : null,
    }
  } catch (error) {
    apiLogger.error('Error adding admin user with Drizzle', { error })
    return { error: 'Failed to add admin user' }
  }
}

export async function updateAdminUser(id: string, updates: { role?: string; is_active?: boolean }) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_UPDATE)
  
  try {
    const updateData: any = {}
    if (updates.role) updateData.role = updates.role as 'user' | 'editor' | 'admin' | 'super_admin'
    if (updates.is_active !== undefined) updateData.isActive = updates.is_active
    
    const result = await updateAdminUserQuery(id, updateData)
    const data = result[0]

    const currentUser = await getUser()
    apiLogger.info('Admin user updated', { id, updates, actionBy: currentUser?.email })
    revalidatePath('/users')
    return { data }
  } catch (error) {
    apiLogger.error('Error updating admin user with Drizzle', { error, id, updates })
    return { error: 'Failed to update admin user' }
  }
}

export async function removeAdminUser(id: string) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_DELETE)
  
  try {
    await deleteAdminUser(id)

    const currentUser = await getUser()
    apiLogger.info('Admin user removed', { id, actionBy: currentUser?.email })
    revalidatePath('/users')
    return { success: true }
  } catch (error) {
    apiLogger.error('Error removing admin user with Drizzle', { error, id })
    return { error: 'Failed to remove admin user' }
  }
}
