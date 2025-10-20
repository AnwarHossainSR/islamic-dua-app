import { getUser } from '@/lib/actions/auth'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST() {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const challenge = crypto.randomBytes(32).toString('base64')
    const userId = Buffer.from(user.id).toString('base64')

    const options = {
      challenge,
      rp: {
        name: 'Islamic Dua App',
        id: process.env.NEXT_PUBLIC_WEBAUTHN_RP_ID || 'localhost'
      },
      user: {
        id: userId,
        name: user.email || 'user',
        displayName: user.email || 'User'
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },
        { alg: -257, type: 'public-key' }
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        requireResidentKey: false
      },
      timeout: 60000,
      attestation: 'none'
    }

    return NextResponse.json(options)
  } catch (error) {
    console.error('WebAuthn registration options error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}