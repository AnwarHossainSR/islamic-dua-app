import { eq, and, desc, count, sql } from 'drizzle-orm'
import { db } from '../index'
import { 
  adminUsers, 
  userChallengeProgress, 
  userChallengeDailyLogs, 
  challengeTemplates,
  activityStats,
  userActivityStats
} from '../schema'

export async function checkAdminUser(userId: string) {
  const result = await db
    .select()
    .from(adminUsers)
    .where(and(eq(adminUsers.user_id, userId), eq(adminUsers.is_active, true)))
    .limit(1)
  
  return result[0] || null
}

export async function getAdminStats() {
  // Get total activities
  const [totalActivitiesResult] = await db
    .select({ count: count() })
    .from(activityStats)

  // Get total completions
  const [totalCompletionsResult] = await db
    .select({ total: sql<number>`sum(${activityStats.total_count})` })
    .from(activityStats)

  // Get unique active users
  const activeUsersResult = await db
    .selectDistinct({ user_id: userChallengeProgress.user_id })
    .from(userChallengeProgress)
    .where(sql`${userChallengeProgress.status} != 'not_started'`)

  // Get active challenges
  const [activeChallengesResult] = await db
    .select({ count: count() })
    .from(challengeTemplates)
    .where(eq(challengeTemplates.is_active, true))

  return {
    totalActivities: totalActivitiesResult.count,
    totalCompletions: totalCompletionsResult.total || 0,
    totalActiveUsers: activeUsersResult.length,
    activeChallenges: activeChallengesResult.count,
    todayCompletions: 0,
    yesterdayCompletions: 0,
    weekCompletions: 0,
  }
}

export async function getTopActivities(limit = 10) {
  return await db
    .select()
    .from(activityStats)
    .orderBy(desc(activityStats.total_count))
    .limit(limit)
}

export async function getAllActivities() {
  return await db
    .select()
    .from(activityStats)
    .orderBy(desc(activityStats.total_count))
}

export async function getUserActivityStats(userId: string) {
  return await db
    .select({
      id: userActivityStats.id,
      total_completed: userActivityStats.total_completed,
      longest_streak: userActivityStats.longest_streak,
      last_completed_at: userActivityStats.last_completed_at,
      activity: {
        id: activityStats.id,
        name_bn: activityStats.name_bn,
        name_en: activityStats.name_en,
        total_count: activityStats.total_count,
      }
    })
    .from(userActivityStats)
    .leftJoin(activityStats, eq(userActivityStats.activity_stat_id, activityStats.id))
    .where(eq(userActivityStats.user_id, userId))
    .orderBy(desc(userActivityStats.total_completed))
}

export async function getActivityById(id: string) {
  const result = await db
    .select()
    .from(activityStats)
    .where(eq(activityStats.id, id))
    .limit(1)
  
  return result[0] || null
}