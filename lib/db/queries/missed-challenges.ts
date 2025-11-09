import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

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

// Get user's missed challenges for last 3 months
export async function getUserMissedChallenges(userId: string): Promise<MissedChallenge[]> {
  const result = await db.execute(
    sql`SELECT * FROM get_user_missed_challenges_3months(${userId}::uuid)`
  )
  
  return result.map(row => ({
    missed_date: row.missed_date as string,
    challenge_id: row.challenge_id as string,
    challenge_title_bn: row.challenge_title_bn as string,
    challenge_icon: row.challenge_icon as string | null,
    challenge_color: row.challenge_color as string | null,
    reason: row.reason as string,
    days_ago: row.days_ago as number
  }))
}

// Get missed challenges summary
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
    most_missed_challenge: row?.most_missed_title ? {
      title_bn: row.most_missed_title as string,
      count: Number(row.most_missed_count || 0)
    } : null
  }
}

// Manually track missed challenge (for admin or correction)
export async function trackMissedChallenge(
  userId: string, 
  challengeId: string, 
  missedDate: string, 
  reason: string = 'not_completed'
) {
  await db.execute(sql`
    INSERT INTO user_missed_challenges (user_id, challenge_id, missed_date, reason, was_active)
    VALUES (${userId}::uuid, ${challengeId}::uuid, ${missedDate}::date, ${reason}, true)
    ON CONFLICT (user_id, challenge_id, missed_date) DO NOTHING
  `)
}

// Run daily missed challenges tracking
export async function runDailyMissedChallengesTracking() {
  await db.execute(sql`SELECT track_missed_challenges()`)
}