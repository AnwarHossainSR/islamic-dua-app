import { getSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, lastSeen } = await request.json()
    const supabase = await getSupabaseServerClient()

    // Update user's last seen timestamp
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        key: 'last_seen',
        value: lastSeen.toString(),
      })

    if (error) {
      console.error('Error updating user presence:', error)
      return NextResponse.json({ error: 'Failed to update presence' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in user presence API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()

    // Get all user last seen timestamps
    const { data, error } = await supabase
      .from('user_settings')
      .select('user_id, value')
      .eq('key', 'last_seen')

    if (error) {
      console.error('Error fetching user presence:', error)
      return NextResponse.json({ error: 'Failed to fetch presence' }, { status: 500 })
    }

    // Calculate online status (online if last seen within 2 minutes)
    const now = Date.now()
    const onlineUsers: Record<string, boolean> = {}
    
    data?.forEach(({ user_id, value }) => {
      const lastSeen = parseInt(value || '0')
      onlineUsers[user_id] = (now - lastSeen) < 120000 // 2 minutes
    })

    return NextResponse.json({ onlineUsers })
  } catch (error) {
    console.error('Error in user presence API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}