import { apiLogger } from '@/lib/logger'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getCredential } from '@/lib/webauthn/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

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
      apiLogger.warn('WebAuthn authentication failed: Credential not found in database', {
        credentialId: credential.id,
      })
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 })
    }

    // Get user email from database using service role
    const supabase = await getSupabaseServerClient()
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('email')
      .eq('id', storedCredential.user_id)
      .single()

    if (userError || !userData) {
      apiLogger.error('WebAuthn authentication failed: User not found', {
        userId: storedCredential.user_id,
        error: userError?.message,
      })
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create a simple session token for biometric auth
    const sessionToken = Buffer.from(JSON.stringify({
      user_id: storedCredential.user_id,
      email: userData.email,
      authenticated_at: new Date().toISOString(),
      method: 'biometric'
    })).toString('base64')

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set('biometric-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    apiLogger.info('WebAuthn authentication successful', {
      userId: storedCredential.user_id,
      email: userData.email,
    })
    return NextResponse.json({ 
      success: true, 
      user: { id: storedCredential.user_id, email: userData.email },
      redirect: '/' 
    })
  } catch (error) {
    apiLogger.error('WebAuthn authentication error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
