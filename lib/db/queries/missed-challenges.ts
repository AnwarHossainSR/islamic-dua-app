import { db } from '@/lib/db'
import { challengeTemplates, userMissedChallenges, appSettings } from '@/lib/db/schema'
import { and, desc, eq, gte, sql } from 'drizzle-orm'
import { apiLogger } from '@/lib/logger'

export interface MissedChallenge {
  missed_date: string
  challenge_id: string
  challenge_title_bn: string
  challenge_icon: string | null
  challenge_color: string | null
  reason: string
  days_ago: number
}

export interface MissedChallengesSummary {
  total_missed: number
  last_7_days: number
  last_30_days: number
  most_missed_challenge: {
    title_bn: string
    count: number
  } | null
}

export async function getUserMissedChallenges(userId: string): Promise<MissedChallenge[]> {
  try {
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    const threeMonthsAgoDate = threeMonthsAgo.toISOString().split('T')[0]

    const result = await db
      .select({
        missed_date: userMissedChallenges.missed_date,
        challenge_id: userMissedChallenges.challenge_id,
        challenge_title_bn: challengeTemplates.title_bn,
        challenge_icon: challengeTemplates.icon,
        challenge_color: challengeTemplates.color,
        reason: userMissedChallenges.reason,
        days_ago: sql<number>`(CURRENT_DATE - ${userMissedChallenges.missed_date})::INTEGER`,
      })
      .from(userMissedChallenges)
      .innerJoin(challengeTemplates, eq(userMissedChallenges.challenge_id, challengeTemplates.id))
      .where(
        and(
          eq(userMissedChallenges.user_id, userId),
          gte(userMissedChallenges.missed_date, threeMonthsAgoDate)
        )
      )
      .orderBy(desc(userMissedChallenges.missed_date), challengeTemplates.title_bn)

    apiLogger.info('Fetched user missed challenges', { userId, count: result.length })
    
    return result.map(row => ({
      missed_date: row.missed_date,
      challenge_id: row.challenge_id,
      challenge_title_bn: row.challenge_title_bn,
      challenge_icon: row.challenge_icon,
      challenge_color: row.challenge_color,
      reason: row.reason || 'not_completed',
      days_ago: row.days_ago,
    }))
  } catch (error) {
    apiLogger.error('Error fetching user missed challenges', { error, userId })
    throw error
  }
}

export async function getMissedChallengesSummary(userId: string): Promise<MissedChallengesSummary> {
  const result = await db.execute(sql`
    WITH missed_stats AS (
      SELECT 
        COUNT(*) as total_missed,
        COUNT(*) FILTER (WHERE missed_date >= CURRENT_DATE - INTERVAL '7 days') as last_7_days,
        COUNT(*) FILTER (WHERE missed_date >= CURRENT_DATE - INTERVAL '30 days') as last_30_days
      FROM user_missed_challenges 
      WHERE user_id = ${userId}::uuid
      AND missed_date >= CURRENT_DATE - INTERVAL '3 months'
    ),
    most_missed AS (
      SELECT 
        ct.title_bn,
        COUNT(*) as miss_count
      FROM user_missed_challenges umc
      JOIN challenge_templates ct ON umc.challenge_id = ct.id
      WHERE umc.user_id = ${userId}::uuid
      AND umc.missed_date >= CURRENT_DATE - INTERVAL '3 months'
      GROUP BY ct.id, ct.title_bn
      ORDER BY COUNT(*) DESC
      LIMIT 1
    )
    SELECT 
      ms.total_missed,
      ms.last_7_days,
      ms.last_30_days,
      mm.title_bn as most_missed_title,
      mm.miss_count as most_missed_count
    FROM missed_stats ms
    LEFT JOIN most_missed mm ON true
  `)

  const row = result[0]

  return {
    total_missed: Number(row?.total_missed || 0),
    last_7_days: Number(row?.last_7_days || 0),
    last_30_days: Number(row?.last_30_days || 0),
    most_missed_challenge: row?.most_missed_title
      ? {
          title_bn: row.most_missed_title as string,
          count: Number(row.most_missed_count || 0),
        }
      : null,
  }
}

export async function runDailyMissedChallengesTracking() {
  const startTime = Date.now()
  
  try {
    apiLogger.info('Starting missed challenges tracking')
    
    const result = await db.execute(sql`SELECT track_missed_challenges()`)
    const duration = Date.now() - startTime
    const processedAt = Date.now()

    // Update last sync time using ORM
    await db
      .insert(appSettings)
      .values({
        key: 'missed_challenges_last_sync',
        value: processedAt.toString(),
        category: 'system',
        type: 'timestamp',
        label: 'Last Missed Challenges Sync',
        description: 'Timestamp of last missed challenges tracking run',
        is_public: false,
      })
      .onConflictDoUpdate({
        target: appSettings.key,
        set: {
          value: processedAt.toString(),
          updated_at: sql`(EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT`,
        },
      })

    apiLogger.info('Missed challenges tracking completed', { duration: `${duration}ms`, processedAt })

    return {
      success: true,
      duration: `${duration}ms`,
      processedAt: new Date(processedAt).toISOString(),
      result: result[0] || null,
    }
  } catch (error) {
    const duration = Date.now() - startTime
    apiLogger.error('Missed challenges tracking failed', { error, duration: `${duration}ms` })

    throw new Error(
      `Missed challenges tracking failed after ${duration}ms: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}

export async function getLastSyncTime(): Promise<number | null> {
  try {
    const result = await db
      .select({ value: appSettings.value })
      .from(appSettings)
      .where(eq(appSettings.key, 'missed_challenges_last_sync'))
      .limit(1)
    
    if (result[0]?.value) {
      return parseInt(result[0].value)
    }
    return null
  } catch (error) {
    apiLogger.error('Error fetching last sync time', { error })
    return null
  }
}
