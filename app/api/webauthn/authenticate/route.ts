import { apiLogger } from '@/lib/logger'
import { getCredential } from '@/lib/webauthn/server'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminServerClient } from '@/lib/supabase/server'

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

    // Get admin client
    const supabaseAdmin = getSupabaseAdminServerClient()

    // Get user using admin API
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(storedCredential.user_id)

    if (userError || !user) {
      apiLogger.error('WebAuthn authentication failed: User not found', {
        userId: storedCredential.user_id,
        error: userError?.message,
      })
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return user data for session creation

    apiLogger.info('WebAuthn authentication successful', {
      userId: user.user.id,
      email: user.user.email,
    })
    return NextResponse.json({ success: true, user: user.user })
  } catch (error) {
    apiLogger.error('WebAuthn authentication error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
