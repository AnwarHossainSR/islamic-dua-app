import { checkPermission } from '@/lib/actions/auth'
import { apiLogger } from '@/lib/logger'
import { PERMISSIONS } from '@/lib/permissions/constants'
import { db } from '@/lib/db'
import { duas, challengeTemplates, userChallengeProgress, adminUsers } from '@/lib/db/schema'
import { count } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await checkPermission(PERMISSIONS.ADMIN_ACCESS)

    // Get database statistics
    const [duasCount] = await db.select({ count: count() }).from(duas)
    const [challengesCount] = await db.select({ count: count() }).from(challengeTemplates)
    const [activeUsersCount] = await db.select({ count: count() }).from(userChallengeProgress)
    const [adminsCount] = await db.select({ count: count() }).from(adminUsers)

    const totalRecords = duasCount.count + challengesCount.count + activeUsersCount.count + adminsCount.count

    return NextResponse.json({
      totalRecords,
      duasCount: duasCount.count,
      challengesCount: challengesCount.count,
      activeUsers: activeUsersCount.count,
      adminsCount: adminsCount.count,
      dbSize: 'N/A',
      lastBackup: null,
    })
  } catch (error: any) {
    if (error.message === 'Access denied') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    apiLogger.error('Failed to get database stats', { error })
    return NextResponse.json({ error: 'Failed to get database stats' }, { status: 500 })
  }
}