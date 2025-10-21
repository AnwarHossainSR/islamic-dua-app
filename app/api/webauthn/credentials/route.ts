import { getUser } from '@/lib/actions/auth'
import { getUserCredentials, deleteCredential } from '@/lib/webauthn/server'
import { NextRequest, NextResponse } from 'next/server'
import { apiLogger } from '@/lib/logger'

export async function GET() {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const credentials = await getUserCredentials(user.id)
    
    apiLogger.info('User credentials retrieved', { userId: user.id, count: credentials.length })
    
    return NextResponse.json({ credentials })
  } catch (error) {
    apiLogger.error('Failed to retrieve credentials', { error: error instanceof Error ? error.message : 'Unknown error' })
    return NextResponse.json({ error: 'Failed to retrieve credentials' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { credentialId } = await request.json()
    
    if (!credentialId) {
      return NextResponse.json({ error: 'Credential ID required' }, { status: 400 })
    }

    await deleteCredential(credentialId, user.id)
    
    apiLogger.info('User credential deleted', { userId: user.id, credentialId })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    apiLogger.error('Failed to delete credential', { error: error instanceof Error ? error.message : 'Unknown error' })
    return NextResponse.json({ error: 'Failed to delete credential' }, { status: 500 })
  }
}