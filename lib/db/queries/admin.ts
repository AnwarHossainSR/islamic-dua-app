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
    .where(and(eq(adminUsers.userId, userId), eq(adminUsers.isActive, true)))
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
    .select({ total: sql<number>`sum(${activityStats.totalCount})` })
    .from(activityStats)

  // Get unique active users
  const activeUsersResult = await db
    .selectDistinct({ userId: userChallengeProgress.userId })
    .from(userChallengeProgress)
    .where(sql`${userChallengeProgress.status} != 'not_started'`)

  // Get active challenges
  const [activeChallengesResult] = await db
    .select({ count: count() })
    .from(challengeTemplates)
    .where(eq(challengeTemplates.isActive, true))

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
    .orderBy(desc(activityStats.totalCount))
    .limit(limit)
}

export async function getAllActivities() {
  return await db
    .select()
    .from(activityStats)
    .orderBy(desc(activityStats.totalCount))
}

export async function getUserActivityStats(userId: string) {
  return await db
    .select({
      id: userActivityStats.id,
      totalCompleted: userActivityStats.totalCompleted,
      longestStreak: userActivityStats.longestStreak,
      lastCompletedAt: userActivityStats.lastCompletedAt,
      activity: {
        id: activityStats.id,
        nameBn: activityStats.nameBn,
        nameEn: activityStats.nameEn,
        totalCount: activityStats.totalCount,
      }
    })
    .from(userActivityStats)
    .leftJoin(activityStats, eq(userActivityStats.activityStatId, activityStats.id))
    .where(eq(userActivityStats.userId, userId))
    .orderBy(desc(userActivityStats.totalCompleted))
}

export async function getActivityById(id: string) {
  const result = await db
    .select()
    .from(activityStats)
    .where(eq(activityStats.id, id))
    .limit(1)
  
  return result[0] || null
}