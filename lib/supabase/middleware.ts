import { createClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("[v0] Supabase environment variables not found in middleware")
    return supabaseResponse
  }

  // Get auth tokens from cookies
  const accessToken = request.cookies.get("sb-access-token")?.value
  const refreshToken = request.cookies.get("sb-refresh-token")?.value
  const biometricSession = request.cookies.get("biometric-session")?.value

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {},
    },
  })

  // Handle biometric session
  if (biometricSession && !accessToken) {
    try {
      const sessionData = JSON.parse(Buffer.from(biometricSession, 'base64').toString())
      // Validate session is not expired (7 days)
      const sessionAge = Date.now() - new Date(sessionData.authenticated_at).getTime()
      if (sessionAge > 7 * 24 * 60 * 60 * 1000) {
        supabaseResponse.cookies.delete('biometric-session')
      }
    } catch (error) {
      supabaseResponse.cookies.delete('biometric-session')
    }
  }

  // If we have tokens, set the session and refresh if needed
  if (accessToken && refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    // If session was refreshed, update cookies
    if (data.session && data.session.access_token !== accessToken) {
      supabaseResponse.cookies.set("sb-access-token", data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      })
      supabaseResponse.cookies.set("sb-refresh-token", data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      })
    }
  }

  return supabaseResponse
}
