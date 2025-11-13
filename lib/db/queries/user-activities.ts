import { desc, eq } from 'drizzle-orm'
import { db } from '../index'
import { activityStats, challengeTemplates, userActivityStats, userChallengeDailyLogs, userChallengeProgress } from '../schema'

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
        name_ar: activityStats.name_ar,
        name_en: activityStats.name_en,
        unique_slug: activityStats.unique_slug,
        arabic_text: activityStats.arabic_text,
        activity_type: activityStats.activity_type,
        icon: activityStats.icon,
        color: activityStats.color,
        total_count: activityStats.total_count,
      }
    })
    .from(userActivityStats)
    .leftJoin(activityStats, eq(userActivityStats.activity_stat_id, activityStats.id))
    .where(eq(userActivityStats.user_id, userId))
    .orderBy(desc(userActivityStats.total_completed))
}

export async function getUserChallengeProgressStats(userId: string) {
  const progressData = await db
    .select({
      status: userChallengeProgress.status,
      current_streak: userChallengeProgress.current_streak,
      longest_streak: userChallengeProgress.longest_streak,
      total_completed_days: userChallengeProgress.total_completed_days,
    })
    .from(userChallengeProgress)
    .where(eq(userChallengeProgress.user_id, userId))

  const totalCompleted = progressData.filter(p => p.status === 'completed').length
  const totalActive = progressData.filter(p => p.status === 'active').length
  const longestStreak = progressData.length > 0 
    ? Math.max(...progressData.map(p => p.longest_streak || 0))
    : 0
  const totalDaysCompleted = progressData.reduce((sum, p) => sum + (p.total_completed_days || 0), 0)

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
      day_number: userChallengeDailyLogs.day_number,
      count_completed: userChallengeDailyLogs.count_completed,
      completed_at: userChallengeDailyLogs.completed_at,
      is_completed: userChallengeDailyLogs.is_completed,
      challenge_title_bn: challengeTemplates.title_bn,
      challenge_icon: challengeTemplates.icon,
    })
    .from(userChallengeDailyLogs)
    .leftJoin(userChallengeProgress, eq(userChallengeDailyLogs.user_progress_id, userChallengeProgress.id))
    .leftJoin(challengeTemplates, eq(userChallengeProgress.challenge_id, challengeTemplates.id))
    .where(eq(userChallengeDailyLogs.user_id, userId))
    .orderBy(desc(userChallengeDailyLogs.created_at))
    .limit(limit)

  return logs.map(log => ({
    id: log.id,
    day_number: log.day_number,
    count_completed: log.count_completed,
    completed_at: log.completed_at || null,
    is_completed: log.is_completed,
    userProgress: {
      challenge: {
        title_bn: log.challenge_title_bn ?? '',
        icon: log.challenge_icon ?? undefined,
      }
    }
  }))
}