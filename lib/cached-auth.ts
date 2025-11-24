import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export async function getCachedUser() {
  let authToken, refreshToken
  
  try {
    const cookieStore = await cookies()
    authToken = cookieStore.get('sb-access-token')?.value
    refreshToken = cookieStore.get('sb-refresh-token')?.value
  } catch (error) {
    return null
  }
  
  if (!authToken || !refreshToken) {
    return null
  }
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false },
      global: {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      },
    }
  )

  if (authToken && refreshToken) {
    try {
      await supabase.auth.setSession({
        access_token: authToken,
        refresh_token: refreshToken,
      })
    } catch (error) {
      console.error('Session error:', error)
    }
  }

  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getCachedUserRole() {
  const user = await getCachedUser()
  if (!user) return 'user'
  
  try {
    const { checkAdminUser } = await import('@/lib/db/queries/admin')
    const adminData = await checkAdminUser(user.id)
    return adminData?.role || 'user'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return 'user'
  }
}