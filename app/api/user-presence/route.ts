import { db } from '@/lib/db'
import { userSettings } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('=== USER PRESENCE API POST CALLED ===')
  try {
    const { userId, lastSeen } = await request.json()
    console.log('Received presence update:', {
      userId,
      lastSeen,
      timestamp: new Date().toISOString(),
    })

    // Check if record exists
    console.log('Checking for existing record...')
    const existing = await db
      .select()
      .from(userSettings)
      .where(and(eq(userSettings.user_id, userId), eq(userSettings.key, 'last_seen')))
      .limit(1)

    console.log('Existing records found:', existing.length)

    let result
    if (existing.length > 0) {
      console.log('Updating existing record for user:', userId)
      // Update existing record
      result = await db
        .update(userSettings)
        .set({
          value: lastSeen.toString(),
          updated_at: Date.now(),
        })
        .where(and(eq(userSettings.user_id, userId), eq(userSettings.key, 'last_seen')))
        .returning()
      console.log('Update result:', result)
    } else {
      console.log('Inserting new record for user:', userId)
      // Insert new record
      result = await db
        .insert(userSettings)
        .values({
          user_id: userId,
          key: 'last_seen',
          value: lastSeen.toString(),
        })
        .returning()
      console.log('Insert result:', result)
    }

    console.log('Final database result:', result)
    console.log('=== USER PRESENCE API POST COMPLETED ===')
    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error('=== ERROR in user presence API ===', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  console.log('=== USER PRESENCE API GET CALLED ===')
  try {
    // Get all user last seen timestamps using Drizzle
    console.log('Fetching user presence data from database...')
    const data = await db
      .select({
        user_id: userSettings.user_id,
        value: userSettings.value,
      })
      .from(userSettings)
      .where(eq(userSettings.key, 'last_seen'))

    console.log('Raw database data:', data)

    // Calculate online status (online if last seen within 2 minutes)
    const now = Date.now()
    const onlineUsers: Record<string, boolean> = {}

    data.forEach(({ user_id, value }) => {
      const lastSeen = parseInt(value || '0')
      const isOnline = now - lastSeen < 120000 // 2 minutes
      onlineUsers[user_id] = isOnline
      console.log(
        `User ${user_id}: lastSeen=${lastSeen}, now=${now}, diff=${
          now - lastSeen
        }ms, online=${isOnline}`
      )
    })

    console.log('Calculated online users:', onlineUsers)
    console.log('=== USER PRESENCE API GET COMPLETED ===')
    return NextResponse.json({ onlineUsers })
  } catch (error: any) {
    console.error('=== ERROR in user presence GET API ===', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
