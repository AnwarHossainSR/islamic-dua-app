import { eq, desc, sql } from 'drizzle-orm'
import { db } from '../index'
import { userActivityStats, activityStats, userChallengeProgress, userChallengeDailyLogs, challengeTemplates } from '../schema'

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

export async function getUserChallengeProgressStats(userId: string) {
  const progressData = await db
    .select({
      status: userChallengeProgress.status,
      currentStreak: userChallengeProgress.currentStreak,
      longestStreak: userChallengeProgress.longestStreak,
      totalCompletedDays: userChallengeProgress.totalCompletedDays,
    })
    .from(userChallengeProgress)
    .where(eq(userChallengeProgress.userId, userId))

  const totalCompleted = progressData.filter(p => p.status === 'completed').length
  const totalActive = progressData.filter(p => p.status === 'active').length
  const longestStreak = progressData.length > 0 
    ? Math.max(...progressData.map(p => p.longestStreak || 0))
    : 0
  const totalDaysCompleted = progressData.reduce((sum, p) => sum + (p.totalCompletedDays || 0), 0)

  return {
    totalCompleted,
    totalActive,
    totalDaysCompleted,
    longestStreak
  }
}

export async function getUserRecentActivityLogs(userId: string, limit: number = 10) {
  const logs = await db
    .select({
      id: userChallengeDailyLogs.id,
      dayNumber: userChallengeDailyLogs.dayNumber,
      countCompleted: userChallengeDailyLogs.countCompleted,
      completedAt: userChallengeDailyLogs.completedAt,
      isCompleted: userChallengeDailyLogs.isCompleted,
      challengeTitleBn: challengeTemplates.titleBn,
      challengeIcon: challengeTemplates.icon,
    })
    .from(userChallengeDailyLogs)
    .leftJoin(userChallengeProgress, eq(userChallengeDailyLogs.userProgressId, userChallengeProgress.id))
    .leftJoin(challengeTemplates, eq(userChallengeProgress.challengeId, challengeTemplates.id))
    .where(eq(userChallengeDailyLogs.userId, userId))
    .orderBy(desc(userChallengeDailyLogs.createdAt))
    .limit(limit)

  return logs.map(log => ({
    id: log.id,
    dayNumber: log.dayNumber,
    countCompleted: log.countCompleted,
    completedAt: log.completedAt ? log.completedAt.toISOString() : null,
    isCompleted: log.isCompleted,
    userProgress: {
      challenge: {
        titleBn: log.challengeTitleBn,
        icon: log.challengeIcon,
      }
    }
  }))
}