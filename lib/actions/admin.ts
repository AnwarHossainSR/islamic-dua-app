'use server'

import { getSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function checkAdminAccess() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!adminUser) {
    redirect('/')
  }

  return adminUser
}

export async function isUserAdmin() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  return !!adminUser
}

// ============================================
// ACTIVITY STATS FUNCTIONS
// ============================================

export async function getAdminActivityStats() {
  const supabase = await getSupabaseServerClient()

  // Get total activities count
  const { count: totalActivities } = await supabase
    .from('activity_stats')
    .select('id', { count: 'exact', head: true })

  // Get total completions across all activities
  const { data: activityStats } = await supabase
    .from('activity_stats')
    .select('total_count, total_users')

  const totalCompletions =
    activityStats?.reduce((sum, stat) => sum + (stat.total_count || 0), 0) || 0
  const totalActiveUsers =
    activityStats?.reduce((sum, stat) => sum + (stat.total_users || 0), 0) || 0

  // Get active challenges count
  const { count: activeChallenges } = await supabase
    .from('challenge_templates')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)

  // Get today's completions
  const today = new Date().toISOString().split('T')[0]
  const { count: todayCompletions } = await supabase
    .from('user_challenge_daily_logs')
    .select('id', { count: 'exact', head: true })
    .eq('completion_date', today)
    .eq('is_completed', true)

  // Get yesterday's completions
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const { count: yesterdayCompletions } = await supabase
    .from('user_challenge_daily_logs')
    .select('id', { count: 'exact', head: true })
    .eq('completion_date', yesterday)
    .eq('is_completed', true)

  // Get this week's completions
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
  const { count: weekCompletions } = await supabase
    .from('user_challenge_daily_logs')
    .select('id', { count: 'exact', head: true })
    .gte('completion_date', weekAgo)
    .eq('is_completed', true)

  return {
    totalActivities: totalActivities || 0,
    totalCompletions,
    totalActiveUsers,
    activeChallenges: activeChallenges || 0,
    todayCompletions: todayCompletions || 0,
    yesterdayCompletions: yesterdayCompletions || 0,
    weekCompletions: weekCompletions || 0,
  }
}

export async function getTopActivities(limit = 10) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('activity_stats')
    .select('*')
    .order('total_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching top activities:', error)
    return []
  }

  return data
}

export async function getAllActivities() {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('activity_stats')
    .select('*')
    .order('total_count', { ascending: false })

  if (error) {
    console.error('Error fetching all activities:', error)
    return []
  }

  return data
}

export async function getUserActivityStats(userId: string) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('user_activity_stats')
    .select(
      `
      *,
      activity:activity_stats(*)
    `
    )
    .eq('user_id', userId)
    .order('total_completed', { ascending: false })

  if (error) {
    console.error('Error fetching user activity stats:', error)
    return []
  }

  return data
}

export async function getActivityById(id: string) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.from('activity_stats').select('*').eq('id', id).single()

  if (error) {
    console.error('Error fetching activity:', error)
    return null
  }

  return data
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
    console.error('Error fetching activity:', activityError)
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
    console.error('Error fetching challenge mappings:', mappingsError)
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
    console.error('Error fetching top users:', error)
    return []
  }

  return data
}

// Recalculate all activity stats (useful for maintenance)
export async function recalculateActivityStats() {
  const supabase = await getSupabaseServerClient()

  // Get all activities
  const { data: activities } = await supabase.from('activity_stats').select('id')

  if (!activities) return { error: 'No activities found' }

  // Update each activity's stats
  for (const activity of activities) {
    // Calculate total count and users
    const { data: logs } = await supabase
      .from('user_challenge_daily_logs')
      .select('count_completed, user_id, challenge_id')
      .eq('is_completed', true)
      .in(
        'challenge_id',
        supabase
          .from('challenge_activity_mapping')
          .select('challenge_id')
          .eq('activity_stat_id', activity.id)
      )

    if (logs) {
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
