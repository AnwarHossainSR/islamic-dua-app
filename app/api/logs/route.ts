import { checkAdminStatus, checkPermission } from '@/lib/actions/auth'
import { apiLogger } from '@/lib/logger'
import { PERMISSIONS } from '@/lib/permissions/constants'
import { getLogs, clearAllLogs } from '@/lib/db/queries/logs'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    await checkPermission(PERMISSIONS.LOGS_READ)

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')))
    const level = searchParams.get('level') || 'all'

    const { logs, total } = await getLogs({ page, limit, level })

    return NextResponse.json({ 
      logs, 
      total, 
      page, 
      limit 
    })
  } catch (error: any) {
    apiLogger.error('Failed to retrieve logs', { 
      error: {
        message: error?.message || 'Unknown error',
        code: error?.code,
        details: error?.details
      },
      timestamp: new Date().toISOString()
    })
    return NextResponse.json({ error: 'Failed to retrieve logs' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await checkPermission(PERMISSIONS.LOGS_DELETE)

    await clearAllLogs()
    return NextResponse.json({ success: true })
  } catch (error) {
    apiLogger.error('Failed to clear logs', { error })
    return NextResponse.json({ error: 'Failed to clear logs' }, { status: 500 })
  }
}
