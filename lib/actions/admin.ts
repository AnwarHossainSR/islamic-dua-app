'use server'

import { apiLogger } from '@/lib/logger'
import { PERMISSIONS } from '@/lib/permissions/constants'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { checkPermission } from './auth'
import { checkAdminUser, getAdminStats, getTopActivities, getAllActivities, getUserActivityStats, getActivityById } from '@/lib/db/queries/admin'

export async function checkAdminAccess() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminUser = await checkAdminUser(user.id)

  if (!adminUser) {
    redirect('/')
  }

  return adminUser
}

const isUserAdminUncached = async () => {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const adminUser = await checkAdminUser(user.id)
  return !!adminUser
}

export const isUserAdmin = cache(isUserAdminUncached)

// ============================================
// ACTIVITY STATS FUNCTIONS
// ============================================

export async function getAdminActivityStats() {
  await checkPermission(PERMISSIONS.ACTIVITIES_READ)
  
  try {
    return await getAdminStats()
  } catch (error) {
    apiLogger.error('Error fetching admin stats with Drizzle', { error })
    return {
      totalActivities: 0,
      totalCompletions: 0,
      totalActiveUsers: 0,
      activeChallenges: 0,
      todayCompletions: 0,
      yesterdayCompletions: 0,
      weekCompletions: 0,
    }
  }
}

export async function getTopActivitiesAction(limit = 10) {
  await checkPermission(PERMISSIONS.ACTIVITIES_READ)
  
  try {
    return await getTopActivities(limit)
  } catch (error) {
    apiLogger.error('Error fetching top activities with Drizzle', { error, limit })
    return []
  }
}

export async function getAllActivitiesAction() {
  await checkPermission(PERMISSIONS.ACTIVITIES_READ)
  
  try {
    return await getAllActivities()
  } catch (error) {
    apiLogger.error('Error fetching all activities with Drizzle', { error })
    return []
  }
}

export async function getUserActivityStatsAction(userId: string) {
  try {
    return await getUserActivityStats(userId)
  } catch (error) {
    apiLogger.error('Error fetching user activity stats with Drizzle', { error, userId })
    return []
  }
}

export async function getActivityByIdAction(id: string) {
  try {
    return await getActivityById(id)
  } catch (error) {
    apiLogger.error('Error fetching activity with Drizzle', { error, id })
    return null
  }
}

// Get activity stats with linked challenges
export async function getActivityWithChallenges(activityId: string) {
  const supabase = await getSupabaseServerClient()

  const { data: activity, error: activityError } = await supabase
    .from('activity_stats')
    .select('*')
    .eq('id', activityId)
    .single()

  if (activityError) {
    apiLogger.error('Error fetching activity', { error: activityError, activityId })
    return null
  }

  // Get linked challenges
  const { data: mappings, error: mappingsError } = await supabase
    .from('challenge_activity_mapping')
    .select(
      `
      *,
      challenge:challenge_templates(*)
    `
    )
    .eq('activity_stat_id', activityId)

  if (mappingsError) {
    apiLogger.error('Error fetching challenge mappings', {
      error: mappingsError,
      activityId,
    })
    return { ...activity, challenges: [] }
  }

  return {
    ...activity,
    challenges: mappings.map(m => m.challenge),
  }
}

// Get top users for a specific activity
export async function getTopUsersForActivity(activityId: string, limit = 10) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('user_activity_stats')
    .select('user_id, total_completed, longest_streak, last_completed_at')
    .eq('activity_stat_id', activityId)
    .order('total_completed', { ascending: false })
    .limit(limit)

  if (error) {
    apiLogger.error('Error fetching top users', { error, activityId, limit })
    return []
  }

  return data
}

// ============================================
// MANUAL ACTIVITY COUNT UPDATE
// ============================================

export async function updateActivityCount(activityId: string, newCount: number) {
  await checkPermission(PERMISSIONS.ACTIVITIES_MANAGE)

  const supabase = await getSupabaseServerClient()

  // Fetch current activity
  const { data: activity, error: fetchError } = await supabase
    .from('activity_stats')
    .select('total_count')
    .eq('id', activityId)
    .single()

  if (fetchError || !activity) {
    return { success: false, error: 'Activity not found' }
  }

  const previousCount = activity.total_count

  // Update activity stats
  const { error: updateError } = await supabase
    .from('activity_stats')
    .update({
      total_count: newCount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', activityId)

  if (updateError) {
    apiLogger.error('Error updating activity count', {
      error: updateError,
      activityId,
      newCount,
    })
    return { success: false, error: updateError.message }
  }

  // Update user activity stats
  const { error: userActivityStatsError } = await supabase
    .from('user_activity_stats')
    .update({
      total_completed: newCount,
      last_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('activity_stat_id', activityId)

  if (userActivityStatsError) {
    apiLogger.error('Error updating user activity count', {
      error: userActivityStatsError,
      activityId,
      newCount,
    })
    return { success: false, error: userActivityStatsError.message }
  }

  return {
    success: true,
    previousCount,
    newCount,
  }
}

// Recalculate all activity stats (useful for maintenance)
export async function recalculateActivityStats() {
  await checkPermission(PERMISSIONS.ACTIVITIES_MANAGE)
  const supabase = await getSupabaseServerClient()

  // Get all activities
  const { data: activities } = await supabase.from('activity_stats').select('id')

  if (!activities) return { error: 'No activities found' }

  // Update each activity's stats
  for (const activity of activities) {
    // 1️⃣ First, get all challenge IDs linked to this activity
    const { data: mappings } = await supabase
      .from('challenge_activity_mapping')
      .select('challenge_id')
      .eq('activity_stat_id', activity.id)

    const challengeIds = mappings?.map(m => m.challenge_id) || []

    if (challengeIds.length === 0) continue

    // 2️⃣ Then, use them in your main query
    const { data: logs } = await supabase
      .from('user_challenge_daily_logs')
      .select('count_completed, user_id, challenge_id')
      .eq('is_completed', true)
      .in('challenge_id', challengeIds)

    if (logs && logs.length > 0) {
      const totalCount = logs.reduce((sum, log) => sum + log.count_completed, 0)
      const uniqueUsers = new Set(logs.map(log => log.user_id)).size

      await supabase
        .from('activity_stats')
        .update({
          total_count: totalCount,
          total_users: uniqueUsers,
        })
        .eq('id', activity.id)
    }
  }

  return { success: true }
}
