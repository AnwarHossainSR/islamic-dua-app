import { getUser } from '@/lib/actions/auth'
import { storeCredential } from '@/lib/webauthn/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { credential } = await request.json()

    // Store the credential in the database
    await storeCredential(
      user.id,
      credential.id,
      credential.response.attestationObject,
      0
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('WebAuthn registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}