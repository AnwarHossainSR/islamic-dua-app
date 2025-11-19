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
        auth: { persistSession: false, autoRefreshToken: true },
      }
    )
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: true },
      global: {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        fetch: (url, options = {}) => {
          // Cache GET requests to /auth/v1/user for 30 seconds
          const urlString = url.toString()
          if (urlString.includes('/auth/v1/user') && (!options.method || options.method === 'GET')) {
            return fetch(url, {
              ...options,
              next: { revalidate: 30 }
            })
          }
          // Don't cache token refresh or other auth operations
          return fetch(url, options)
        },
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
