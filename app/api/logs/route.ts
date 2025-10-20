import { checkAdminStatus } from '@/lib/actions/auth'
import { apiLogger } from '@/lib/logger'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const admin = await checkAdminStatus()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const level = searchParams.get('level')

    const supabase = await getSupabaseServerClient()
    let query = supabase
      .from('api_logs')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (level && level !== 'all') {
      query = query.eq('level', level)
    }

    const { data: logs, error, count } = await query

    if (error) throw error

    return NextResponse.json({ logs, total: count, page, limit })
  } catch (error) {
    apiLogger.error('Failed to retrieve logs', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json({ error: 'Failed to retrieve logs' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const admin = await checkAdminStatus()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await getSupabaseServerClient()
    const { error } = await supabase
      .from('api_logs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    apiLogger.error('Failed to clear logs', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json({ error: 'Failed to clear logs' }, { status: 500 })
  }
}
