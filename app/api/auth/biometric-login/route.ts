import { apiLogger } from '@/lib/logger'
import { getSupabaseAdminServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json()

    // Get admin client
    const supabaseAdmin = getSupabaseAdminServerClient()

    // Generate magic link session
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    })

    if (linkError) {
      apiLogger.error('Biometric session creation failed', { userId, error: linkError.message })
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    apiLogger.info('Biometric session created', { linkData })

    // Extract tokens from the magic link
    const url = new URL(linkData.properties.action_link)
    const accessToken = url.searchParams.get('access_token')
    const refreshToken = url.searchParams.get('refresh_token')

    apiLogger.info('Biometric session tokens extracted', { accessToken, refreshToken })

    if (!accessToken || !refreshToken) {
      apiLogger.error('Biometric session tokens not found', { userId })
      return NextResponse.json({ error: 'Invalid session tokens' }, { status: 500 })
    }

    // Set cookies
    const cookieStore = await cookies()
    cookieStore.set('sb-access-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })
    cookieStore.set('sb-refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    apiLogger.info('Biometric login successful', { userId, email })
    return NextResponse.json({ success: true })
  } catch (error) {
    apiLogger.error('Biometric login error', {
      error: error || 'Unknown error',
    })
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
