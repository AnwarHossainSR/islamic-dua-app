'use server'

import { getUser } from '@/lib/actions/auth'
import { apiLogger } from '@/lib/logger'
import { getUserActivityStats, getUserChallengeProgressStats, getUserRecentActivityLogs } from '@/lib/db/queries/user-activities'

export async function getUserActivities() {
  const user = await getUser()

  if (!user) {
    return []
  }

  try {
    return await getUserActivityStats(user.id)
  } catch (error) {
    apiLogger.error('Error fetching user activities with Drizzle', { error, userId: user.id })
    return []
  }
}

export async function getUserChallengeStats() {
  const user = await getUser()

  if (!user) {
    return {
      totalCompleted: 0,
      totalActive: 0,
      totalDaysCompleted: 0,
      longestStreak: 0
    }
  }

  try {
    return await getUserChallengeProgressStats(user.id)
  } catch (error) {
    apiLogger.error('Error fetching user challenge stats with Drizzle', { error, userId: user.id })
    return {
      totalCompleted: 0,
      totalActive: 0,
      totalDaysCompleted: 0,
      longestStreak: 0
    }
  }
}

export async function getUserRecentLogs(limit: number = 10) {
  const user = await getUser()

  if (!user) {
    return []
  }

  try {
    const logs = await getUserRecentActivityLogs(user.id, limit)
    return logs.map(log => ({
      id: log.id,
      day_number: log.day_number ?? 0,
      count_completed: log.count_completed ?? 0,
      completed_at: log.completed_at ?? '',
      is_completed: log.is_completed ?? false,
      user_progress: log.userProgress
    }))
  } catch (error) {
    apiLogger.error('Error fetching user recent logs with Drizzle', { error, userId: user.id, limit })
    return []
  }
}