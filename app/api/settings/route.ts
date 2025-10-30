import { checkPermission } from '@/lib/actions/auth'
import { getAppSettings, updateAppSetting } from '@/lib/actions/settings'
import { apiLogger } from '@/lib/logger'
import { PERMISSIONS } from '@/lib/permissions/constants'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    await checkPermission(PERMISSIONS.SETTINGS_READ)
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const settings = await getAppSettings(category || undefined)

    return NextResponse.json({ settings })
  } catch (error: any) {
    if (error.message === 'Access denied') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    apiLogger.error('Failed to get settings', { error })
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await checkPermission(PERMISSIONS.SETTINGS_UPDATE)

    const { key, value } = await request.json()

    if (!key) {
      return NextResponse.json({ error: 'Setting key required' }, { status: 400 })
    }

    await updateAppSetting(key, value)

    apiLogger.info('App setting updated', { key, value })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === 'Access denied') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    apiLogger.error('Failed to update setting', { error })
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}
