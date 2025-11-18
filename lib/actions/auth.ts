'use server'

import { apiLogger } from '@/lib/logger'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Route } from 'next'
import { cache } from 'react'

export async function signUp(email: string, password: string) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    apiLogger.error('Sign up failed', { email, error })
    return { error: error.message }
  }

  apiLogger.info('User signed up successfully', { email, userId: data.user?.id })
  return { data, message: 'Check your email to confirm your account' }
}

export async function signIn(email: string, password: string) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (
      error.message.includes('Email not confirmed') ||
      error.message.includes('email_not_confirmed')
    ) {
      apiLogger.warn('Sign in failed: Email not confirmed', { email })
      return {
        error:
          'Please confirm your email address before signing in. Check your inbox for the confirmation link.',
        code: 'email_not_confirmed',
      }
    }
    apiLogger.error('Sign in failed', { email, error })
    return { error: error.message }
  }

  if (data.session && data.user) {
    // Check if user is active in admin_users table (if they are an admin)
    try {
      const { checkAdminUser } = await import('@/lib/db/queries/admin')
      const adminUser = await checkAdminUser(data.user.id)
      
      // If user exists in admin_users but is inactive, deny access
      if (adminUser === null) {
        // Check if user exists but is inactive
        const { db } = await import('@/lib/db')
        const { adminUsers } = await import('@/lib/db/schema')
        const { eq } = await import('drizzle-orm')
        
        const inactiveAdmin = await db
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.user_id, data.user.id))
          .limit(1)
        
        if (inactiveAdmin.length > 0 && !inactiveAdmin[0].is_active) {
          // User exists but is inactive
          await supabase.auth.signOut()
          apiLogger.warn('Inactive user attempted login', { email, userId: data.user.id })
          return {
            error: 'Your account has been deactivated. Please contact support.',
            code: 'account_inactive'
          }
        }
      }
    } catch (dbError) {
      // If there's a DB error, log it but don't block login for regular users
      apiLogger.error('Error checking user status during login', { error: dbError, userId: data.user.id })
    }

    const cookieStore = await cookies()
    cookieStore.set('sb-access-token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })
    cookieStore.set('sb-refresh-token', data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    // Log successful login
    apiLogger.info('User logged in successfully', {
      userId: data.user?.id,
      email: data.user?.email,
      loginTime: new Date().toISOString(),
      userAgent: 'web-app'
    })
  }

  revalidatePath('/', 'layout')

  // Return success instead of redirecting
  return { success: true }
}

export async function resendConfirmationEmail(email: string) {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  })

  if (error) {
    apiLogger.error('Error resending confirmation email', { error, email })
    return { error: error.message }
  }

  return { success: true, message: 'Confirmation email sent! Please check your inbox.' }
}

export async function signOut(currentPath?: string) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  await supabase.auth.signOut()

  const cookieStore = await cookies()
  cookieStore.delete('sb-access-token')
  cookieStore.delete('sb-refresh-token')

  revalidatePath('/', 'layout')

  // Redirect to login with return URL if provided
  const redirectUrl = currentPath ? `/login?returnUrl=${encodeURIComponent(currentPath)}` : '/login'
  redirect(redirectUrl as Route)
}

// Cache user data to reduce redundant calls
const getCachedUser = cache(async () => {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

export async function getUser() {
  return getCachedUser()
}

export async function checkAdminStatus() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  try {
    const { checkAdminUser } = await import('@/lib/db/queries/admin')
    return await checkAdminUser(user.id)
  } catch (error) {
    apiLogger.error('Error checking admin status with Drizzle', { error, userId: user.id })
    return null
  }
}

export async function checkPermission(permission: string) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  try {
    // Check if user is admin first
    const { checkAdminUser } = await import('@/lib/db/queries/admin')
    const adminUser = await checkAdminUser(user.id)
    
    // If admin, allow all permissions
    if (adminUser && (adminUser.role === 'admin' || adminUser.role === 'super_admin')) {
      return true
    }

    // Otherwise check specific permissions
    const { getUserPermissions } = await import('@/lib/db/queries/permissions')
    const permissions = await getUserPermissions(user.id)
    const hasAccess = permissions.some(p => p.name === permission)

    if (!hasAccess) {
      apiLogger.error(`Access denied: Missing permission ${permission}`, { 
        userId: user.id, 
        email: user.email, 
        permission 
      })
      throw new Error('Access denied')
    }

    return true
  } catch (error) {
    // If it's already an access denied error, re-throw it
    if (error instanceof Error && error.message === 'Access denied') {
      throw error
    }
    
    apiLogger.error('Error checking permission with Drizzle', { error, userId: user.id, permission })
    throw new Error('Access denied')
  }
}

export async function getUserRole() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return 'user'
  }

  try {
    const { checkAdminUser } = await import('@/lib/db/queries/admin')
    const adminData = await checkAdminUser(user.id)
    return adminData?.role || 'user'
  } catch (error) {
    apiLogger.error('Error fetching user role with Drizzle', { error, userId: user.id })
    return 'user'
  }
}

export async function getUserRoleAndPermissions() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { role: 'user', permissions: [] }
  }

  try {
    const { checkAdminUser } = await import('@/lib/db/queries/admin')
    const { getUserPermissions } = await import('@/lib/db/queries/permissions')
    
    const [adminData, permissions] = await Promise.all([
      checkAdminUser(user.id),
      getUserPermissions(user.id)
    ])

    return {
      role: adminData?.role || 'user',
      permissions: permissions || [],
    }
  } catch (error) {
    apiLogger.error('Error fetching user role and permissions with Drizzle', { error, userId: user.id })
    return { role: 'user', permissions: [] }
  }
}
