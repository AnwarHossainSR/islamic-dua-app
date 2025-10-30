'use server'

import { apiLogger } from '@/lib/logger'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

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

  if (data.session) {
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
  redirect(redirectUrl)
}

export async function getUser() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function checkAdminStatus() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*, role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  return adminUser
}

export async function checkPermission(permission: string) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: hasAccess } = await supabase.rpc('user_has_permission', {
    user_id: user.id,
    permission_name: permission,
  })

  if (!hasAccess) {
    apiLogger.error(`Access denied: Missing permission ${permission}`, { 
      userId: user.id, 
      email: user.email, 
      permission 
    })
    throw new Error('Access denied')
  }

  return true
}

export async function getUserRoleAndPermissions() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { role: 'user', permissions: [] }
  }

  const [roleResult, permissionsResult] = await Promise.all([
    supabase.rpc('get_user_role', { user_id: user.id }),
    supabase.from('user_permissions').select('*').eq('user_id', user.id),
  ])

  return {
    role: roleResult.data || 'user',
    permissions: permissionsResult.data || [],
  }
}
