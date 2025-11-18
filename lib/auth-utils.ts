import { cache } from 'react'
import { getSupabaseServerClient } from '@/lib/supabase/server'

// Optimized auth utilities with caching
export const getAuthUser = cache(async () => {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
})

export async function getCachedAuthUser() {
  'use cache'
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const checkAuthStatus = cache(async () => {
  const user = await getAuthUser()
  return !!user
})

export const getAuthSession = cache(async () => {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Session error:', error)
    return null
  }
})