import { apiLogger } from '@/lib/logger'
import { getSupabaseAdminServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json()

    // Get admin client
    const supabaseAdmin = getSupabaseAdminServerClient()

    // Create session by updating user and generating new session
    const { data: userData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email_confirm: true
    })

    if (updateError) {
      apiLogger.error('Biometric session creation failed', { userId, error: updateError.message })
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    // Generate a recovery link which contains session tokens
    const { data: recoveryData, error: recoveryError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email
    })

    if (recoveryError) {
      apiLogger.error('Recovery link generation failed', { userId, error: recoveryError.message })
      return NextResponse.json({ error: 'Failed to generate recovery link' }, { status: 500 })
    }

    // Extract tokens from recovery link
    const recoveryUrl = new URL(recoveryData.properties.action_link)
    const accessToken = recoveryUrl.hash.match(/access_token=([^&]+)/)?.[1]
    const refreshToken = recoveryUrl.hash.match(/refresh_token=([^&]+)/)?.[1]

    if (!accessToken || !refreshToken) {
      apiLogger.error('Tokens not found in recovery link', { userId })
      return NextResponse.json({ error: 'Failed to extract session tokens' }, { status: 500 })
    }

    // Set cookies
    const cookieStore = await cookies()
    cookieStore.set('sb-access-token', decodeURIComponent(accessToken), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })
    cookieStore.set('sb-refresh-token', decodeURIComponent(refreshToken), {
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
