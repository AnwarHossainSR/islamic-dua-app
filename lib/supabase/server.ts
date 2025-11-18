import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { cache } from 'react'

// Cache the client creation to avoid multiple instances
const createSupabaseClient = cache(async () => {
  let authToken: string | undefined
  let refreshToken: string | undefined
  
  try {
    const cookieStore = await cookies()
    authToken = cookieStore.get('sb-access-token')?.value
    refreshToken = cookieStore.get('sb-refresh-token')?.value
  } catch (error) {
    // During prerendering or static generation, cookies are not available
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
      }
    )
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        fetch: (url, options = {}) => {
          return fetch(url, {
            ...options,
            cache: 'force-cache',
            next: { revalidate: 60 }
          })
        }
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
})

export async function getSupabaseServerClient() {
  return createSupabaseClient()
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
