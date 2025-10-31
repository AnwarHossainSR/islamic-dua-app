'use server'

import { getUser } from '@/lib/actions/auth'
import { apiLogger } from '@/lib/logger'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function getUserActivities() {
  const supabase = await getSupabaseServerClient()
  const user = await getUser()

  if (!user) {
    return []
  }

  // Get user's activity stats
  const { data, error } = await supabase
    .from('user_activity_stats')
    .select(`
      *,
      activity:activity_stats(*)
    `)
    .eq('user_id', user.id)
    .order('total_completed', { ascending: false })

  if (error) {
    apiLogger.error('Error fetching user activities', { error, userId: user.id })
    return []
  }

  return data || []
}

export async function getUserChallengeStats() {
  const supabase = await getSupabaseServerClient()
  const user = await getUser()

  if (!user) {
    return {
      totalCompleted: 0,
      totalActive: 0,
      totalDaysCompleted: 0,
      longestStreak: 0
    }
  }

  // Get user's challenge progress
  const { data: progressData } = await supabase
    .from('user_challenge_progress')
    .select('status, current_streak, longest_streak, total_completed_days')
    .eq('user_id', user.id)

  const totalCompleted = progressData?.filter(p => p.status === 'completed').length || 0
  const totalActive = progressData?.filter(p => p.status === 'active').length || 0
  const longestStreak = progressData && progressData.length > 0 
    ? Math.max(...progressData.map(p => p.longest_streak || 0))
    : 0
  const totalDaysCompleted = progressData?.reduce((sum, p) => sum + (p.total_completed_days || 0), 0) || 0

  return {
    totalCompleted,
    totalActive,
    totalDaysCompleted,
    longestStreak
  }
}

export async function getUserRecentLogs(limit: number = 10) {
  const supabase = await getSupabaseServerClient()
  const user = await getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('user_challenge_daily_logs')
    .select(`
      *,
      user_progress:user_challenge_progress(
        challenge:challenge_templates(title_bn, icon)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    apiLogger.error('Error fetching user recent logs', { error, userId: user.id, limit })
    return []
  }

  return data || []
}