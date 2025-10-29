'use server'

import { Challenge } from '@/app/(authenticated)/challenges/challenges-client'
import { PERMISSIONS } from '@/lib/permissions'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { apiLogger } from '../logger'
import { isCurrentDay } from '../utils'
import { checkPermission } from './auth'

// ============================================
// CHALLENGE QUERIES
// ============================================

export async function getChallenges() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: challenges, error: challengesError } = await supabase
    .from('challenge_templates')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (challengesError) {
    apiLogger.error('Error fetching challenges', { error: challengesError })
    return []
  }

  const { data: progress, error: progressError } = await supabase
    .from('user_challenge_progress')
    .select(
      'id, challenge_id, status, current_day, total_completed_days, last_completed_at, completion_count'
    )

  if (progressError) {
    apiLogger.error('Error fetching user challenge progress', { error: progressError })
    return challenges.map(challenge => ({
      ...challenge,
      user_status: 'not_started',
      last_completed_at: null,
      progress_id: null,
      completion_percentage: 0,
    }))
  }

  // Merge challenges with progress
  const mergedData = challenges.map(challenge => {
    const userProgress = progress.find(p => p.challenge_id === challenge.id)

    if (!userProgress) {
      return {
        ...challenge,
        user_status: 'not_started',
        last_completed_at: null,
        progress_id: null,
        completion_percentage: 0,
      }
    }

    // Calculate completion percentage based on completed days vs total days
    const completionPercentage = Math.min(
      Math.round((userProgress.total_completed_days / challenge.total_days) * 100),
      100
    )

    return {
      ...challenge,
      user_status: userProgress.status,
      last_completed_at: userProgress.last_completed_at,
      progress_id: userProgress.id,
      completion_percentage: completionPercentage,
      current_day: userProgress.current_day,
      total_completed_days: userProgress.total_completed_days,
      completion_count: userProgress.completion_count,
    }
  })

  // Sort based on whether the challenge was completed today or not
  mergedData.sort((a: any, b: any) => {
    const aIsCurrentDay = isCurrentDay(a.last_completed_at)
    const bIsCurrentDay = isCurrentDay(b.last_completed_at)

    if (!aIsCurrentDay && bIsCurrentDay) return -1 // Show non-completed first
    if (aIsCurrentDay && !bIsCurrentDay) return 1 // Show completed after non-completed

    // If both or neither are completed today, sort by last completed date
    if (!a.last_completed_at && !b.last_completed_at) return 0
    if (!a.last_completed_at) return 1
    if (!b.last_completed_at) return -1
    return new Date(b.last_completed_at).getTime() - new Date(a.last_completed_at).getTime()
  })

  return mergedData
}

// NEW: Server action for filtering and searching
export async function searchAndFilterChallenges({
  searchQuery = '',
  difficulty = 'all',
  status = 'all',
}: {
  searchQuery?: string
  difficulty?: string
  status?: string
}) {
  const supabase = await getSupabaseServerClient()

  let query = supabase.from('challenge_templates').select('*').eq('is_active', true)

  // Apply search filter
  if (searchQuery.trim()) {
    query = query.or(
      `title_bn.ilike.%${searchQuery}%,title_ar.ilike.%${searchQuery}%,description_bn.ilike.%${searchQuery}%`
    )
  }

  // Apply difficulty filter
  if (difficulty !== 'all') {
    query = query.eq('difficulty_level', difficulty)
  }

  // Apply status filter
  if (status === 'featured') {
    query = query.eq('is_featured', true)
  } else if (status === 'inactive') {
    query = query.eq('is_active', false)
  }
  // status === 'active' or 'all' already handled by the is_active filter above

  query = query.order('display_order', { ascending: true })

  const { data: challenges, error: challengesError } = await query

  if (challengesError) {
    apiLogger.error('Error searching challenges', { error: challengesError })
    return []
  }

  // Merge with last_completed_at
  const { data: progress } = await supabase
    .from('user_challenge_progress')
    .select('challenge_id, last_completed_at')

  const mergedData = challenges.map((challenge: any) => {
    const userProgress = progress?.find(p => p.challenge_id === challenge.id)
    return {
      ...challenge,
      last_completed_at: userProgress ? userProgress.last_completed_at : null,
    }
  })

  return mergedData
}

export async function getFeaturedChallenges() {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('challenge_templates')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('display_order', { ascending: true })

  if (error) {
    apiLogger.error('Error fetching featured challenges', { error })
    return []
  }

  return data
}

const getChallengeByIdUncached = async (id: string) => {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('challenge_templates')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    apiLogger.error('Error fetching challenge', { error, id })
    return null
  }

  return data
}

export const getChallengeById = cache(getChallengeByIdUncached)

// ============================================
// USER PROGRESS QUERIES
// ============================================

export async function getUserActiveChallenges(userId: string) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('user_challenge_progress')
    .select(
      `
      *,
      challenge:challenge_templates(*)
    `
    )
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('started_at', { ascending: false })

  if (error) {
    apiLogger.error('Error fetching user active challenges', { error, userId })
    return []
  }

  return data
}

export async function getUserCompletedChallenges(userId: string) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('user_challenge_progress')
    .select(
      `
      *,
      challenge:challenge_templates(*)
    `
    )
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  if (error) {
    apiLogger.error('Error fetching user completed challenges', { error, userId })
    return []
  }

  return data
}

export async function getUserChallengeProgress(progressId: string) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('user_challenge_progress')
    .select(
      `
      *,
      challenge:challenge_templates(*),
      daily_logs:user_challenge_daily_logs(*)
    `
    )
    .eq('id', progressId)
    .single()

  if (error) {
    apiLogger.error('Error fetching challenge progress', { error, progressId })
    return null
  }

  return data
}

export async function getUserChallengeStats(userId: string) {
  const supabase = await getSupabaseServerClient()

  // Get total stats
  const { data: progressData } = await supabase
    .from('user_challenge_progress')
    .select('status, current_streak, longest_streak, total_completed_days')
    .eq('user_id', userId)

  const totalCompleted = progressData?.filter(p => p.status === 'completed').length || 0
  const totalActive = progressData?.filter(p => p.status === 'active').length || 0
  const longestStreak = Math.max(...(progressData?.map(p => p.longest_streak) || [0]))
  const totalDaysCompleted =
    progressData?.reduce((sum, p) => sum + (p.total_completed_days || 0), 0) || 0

  // Get achievements
  const { data: achievements } = await supabase
    .from('user_achievements')
    .select(
      `
      *,
      achievement:challenge_achievements(*)
    `
    )
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })

  return {
    totalCompleted,
    totalActive,
    longestStreak,
    totalDaysCompleted,
    achievements: achievements || [],
  }
}

// ============================================
// CHALLENGE MUTATIONS
// ============================================

export async function startChallenge(userId: string, challengeId: string) {
  const supabase = await getSupabaseServerClient()

  // Check if user already has active challenge
  const { data: existing } = await supabase
    .from('user_challenge_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('challenge_id', challengeId)
    .eq('status', 'active')
    .single()

  if (existing) {
    return { error: 'You already have an active challenge for this' }
  }

  // Create new progress record
  const { data, error } = await supabase
    .from('user_challenge_progress')
    .insert({
      user_id: userId,
      challenge_id: challengeId,
      current_day: 1,
      status: 'active',
      current_streak: 0,
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    apiLogger.error('Error starting challenge', { error, userId, challengeId })
    return { error: error.message }
  }

  try {
    const { error: incrementError } = await supabase.rpc('increment_participants', {
      p_challenge_id: challengeId,
    })

    if (incrementError) {
      throw incrementError
    }
  } catch (error) {
    apiLogger.error('Error incrementing participants', { error, challengeId })
  }

  revalidatePath('/challenges')
  return { data }
}

export async function restartChallenge(challenge: Challenge) {
  const supabase = await getSupabaseServerClient()

  // Reset the existing progress record instead of creating a new one
  const { error } = await supabase
    .from('user_challenge_progress')
    .update({
      current_day: 1,
      status: 'active',
      current_streak: 0,
      longest_streak: 0,
      total_completed_days: 0,
      missed_days: 0,
      started_at: new Date().toISOString(),
      completed_at: null,
      paused_at: null,
      last_completed_at: null,
    })
    .eq('id', challenge.progress_id)

  if (error) {
    apiLogger.error('Error restarting challenge', { error, progressId: challenge.progress_id })
    return { error: error.message }
  }

  // Clear existing daily logs for this progress
  await supabase
    .from('user_challenge_daily_logs')
    .delete()
    .eq('user_progress_id', challenge.progress_id)

  const { error: updateError } = await supabase
    .from('challenge_templates')
    .update({ total_completions: 0, completion_count: challenge.completion_count + 1 })
    .eq('id', challenge.id)

  if (updateError) {
    apiLogger.error('Error updating challenge template', { error: updateError, challengeId: challenge.id })
    return { error: updateError.message }
  }

  revalidatePath('/challenges')
  return { success: true }
}

export async function completeDailyChallenge(
  progressId: string,
  userId: string,
  challengeId: string,
  dayNumber: number,
  countCompleted: number,
  targetCount: number,
  notes?: string,
  mood?: string
) {
  const supabase = await getSupabaseServerClient()

  const isCompleted = countCompleted >= targetCount
  const now = new Date().toISOString()

  // Check if daily log already exists for this day
  const { data: existingLog } = await supabase
    .from('user_challenge_daily_logs')
    .select('id')
    .eq('user_progress_id', progressId)
    .eq('day_number', dayNumber)
    .single()

  let logError
  if (existingLog) {
    // Update existing log
    const { error } = await supabase
      .from('user_challenge_daily_logs')
      .update({
        count_completed: countCompleted,
        target_count: targetCount,
        is_completed: isCompleted,
        completed_at: now,
        notes,
        mood,
      })
      .eq('id', existingLog.id)
    logError = error
  } else {
    // Insert new daily log
    const { error } = await supabase.from('user_challenge_daily_logs').insert({
      user_progress_id: progressId,
      user_id: userId,
      challenge_id: challengeId,
      day_number: dayNumber,
      completion_date: new Date().toISOString().split('T')[0],
      count_completed: countCompleted,
      target_count: targetCount,
      is_completed: isCompleted,
      completed_at: now,
      notes,
      mood,
    })
    logError = error
  }

  if (logError) {
    console.error('Error logging daily completion:', logError)
    apiLogger.error('Error logging daily completion', { error: logError })
    return { error: logError.message }
  }

  // Get current progress
  const { data: progress } = await supabase
    .from('user_challenge_progress')
    .select('*, challenge:challenge_templates(*)')
    .eq('id', progressId)
    .single()

  if (!progress) {
    apiLogger.error('Progress not found')
    return { error: 'Progress not found' }
  }

  // Update progress
  const newStreak = isCompleted ? (progress.current_streak || 0) + 1 : 0
  const newLongestStreak = Math.max(progress.longest_streak || 0, newStreak)
  const newTotalCompleted = (progress.total_completed_days || 0) + (isCompleted ? 1 : 0)
  const newMissedDays = (progress.missed_days || 0) + (isCompleted ? 0 : 1)
  const newCurrentDay = dayNumber + 1

  const isChallengeCompleted =
    newCurrentDay > progress.challenge.total_days &&
    newTotalCompleted >= progress.challenge.total_days

  const updateData: any = {
    current_day: newCurrentDay,
    current_streak: newStreak,
    longest_streak: newLongestStreak,
    total_completed_days: newTotalCompleted,
    missed_days: newMissedDays,
    last_completed_at: now,
  }

  if (isChallengeCompleted) {
    updateData.status = 'completed'
    updateData.completed_at = now
  }

  const { error: updateError } = await supabase
    .from('user_challenge_progress')
    .update(updateData)
    .eq('id', progressId)

  if (updateError) {
    console.error('Error updating progress:', updateError)
    apiLogger.error('Error updating progress', { error: updateError })
    return { error: updateError.message }
  }

  // Check and award achievements
  await supabase.rpc('check_and_award_achievements', { p_user_id: userId })

  try {
    const { error: incrementError } = await supabase.rpc('increment_completions', {
      p_challenge_id: challengeId,
    })

    if (incrementError) {
      throw incrementError
    }
  } catch (error) {
    apiLogger.error('Error incrementing completions', { error, challengeId })
  }

  revalidatePath(`/challenges/${progressId}`)
  revalidatePath('/challenges')

  return {
    success: true,
    isCompleted,
    isChallengeCompleted,
    newStreak,
  }
}

export async function pauseChallenge(progressId: string) {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase
    .from('user_challenge_progress')
    .update({
      status: 'paused',
      paused_at: new Date().toISOString(),
    })
    .eq('id', progressId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/challenges')
  return { success: true }
}

export async function resumeChallenge(progressId: string) {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase
    .from('user_challenge_progress')
    .update({
      status: 'active',
      paused_at: null,
    })
    .eq('id', progressId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/challenges')
  return { success: true }
}

export async function deleteChallenge(progressId: string) {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase.from('user_challenge_progress').delete().eq('id', progressId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/challenges')
  return { success: true }
}

// ============================================
// ADMIN MUTATIONS
// ============================================

export async function createChallengeTemplate(formData: FormData) {
  await checkPermission(PERMISSIONS.CHALLENGES_CREATE)
  const supabase = await getSupabaseServerClient()

  const challengeData = {
    title_bn: formData.get('title_bn') as string,
    title_ar: formData.get('title_ar') as string,
    title_en: formData.get('title_en') as string,
    description_bn: formData.get('description_bn') as string,
    description_ar: formData.get('description_ar') as string,
    description_en: formData.get('description_en') as string,
    arabic_text: formData.get('arabic_text') as string,
    transliteration_bn: formData.get('transliteration_bn') as string,
    translation_bn: formData.get('translation_bn') as string,
    translation_en: formData.get('translation_en') as string,
    daily_target_count: parseInt(formData.get('daily_target_count') as string) || 21,
    total_days: parseInt(formData.get('total_days') as string) || 21,
    recommended_time: (formData.get('recommended_time') as string) || null,
    recommended_prayer: (formData.get('recommended_prayer') as string) || null,
    reference: formData.get('reference') as string,
    fazilat_bn: formData.get('fazilat_bn') as string,
    fazilat_ar: formData.get('fazilat_ar') as string,
    fazilat_en: formData.get('fazilat_en') as string,
    difficulty_level: (formData.get('difficulty_level') as string) || 'medium',
    icon: formData.get('icon') as string,
    color: formData.get('color') as string,
    display_order: parseInt(formData.get('display_order') as string) || 0,
    is_featured: formData.get('is_featured') === 'true',
    is_active: formData.get('is_active') === 'true',
  }

  // Clean up null/empty values
  if (!challengeData.recommended_time || challengeData.recommended_time === 'anytime') {
    challengeData.recommended_time = null
  }
  if (!challengeData.recommended_prayer || challengeData.recommended_prayer === '') {
    challengeData.recommended_prayer = null
  }

  const { data, error } = await supabase
    .from('challenge_templates')
    .insert(challengeData)
    .select()
    .single()

  if (error) {
    apiLogger.error('Error creating challenge', { error, challengeData })
    return { error: error.message }
  }

  revalidatePath('/challenges')
  return { data }
}

export async function updateChallengeTemplate(id: string, formData: FormData) {
  await checkPermission(PERMISSIONS.CHALLENGES_UPDATE)
  const supabase = await getSupabaseServerClient()

  const challengeData = {
    title_bn: formData.get('title_bn') as string,
    title_ar: formData.get('title_ar') as string,
    title_en: formData.get('title_en') as string,
    description_bn: formData.get('description_bn') as string,
    description_ar: formData.get('description_ar') as string,
    description_en: formData.get('description_en') as string,
    arabic_text: formData.get('arabic_text') as string,
    transliteration_bn: formData.get('transliteration_bn') as string,
    translation_bn: formData.get('translation_bn') as string,
    translation_en: formData.get('translation_en') as string,
    daily_target_count: parseInt(formData.get('daily_target_count') as string) || 21,
    total_days: parseInt(formData.get('total_days') as string) || 21,
    recommended_time: (formData.get('recommended_time') as string) || null,
    recommended_prayer: (formData.get('recommended_prayer') as string) || null,
    reference: formData.get('reference') as string,
    fazilat_bn: formData.get('fazilat_bn') as string,
    fazilat_ar: formData.get('fazilat_ar') as string,
    fazilat_en: formData.get('fazilat_en') as string,
    difficulty_level: (formData.get('difficulty_level') as string) || 'medium',
    icon: formData.get('icon') as string,
    color: formData.get('color') as string,
    display_order: parseInt(formData.get('display_order') as string) || 0,
    is_featured: formData.get('is_featured') === 'true',
    is_active: formData.get('is_active') === 'true',
  }

  // Clean up null/empty values
  if (!challengeData.recommended_time || challengeData.recommended_time === 'anytime') {
    challengeData.recommended_time = null
  }
  if (!challengeData.recommended_prayer || challengeData.recommended_prayer === '') {
    challengeData.recommended_prayer = null
  }

  const { error } = await supabase.from('challenge_templates').update(challengeData).eq('id', id)

  if (error) {
    apiLogger.error('Error updating challenge', { error, id })
    return { error: error.message }
  }

  revalidatePath('/challenges')
  return { success: true }
}

export async function deleteChallengeTemplate(id: string) {
  await checkPermission(PERMISSIONS.CHALLENGES_DELETE)
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase.from('challenge_templates').delete().eq('id', id)

  if (error) {
    apiLogger.error('Error deleting challenge', { error, id })
    throw error
  }

  revalidatePath('/challenges')
}

// ============================================
// BOOKMARKS
// ============================================

export async function toggleChallengeBookmark(userId: string, challengeId: string) {
  const supabase = await getSupabaseServerClient()

  // Check if bookmark exists
  const { data: existing } = await supabase
    .from('user_challenge_bookmarks')
    .select('*')
    .eq('user_id', userId)
    .eq('challenge_id', challengeId)
    .single()

  if (existing) {
    // Remove bookmark
    const { error } = await supabase
      .from('user_challenge_bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)

    if (error) {
      return { error: error.message }
    }

    return { bookmarked: false }
  } else {
    // Add bookmark
    const { error } = await supabase
      .from('user_challenge_bookmarks')
      .insert({ user_id: userId, challenge_id: challengeId })

    if (error) {
      return { error: error.message }
    }

    return { bookmarked: true }
  }
}

export async function getUserBookmarkedChallenges(userId: string) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('user_challenge_bookmarks')
    .select(
      `
      *,
      challenge:challenge_templates(*)
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    apiLogger.error('Error fetching bookmarked challenges', { error, userId })
    return []
  }

  return data
}

export async function getRecentLogs(limit: number = 10) {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('user_challenge_daily_logs')
    .select(
      `
      *,
      user_progress:user_challenge_progress(
        challenge:challenge_templates(title_bn, icon)
      )
    `
    )
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    apiLogger.error('Error fetching recent logs', { error, limit })
    return []
  }
  return data
}
