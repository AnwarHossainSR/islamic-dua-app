import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function getSupabaseServerClient() {
  try {
    const cookieStore = await cookies()

    // Get the auth token from cookies
    const authToken = cookieStore.get('sb-access-token')?.value
    const refreshToken = cookieStore.get('sb-refresh-token')?.value

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        },
        global: {
          headers: authToken
            ? {
                Authorization: `Bearer ${authToken}`,
              }
            : {},
        },
      }
    )

    // If we have tokens, set the session
    if (authToken && refreshToken) {
      try {
        await supabase.auth.setSession({
          access_token: authToken,
          refresh_token: refreshToken,
        })
      } catch (sessionError) {
        console.error('Session error:', sessionError)
      }
    }

    return supabase
  } catch (error) {
    console.error('Supabase client error:', error)
    // Return a basic client without session
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        },
      }
    )
  }
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
