import { checkAdminStatus } from '@/lib/actions/auth'
import { getAppSettings, updateAppSetting } from '@/lib/actions/settings'
import { apiLogger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const settings = await getAppSettings(category || undefined)

    return NextResponse.json({ settings })
  } catch (error) {
    apiLogger.error('Failed to get settings', { error })
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await checkAdminStatus()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { key, value } = await request.json()

    if (!key) {
      return NextResponse.json({ error: 'Setting key required' }, { status: 400 })
    }

    await updateAppSetting(key, value)

    apiLogger.info('App setting updated', { admin_id: admin.user_id, key, value })

    return NextResponse.json({ success: true })
  } catch (error) {
    apiLogger.error('Failed to update setting', { error })
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}
