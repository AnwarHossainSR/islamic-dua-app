import { getAdminActivityStats, getTopActivitiesAction } from '@/lib/actions/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { showGlobal } = await request.json()
    
    const [stats, topActivities] = await Promise.all([
      getAdminActivityStats(showGlobal),
      getTopActivitiesAction(5, showGlobal)
    ])
    
    return NextResponse.json({ stats, topActivities })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}