import { getUser } from '@/lib/actions/auth'
import { storeCredential } from '@/lib/webauthn/server'
import { NextRequest, NextResponse } from 'next/server'
import { apiLogger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      apiLogger.warn('WebAuthn registration failed: Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { credential } = await request.json()

    apiLogger.info('WebAuthn credential registration attempt', { userId: user.id, credentialId: credential.id })

    // Store the credential in the database
    await storeCredential(
      user.id,
      credential.id,
      credential.response.attestationObject,
      0
    )

    apiLogger.info('WebAuthn credential registered successfully', { userId: user.id, credentialId: credential.id })
    return NextResponse.json({ success: true })
  } catch (error) {
    apiLogger.error('WebAuthn registration error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}