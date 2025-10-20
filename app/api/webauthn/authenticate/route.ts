import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getCredential } from '@/lib/webauthn/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { apiLogger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json()
    apiLogger.info('WebAuthn authentication attempt', { credentialId: credential?.id })

    if (!credential?.id) {
      apiLogger.warn('WebAuthn authentication failed: No credential ID provided')
      return NextResponse.json(
        { error: 'Credential not found, please provide credential' },
        { status: 404 }
      )
    }

    // Find the credential in database
    const storedCredential = await getCredential(credential.id)

    if (!storedCredential) {
      apiLogger.warn('WebAuthn authentication failed: Credential not found in database', { credentialId: credential.id })
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 })
    }

    // Get user from database
    const supabase = await getSupabaseServerClient()
    const { data: user, error } = await supabase.auth.admin.getUserById(storedCredential.user_id)

    if (error || !user) {
      apiLogger.error('WebAuthn authentication failed: User not found', { userId: storedCredential.user_id, error: error?.message })
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create session for the user
    const { data: sessionData, error: sessionError }: any = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: user.user.email!,
    })

    if (sessionError) {
      apiLogger.error('WebAuthn authentication failed: Session creation failed', { userId: user.user.id, error: sessionError.message })
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    // Set session cookies
    const cookieStore = await cookies()
    cookieStore.set('sb-access-token', sessionData.properties.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    cookieStore.set('sb-refresh-token', sessionData.properties.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    apiLogger.info('WebAuthn authentication successful', { userId: user.user.id, email: user.user.email })
    return NextResponse.json({ success: true, user: user.user })
  } catch (error) {
    apiLogger.error('WebAuthn authentication error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
