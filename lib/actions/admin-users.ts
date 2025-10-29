'use server'

import { apiLogger } from '@/lib/logger'
import { getSupabaseAdminServerClient, getSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkAdminAccess } from './admin'

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
  // Check if user is at least admin level
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Check if user is admin or super_admin
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'super_admin')) {
    throw new Error('Access denied: Admin privileges required')
  }

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

export async function addAdminUser(email: string, role: string = 'admin', password?: string) {
  // Check if user is at least admin level
  const supabase = getSupabaseAdminServerClient()
  const superAdmin = await checkAdminAccess()

  if (!superAdmin) {
    throw new Error('Access denied: Super admin privileges required')
  }

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
      email: user.email,
      role,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    apiLogger.error('Error adding admin user', { error, email, role })
    return { error: 'Failed to add admin user' }
  }

  apiLogger.info('Admin user added', {
    email,
    role,
    adminUserId: data.id,
    userCreated,
    generatedPassword: userCreated ? generatedPassword : 'N/A',
  })
  revalidatePath('/users')
  return {
    data,
    userCreated,
    generatedPassword: userCreated ? generatedPassword : null,
  }
}

export async function updateAdminUser(id: string, updates: { role?: string; is_active?: boolean }) {
  // Check if user is at least admin level
  const supabase = getSupabaseAdminServerClient()
  const superAdmin = await checkAdminAccess()

  if (!superAdmin) {
    throw new Error('Access denied: Super admin privileges required')
  }

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
  revalidatePath('/users')
  return { data }
}

export async function removeAdminUser(id: string) {
  // Check if user is at least admin level
  const supabase = getSupabaseAdminServerClient()
  const userSupabase = await getSupabaseAdminServerClient()
  const {
    data: { user },
  } = await userSupabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Check if user is admin or super_admin
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'super_admin')) {
    throw new Error('Access denied: Admin privileges required')
  }

  const { error } = await supabase.from('admin_users').delete().eq('id', id)

  if (error) {
    apiLogger.error('Error removing admin user', { error, id })
    return { error: 'Failed to remove admin user' }
  }

  apiLogger.info('Admin user removed', { id })
  revalidatePath('/users')
  return { success: true }
}
