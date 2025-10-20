import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getCredential } from '@/lib/webauthn/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json()
    console.log('credential', credential)

    if (!credential?.id) {
      return NextResponse.json(
        { error: 'Credential not found, please provide credential' },
        { status: 404 }
      )
    }

    // Find the credential in database
    const storedCredential = await getCredential(credential.id)

    if (!storedCredential) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 })
    }

    // Get user from database
    const supabase = await getSupabaseServerClient()
    const { data: user, error } = await supabase.auth.admin.getUserById(storedCredential.user_id)

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create session for the user
    const { data: sessionData, error: sessionError }: any = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: user.user.email!,
    })

    if (sessionError) {
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

    return NextResponse.json({ success: true, user: user.user })
  } catch (error) {
    console.error('WebAuthn authentication error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
