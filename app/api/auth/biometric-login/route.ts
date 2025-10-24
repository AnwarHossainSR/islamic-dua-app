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
    const { data: userData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        email_confirm: true,
      }
    )

    if (updateError) {
      apiLogger.error('Biometric session creation failed', { userId, error: updateError.message })
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    // Generate a recovery link which contains session tokens
    const { data: recoveryData, error: recoveryError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email,
      })

    if (recoveryError) {
      apiLogger.error('Recovery link generation failed', { userId, error: recoveryError.message })
      return NextResponse.json({ error: 'Failed to generate recovery link' }, { status: 500 })
    }

    // Extract token from recovery URL
    const recoveryUrl = new URL(recoveryData.properties.action_link)
    const token = recoveryUrl.searchParams.get('token')

    if (!token) {
      apiLogger.error('Token not found in recovery link', { userId })
      return NextResponse.json({ error: 'Failed to extract token' }, { status: 500 })
    }

    // Verify the token to create session
    const { data: verifyData, error: verifyError } = await supabaseAdmin.auth.verifyOtp({
      token_hash: token,
      type: 'recovery',
    })

    if (verifyError || !verifyData.session) {
      apiLogger.error('Token verification failed', { userId, error: verifyError?.message })
      return NextResponse.json({ error: 'Failed to verify token' }, { status: 500 })
    }

    // Set session cookies
    const cookieStore = await cookies()
    cookieStore.set('sb-access-token', verifyData.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })
    cookieStore.set('sb-refresh-token', verifyData.session.refresh_token, {
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
