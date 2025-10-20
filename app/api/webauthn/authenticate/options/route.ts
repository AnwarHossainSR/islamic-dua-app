import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST() {
  try {
    const challenge = crypto.randomBytes(32).toString('base64')

    const options = {
      challenge,
      timeout: 60000,
      userVerification: 'required',
      rpId: process.env.NEXT_PUBLIC_WEBAUTHN_RP_ID || 'localhost'
    }

    return NextResponse.json(options)
  } catch (error) {
    console.error('WebAuthn authentication options error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}