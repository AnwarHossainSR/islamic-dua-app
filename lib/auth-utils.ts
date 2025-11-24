import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function getAuthUser() {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

export async function getCachedAuthUser() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function checkAuthStatus() {
  const user = await getAuthUser()
  return !!user
}

export async function getAuthSession() {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Session error:', error)
    return null
  }
}