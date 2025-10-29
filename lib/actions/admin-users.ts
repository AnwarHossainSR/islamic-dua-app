'use server'

import { apiLogger } from '@/lib/logger'
import { PERMISSIONS } from '@/lib/permissions'
import { getSupabaseAdminServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkPermission } from './auth'

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
  const supabase = getSupabaseAdminServerClient()

  const { data, error } = await supabase
    .from('admin_users')
    .select(
      `
      *,
      user:auth.users(email)
    `
    )
    .order('created_at', { ascending: false })

  if (error) {
    apiLogger.error('Error fetching admin users', { error })
    return []
  }

  return data
}

export async function addAdminUser(email: string, role: string = 'admin') {
  await checkPermission(PERMISSIONS.ADMIN_USERS_CREATE)
  const supabase = getSupabaseAdminServerClient()

  // First, find the user by email
  const { data: users, error: userError } = await supabase.auth.admin.listUsers()

  if (userError) {
    apiLogger.error('Error fetching users', { error: userError })
    return { error: 'Failed to fetch users' }
  }

  const user = users.users.find(u => u.email === email)
  if (!user) {
    return { error: 'User not found with this email' }
  }

  // Check if user is already an admin
  const { data: existingAdmin } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (existingAdmin) {
    return { error: 'User is already an admin' }
  }

  // Add user as admin
  const { data, error } = await supabase
    .from('admin_users')
    .insert({
      user_id: user.id,
      role,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    apiLogger.error('Error adding admin user', { error, email, role })
    return { error: 'Failed to add admin user' }
  }

  apiLogger.info('Admin user added', { email, role, adminUserId: data.id })
  revalidatePath('/admin-users')
  return { data }
}

export async function updateAdminUser(id: string, updates: { role?: string; is_active?: boolean }) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_UPDATE)
  const supabase = getSupabaseAdminServerClient()

  const { data, error } = await supabase
    .from('admin_users')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    apiLogger.error('Error updating admin user', { error, id, updates })
    return { error: 'Failed to update admin user' }
  }

  apiLogger.info('Admin user updated', { id, updates })
  revalidatePath('/admin-users')
  return { data }
}

export async function removeAdminUser(id: string) {
  await checkPermission(PERMISSIONS.ADMIN_USERS_DELETE)
  const supabase = getSupabaseAdminServerClient()

  const { error } = await supabase.from('admin_users').delete().eq('id', id)

  if (error) {
    apiLogger.error('Error removing admin user', { error, id })
    return { error: 'Failed to remove admin user' }
  }

  apiLogger.info('Admin user removed', { id })
  revalidatePath('/admin-users')
  return { success: true }
}
