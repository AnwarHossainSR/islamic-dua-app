import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function getSupabaseServerClient() {
  let authToken, refreshToken
  
  try {
    const cookieStore = await cookies()
    authToken = cookieStore.get('sb-access-token')?.value
    refreshToken = cookieStore.get('sb-refresh-token')?.value
  } catch (error) {
    // During prerendering, cookies are not available
    authToken = undefined
    refreshToken = undefined
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: true },
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

  return supabase
}

export function getSupabaseAdminServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  )
}
