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

export async function getUserStats(userId: string) {
  // Get user's activities count
  const [totalActivitiesResult] = await db
    .select({ count: count() })
    .from(userActivityStats)
    .where(eq(userActivityStats.user_id, userId))

  // Get user's total completions
  const [totalCompletionsResult] = await db
    .select({ total: sql<number>`sum(${userActivityStats.total_completed})` })
    .from(userActivityStats)
    .where(eq(userActivityStats.user_id, userId))

  // Get user's active challenges
  const [activeChallengesResult] = await db
    .select({ count: count() })
    .from(userChallengeProgress)
    .where(and(
      eq(userChallengeProgress.user_id, userId),
      eq(userChallengeProgress.status, 'active')
    ))

  // Get user's today completions
  const today = new Date().toISOString().split('T')[0]
  const [todayCompletionsResult] = await db
    .select({ count: count() })
    .from(userChallengeDailyLogs)
    .where(and(
      eq(userChallengeDailyLogs.user_id, userId),
      eq(userChallengeDailyLogs.is_completed, true),
      sql`DATE(${userChallengeDailyLogs.completion_date}) = ${today}`
    ))

  return {
    totalActivities: totalActivitiesResult.count,
    totalCompletions: Number(totalCompletionsResult.total) || 0,
    totalActiveUsers: 1, // Always 1 for user's own data
    activeChallenges: activeChallengesResult.count,
    todayCompletions: todayCompletionsResult.count,
    yesterdayCompletions: 0,
    weekCompletions: 0,
  }
}

export async function getUserTopActivities(userId: string, limit = 10) {
  return await db
    .select({
      id: activityStats.id,
      name_bn: activityStats.name_bn,
      name_ar: activityStats.name_ar,
      name_en: activityStats.name_en,
      total_count: userActivityStats.total_completed,
      total_users: sql<number>`1`, // Always 1 for user's own data
      icon: activityStats.icon,
      color: activityStats.color,
    })
    .from(userActivityStats)
    .leftJoin(activityStats, eq(userActivityStats.activity_stat_id, activityStats.id))
    .where(eq(userActivityStats.user_id, userId))
    .orderBy(desc(userActivityStats.total_completed))
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