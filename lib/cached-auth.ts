import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

// Request deduplication
let pendingUserRequest: Promise<any> | null = null

// Cached auth functions that accept tokens as parameters
async function getCachedUserData(authToken?: string, refreshToken?: string) {
  'use cache'
  
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

async function getCachedAdminStatus(userId: string) {
  'use cache'
  
  try {
    const { checkAdminUser } = await import('@/lib/db/queries/admin')
    return await checkAdminUser(userId)
  } catch (error) {
    console.error('Error checking admin status:', error)
    return null
  }
}

// Wrapper functions that handle cookies outside cache scope
export async function getCachedUser() {
  // Deduplicate simultaneous requests
  if (pendingUserRequest) {
    return pendingUserRequest
  }
  
  pendingUserRequest = (async () => {
    let authToken, refreshToken
    
    try {
      const cookieStore = await cookies()
      authToken = cookieStore.get('sb-access-token')?.value
      refreshToken = cookieStore.get('sb-refresh-token')?.value
    } catch (error) {
      console.log('Cookies not available during prerendering')
    }
    
    const user = await getCachedUserData(authToken, refreshToken)
    pendingUserRequest = null // Clear after completion
    return user
  })()
  
  return pendingUserRequest
}

export async function getCachedUserRole() {
  const user = await getCachedUser()
  if (!user) return 'user'
  
  const adminData = await getCachedAdminStatus(user.id)
  return adminData?.role || 'user'
}