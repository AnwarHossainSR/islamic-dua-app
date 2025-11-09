'use server'

import { eq, and, desc, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { db } from '../db'
import { challengeTemplates, userChallengeProgress, userChallengeDailyLogs } from '../db/schema'
import { PERMISSIONS } from '../permissions'
import { Challenge } from '../types/challenges'
import { apiLogger } from '../logger'
import { isCurrentDay } from '../utils'
import { checkPermission, getUser } from './auth'
import { getChallengesWithProgress, searchChallenges, getChallengeById as getChallengeByIdQuery, getFeaturedChallenges as getFeaturedChallengesQuery } from '../db/queries/challenges'

// ============================================
// CHALLENGE QUERIES
// ============================================

export async function getChallenges() {
  const user = await getUser()
  if (!user) return []

  try {
    const challenges = await getChallengesWithProgress(user.id)
    
    const mergedData = challenges.map(challenge => {
      const completionPercentage = challenge.total_completed_days && challenge.total_days
        ? Math.min(Math.round((challenge.total_completed_days / challenge.total_days) * 100), 100)
        : 0

      return {
        id: challenge.id,
        title_bn: challenge.title_bn,
        title_ar: challenge.title_ar ?? undefined,
        description_bn: challenge.description_bn ?? undefined,
        icon: challenge.icon ?? undefined,
        color: challenge.color ?? undefined,
        difficulty_level: (challenge.difficulty_level ?? 'medium') as 'easy' | 'medium' | 'hard',
        is_active: challenge.is_active ?? true,
        is_featured: challenge.is_featured ?? false,
        total_participants: challenge.total_participants || 0,
        total_completions: challenge.total_completions || 0,
        total_days: challenge.total_days ?? 21,
        daily_target_count: challenge.daily_target_count ?? 21,
        recommended_prayer: challenge.recommended_prayer ?? undefined,
        user_status: challenge.user_status || 'not_started',
        progress_id: challenge.progress_id ?? undefined,
        completed_at: challenge.completed_at ?? undefined,
        total_completed_days: challenge.total_completed_days || 0,
        current_day: challenge.current_day || 1,
        last_completed_at: challenge.last_completed_at ?? undefined,
        completion_percentage: completionPercentage,
      } as Challenge
    })

    mergedData.sort((a: any, b: any) => {
      const aIsCurrentDay = isCurrentDay(a.last_completed_at)
      const bIsCurrentDay = isCurrentDay(b.last_completed_at)

      if (!aIsCurrentDay && bIsCurrentDay) return -1
      if (aIsCurrentDay && !bIsCurrentDay) return 1

      if (!a.last_completed_at && !b.last_completed_at) return 0
      if (!a.last_completed_at) return 1
      if (!b.last_completed_at) return -1
      return new Date(b.last_completed_at).getTime() - new Date(a.last_completed_at).getTime()
    })

    return mergedData
  } catch (error) {
    apiLogger.error('Error fetching challenges with Drizzle', { error })
    return []
  }
}

export async function searchAndFilterChallenges({
  searchQuery = '',
  difficulty = 'all',
  status = 'all',
}: {
  searchQuery?: string
  difficulty?: string
  status?: string
}) {
  try {
    const challenges = await searchChallenges({ searchQuery, difficulty, status })
    
    return challenges.map(challenge => ({
      id: challenge.id,
      title_bn: challenge.title_bn,
      title_ar: challenge.title_ar ?? undefined,
      description_bn: challenge.description_bn ?? undefined,
      icon: challenge.icon ?? undefined,
      color: challenge.color ?? undefined,
      difficulty_level: (challenge.difficulty_level ?? 'medium') as 'easy' | 'medium' | 'hard',
      is_active: challenge.is_active ?? true,
      is_featured: challenge.is_featured ?? false,
      total_participants: challenge.total_participants || 0,
      total_completions: challenge.total_completions || 0,
      total_days: challenge.total_days ?? 21,
      daily_target_count: challenge.daily_target_count ?? 21,
      recommended_prayer: challenge.recommended_prayer ?? undefined,
      last_completed_at: undefined,
      user_status: 'not_started' as const,
      progress_id: undefined,
      completed_at: undefined,
      total_completed_days: 0,
      current_day: 1,
      completion_percentage: 0,
    } as Challenge))
  } catch (error) {
    apiLogger.error('Error searching challenges with Drizzle', { error })
    return []
  }
}

export async function getFeaturedChallenges() {
  try {
    return await getFeaturedChallengesQuery()
  } catch (error) {
    apiLogger.error('Error fetching featured challenges with Drizzle', { error })
    return []
  }
}

const getChallengeByIdUncached = async (id: string) => {
  try {
    return await getChallengeByIdQuery(id)
  } catch (error) {
    apiLogger.error('Error fetching challenge', { error, id })
    return null
  }
}

export const getChallengeById = cache(getChallengeByIdUncached)

// ============================================
// USER PROGRESS QUERIES
// ============================================

export async function getUserActiveChallenges(userId: string) {
  try {
    return await db
      .select()
      .from(userChallengeProgress)
      .leftJoin(challengeTemplates, eq(userChallengeProgress.challenge_id, challengeTemplates.id))
      .where(and(
        eq(userChallengeProgress.user_id, userId),
        eq(userChallengeProgress.status, 'active')
      ))
      .orderBy(desc(userChallengeProgress.started_at))
  } catch (error) {
    apiLogger.error('Error fetching user active challenges', { error, userId })
    return []
  }
}

export async function getUserCompletedChallenges(userId: string) {
  try {
    return await db
      .select()
      .from(userChallengeProgress)
      .leftJoin(challengeTemplates, eq(userChallengeProgress.challenge_id, challengeTemplates.id))
      .where(and(
        eq(userChallengeProgress.user_id, userId),
        eq(userChallengeProgress.status, 'completed')
      ))
      .orderBy(desc(userChallengeProgress.completed_at))
  } catch (error) {
    apiLogger.error('Error fetching user completed challenges', { error, userId })
    return []
  }
}

export async function getUserChallengeProgress(progressId: string) {
  try {
    const [progress] = await db
      .select()
      .from(userChallengeProgress)
      .leftJoin(challengeTemplates, eq(userChallengeProgress.challenge_id, challengeTemplates.id))
      .where(eq(userChallengeProgress.id, progressId))
      .limit(1)

    if (!progress) return null

    // Get daily logs separately
    const dailyLogs = await db
      .select()
      .from(userChallengeDailyLogs)
      .where(eq(userChallengeDailyLogs.user_progress_id, progressId))
      .orderBy(desc(userChallengeDailyLogs.day_number))

    // Return in expected format
    return {
      ...progress.user_challenge_progress,
      challenge: progress.challenge_templates,
      daily_logs: dailyLogs
    }
  } catch (error) {
    apiLogger.error('Error fetching challenge progress', { error, progressId })
    return null
  }
}

export async function getUserChallengeStats(userId: string) {
  try {
    const progressData = await db
      .select({
        status: userChallengeProgress.status,
        current_streak: userChallengeProgress.current_streak,
        longest_streak: userChallengeProgress.longest_streak,
        total_completed_days: userChallengeProgress.total_completed_days
      })
      .from(userChallengeProgress)
      .where(eq(userChallengeProgress.user_id, userId))

    const totalCompleted = progressData?.filter(p => p.status === 'completed').length || 0
    const totalActive = progressData?.filter(p => p.status === 'active').length || 0
    const longestStreak = Math.max(...(progressData?.map(p => p.longest_streak || 0) || [0]))
    const totalDaysCompleted = progressData?.reduce((sum, p) => sum + (p.total_completed_days || 0), 0) || 0

    return {
      totalCompleted,
      totalActive,
      longestStreak,
      totalDaysCompleted,
      achievements: [],
    }
  } catch (error) {
    apiLogger.error('Error fetching user challenge stats', { error, userId })
    return {
      totalCompleted: 0,
      totalActive: 0,
      longestStreak: 0,
      totalDaysCompleted: 0,
      achievements: [],
    }
  }
}

// ============================================
// CHALLENGE MUTATIONS
// ============================================

export async function startChallenge(userId: string, challengeId: string) {
  try {
    // Check if user already has active challenge
    const existing = await db
      .select()
      .from(userChallengeProgress)
      .where(and(
        eq(userChallengeProgress.user_id, userId),
        eq(userChallengeProgress.challenge_id, challengeId),
        eq(userChallengeProgress.status, 'active')
      ))
      .limit(1)

    if (existing.length > 0) {
      return { error: 'You already have an active challenge for this' }
    }

    // Create new progress record
    const [data] = await db
      .insert(userChallengeProgress)
      .values({
        user_id: userId,
        challenge_id: challengeId,
        current_day: 1,
        status: 'active',
        current_streak: 0,
        started_at: new Date(),
      })
      .returning()

    // Increment participants
    await db
      .update(challengeTemplates)
      .set({ total_participants: sql`${challengeTemplates.total_participants} + 1` })
      .where(eq(challengeTemplates.id, challengeId))

    revalidatePath('/challenges')
    return { data }
  } catch (error) {
    apiLogger.error('Error starting challenge', { error, userId, challengeId })
    return { error: 'Failed to start challenge' }
  }
}

export async function restartChallenge(challenge: Challenge) {
  try {
    await db
      .update(userChallengeProgress)
      .set({
        current_day: 1,
        status: 'active',
        current_streak: 0,
        longest_streak: 0,
        total_completed_days: 0,
        missed_days: 0,
        started_at: new Date(),
        completed_at: null,
        paused_at: null,
        last_completed_at: null,
      })
      .where(eq(userChallengeProgress.id, challenge.progress_id!))

    // Clear existing daily logs
    await db
      .delete(userChallengeDailyLogs)
      .where(eq(userChallengeDailyLogs.user_progress_id, challenge.progress_id!))

    // Increment completions
    await db
      .update(challengeTemplates)
      .set({ total_completions: sql`${challengeTemplates.total_completions} + 1` })
      .where(eq(challengeTemplates.id, challenge.id))

    revalidatePath('/challenges')
    return { success: true }
  } catch (error) {
    apiLogger.error('Error restarting challenge', { error, progressId: challenge.progress_id })
    return { error: 'Failed to restart challenge' }
  }
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
  try {
    const isCompleted = countCompleted >= targetCount
    const now = new Date()

    // Check if daily log exists
    const existingLog = await db
      .select({ id: userChallengeDailyLogs.id })
      .from(userChallengeDailyLogs)
      .where(and(
        eq(userChallengeDailyLogs.user_progress_id, progressId),
        eq(userChallengeDailyLogs.day_number, dayNumber)
      ))
      .limit(1)

    if (existingLog.length > 0) {
      // Update existing log
      await db
        .update(userChallengeDailyLogs)
        .set({
          count_completed: countCompleted,
          target_count: targetCount,
          is_completed: isCompleted,
          completed_at: now,
          notes,
          mood,
        })
        .where(eq(userChallengeDailyLogs.id, existingLog[0].id))
    } else {
      // Insert new daily log
      await db.insert(userChallengeDailyLogs).values({
        user_progress_id: progressId,
        user_id: userId,
        challenge_id: challengeId,
        day_number: dayNumber,
        completion_date: now.toISOString().split('T')[0],
        count_completed: countCompleted,
        target_count: targetCount,
        is_completed: isCompleted,
        completed_at: now,
        notes,
        mood,
      })
    }

    // Get current progress
    const [progress] = await db
      .select()
      .from(userChallengeProgress)
      .leftJoin(challengeTemplates, eq(userChallengeProgress.challenge_id, challengeTemplates.id))
      .where(eq(userChallengeProgress.id, progressId))
      .limit(1)

    if (!progress) {
      return { error: 'Progress not found' }
    }

    // Update progress
    const newStreak = isCompleted ? (progress.user_challenge_progress.current_streak || 0) + 1 : 0
    const newLongestStreak = Math.max(progress.user_challenge_progress.longest_streak || 0, newStreak)
    const newTotalCompleted = (progress.user_challenge_progress.total_completed_days || 0) + (isCompleted ? 1 : 0)
    const newMissedDays = (progress.user_challenge_progress.missed_days || 0) + (isCompleted ? 0 : 1)
    const newCurrentDay = dayNumber + 1

    const isChallengeCompleted = newCurrentDay > (progress.challenge_templates?.total_days || 21) &&
      newTotalCompleted >= (progress.challenge_templates?.total_days || 21)

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

    await db
      .update(userChallengeProgress)
      .set(updateData)
      .where(eq(userChallengeProgress.id, progressId))

    // Increment completions
    await db
      .update(challengeTemplates)
      .set({ total_completions: sql`${challengeTemplates.total_completions} + 1` })
      .where(eq(challengeTemplates.id, challengeId))

    revalidatePath(`/challenges/${progressId}`)
    revalidatePath('/challenges')

    return {
      success: true,
      isCompleted,
      isChallengeCompleted,
      newStreak,
    }
  } catch (error) {
    apiLogger.error('Error completing daily challenge', { error })
    return { error: 'Failed to complete daily challenge' }
  }
}

export async function pauseChallenge(progressId: string) {
  try {
    await db
      .update(userChallengeProgress)
      .set({
        status: 'paused',
        paused_at: new Date(),
      })
      .where(eq(userChallengeProgress.id, progressId))

    revalidatePath('/challenges')
    return { success: true }
  } catch (error) {
    return { error: 'Failed to pause challenge' }
  }
}

export async function resumeChallenge(progressId: string) {
  try {
    await db
      .update(userChallengeProgress)
      .set({
        status: 'active',
        paused_at: null,
      })
      .where(eq(userChallengeProgress.id, progressId))

    revalidatePath('/challenges')
    return { success: true }
  } catch (error) {
    return { error: 'Failed to resume challenge' }
  }
}

export async function deleteChallenge(progressId: string) {
  try {
    await db.delete(userChallengeProgress).where(eq(userChallengeProgress.id, progressId))

    revalidatePath('/challenges')
    return { success: true }
  } catch (error) {
    return { error: 'Failed to delete challenge' }
  }
}

// ============================================
// ADMIN MUTATIONS
// ============================================

export async function createChallengeTemplate(formData: FormData) {
  await checkPermission(PERMISSIONS.CHALLENGES_CREATE)

  const challengeData = {
    title_bn: formData.get('title_bn') as string,
    title_ar: formData.get('title_ar') as string || null,
    title_en: formData.get('title_en') as string || null,
    description_bn: formData.get('description_bn') as string || null,
    description_ar: formData.get('description_ar') as string || null,
    description_en: formData.get('description_en') as string || null,
    arabic_text: formData.get('arabic_text') as string,
    transliteration_bn: formData.get('transliteration_bn') as string || null,
    translation_bn: formData.get('translation_bn') as string,
    translation_en: formData.get('translation_en') as string || null,
    daily_target_count: parseInt(formData.get('daily_target_count') as string) || 21,
    total_days: parseInt(formData.get('total_days') as string) || 21,
    recommended_time: (formData.get('recommended_time') as string) || null,
    recommended_prayer: (formData.get('recommended_prayer') as string) || null,
    reference: formData.get('reference') as string || null,
    fazilat_bn: formData.get('fazilat_bn') as string || null,
    fazilat_ar: formData.get('fazilat_ar') as string || null,
    fazilat_en: formData.get('fazilat_en') as string || null,
    difficulty_level: (formData.get('difficulty_level') as string) || 'medium',
    icon: formData.get('icon') as string || null,
    color: formData.get('color') as string || null,
    display_order: parseInt(formData.get('display_order') as string) || 0,
    is_featured: formData.get('is_featured') === 'true',
    is_active: formData.get('is_active') === 'true',
  }

  if (challengeData.recommended_time === 'anytime') {
    challengeData.recommended_time = null
  }

  try {
    const [data] = await db
      .insert(challengeTemplates)
      .values(challengeData)
      .returning()

    revalidatePath('/challenges')
    return { data }
  } catch (error) {
    apiLogger.error('Error creating challenge', { error, challengeData })
    return { error: 'Failed to create challenge' }
  }
}

export async function updateChallengeTemplate(id: string, formData: FormData) {
  await checkPermission(PERMISSIONS.CHALLENGES_UPDATE)

  const challengeData = {
    title_bn: formData.get('title_bn') as string,
    title_ar: formData.get('title_ar') as string || null,
    title_en: formData.get('title_en') as string || null,
    description_bn: formData.get('description_bn') as string || null,
    description_ar: formData.get('description_ar') as string || null,
    description_en: formData.get('description_en') as string || null,
    arabic_text: formData.get('arabic_text') as string,
    transliteration_bn: formData.get('transliteration_bn') as string || null,
    translation_bn: formData.get('translation_bn') as string,
    translation_en: formData.get('translation_en') as string || null,
    daily_target_count: parseInt(formData.get('daily_target_count') as string) || 21,
    total_days: parseInt(formData.get('total_days') as string) || 21,
    recommended_time: (formData.get('recommended_time') as string) || null,
    recommended_prayer: (formData.get('recommended_prayer') as string) || null,
    reference: formData.get('reference') as string || null,
    fazilat_bn: formData.get('fazilat_bn') as string || null,
    fazilat_ar: formData.get('fazilat_ar') as string || null,
    fazilat_en: formData.get('fazilat_en') as string || null,
    difficulty_level: (formData.get('difficulty_level') as string) || 'medium',
    icon: formData.get('icon') as string || null,
    color: formData.get('color') as string || null,
    display_order: parseInt(formData.get('display_order') as string) || 0,
    is_featured: formData.get('is_featured') === 'true',
    is_active: formData.get('is_active') === 'true',
  }

  if (challengeData.recommended_time === 'anytime') {
    challengeData.recommended_time = null
  }

  try {
    await db
      .update(challengeTemplates)
      .set(challengeData)
      .where(eq(challengeTemplates.id, id))

    revalidatePath('/challenges')
    return { success: true }
  } catch (error) {
    apiLogger.error('Error updating challenge', { error, id })
    return { error: 'Failed to update challenge' }
  }
}

export async function deleteChallengeTemplate(id: string) {
  await checkPermission(PERMISSIONS.CHALLENGES_DELETE)

  try {
    await db.delete(challengeTemplates).where(eq(challengeTemplates.id, id))
    revalidatePath('/challenges')
  } catch (error) {
    apiLogger.error('Error deleting challenge', { error, id })
    throw error
  }
}

export async function getRecentLogs(limit: number = 10) {
  const user = await getUser()
  if (!user) return []
  
  try {
    return await db
      .select()
      .from(userChallengeDailyLogs)
      .leftJoin(userChallengeProgress, eq(userChallengeDailyLogs.user_progress_id, userChallengeProgress.id))
      .leftJoin(challengeTemplates, eq(userChallengeProgress.challenge_id, challengeTemplates.id))
      .where(eq(userChallengeDailyLogs.user_id, user.id))
      .orderBy(desc(userChallengeDailyLogs.created_at))
      .limit(limit)
  } catch (error) {
    apiLogger.error('Error fetching recent logs', { error, limit })
    return []
  }
}

export async function getTodayCompletedChallenges() {
  const user = await getUser()
  if (!user) return []
  
  const today = new Date().toISOString().split('T')[0]
  
  try {
    return await db
      .select({
        id: userChallengeDailyLogs.id,
        challenge_title: challengeTemplates.title_bn,
        challenge_icon: challengeTemplates.icon,
        count_completed: userChallengeDailyLogs.count_completed,
        target_count: userChallengeDailyLogs.target_count,
        completed_at: userChallengeDailyLogs.completed_at,
        is_completed: userChallengeDailyLogs.is_completed
      })
      .from(userChallengeDailyLogs)
      .leftJoin(userChallengeProgress, eq(userChallengeDailyLogs.user_progress_id, userChallengeProgress.id))
      .leftJoin(challengeTemplates, eq(userChallengeProgress.challenge_id, challengeTemplates.id))
      .where(and(
        eq(userChallengeDailyLogs.user_id, user.id),
        eq(userChallengeDailyLogs.completion_date, today),
        eq(userChallengeDailyLogs.is_completed, true)
      ))
      .orderBy(desc(userChallengeDailyLogs.completed_at))
  } catch (error) {
    apiLogger.error('Error fetching today completed challenges', { error })
    return []
  }
}

export async function getTodayRemainingChallenges() {
  const user = await getUser()
  if (!user) return []
  
  const today = new Date().toISOString().split('T')[0]
  
  try {
    // Get active challenges that haven't been completed today
    const activeChallenges = await db
      .select({
        challenge_id: userChallengeProgress.challenge_id,
        title_bn: challengeTemplates.title_bn,
        icon: challengeTemplates.icon
      })
      .from(userChallengeProgress)
      .leftJoin(challengeTemplates, eq(userChallengeProgress.challenge_id, challengeTemplates.id))
      .where(and(
        eq(userChallengeProgress.user_id, user.id),
        eq(userChallengeProgress.status, 'active')
      ))

    // Get today's completed challenge IDs
    const completedToday = await db
      .select({ challenge_id: userChallengeDailyLogs.challenge_id })
      .from(userChallengeDailyLogs)
      .leftJoin(userChallengeProgress, eq(userChallengeDailyLogs.user_progress_id, userChallengeProgress.id))
      .where(and(
        eq(userChallengeDailyLogs.user_id, user.id),
        eq(userChallengeDailyLogs.completion_date, today),
        eq(userChallengeDailyLogs.is_completed, true)
      ))

    const completedIds = new Set(completedToday.map(c => c.challenge_id))
    return activeChallenges.filter(c => !completedIds.has(c.challenge_id))
  } catch (error) {
    apiLogger.error('Error fetching today remaining challenges', { error })
    return []
  }
}

export async function getTodayCompletionStats() {
  const user = await getUser()
  if (!user) return { completed: 0, total: 0, percentage: 0 }
  
  try {
    const [completed, remaining] = await Promise.all([
      getTodayCompletedChallenges(),
      getTodayRemainingChallenges()
    ])
    
    const total = completed.length + remaining.length
    const percentage = total > 0 ? Math.round((completed.length / total) * 100) : 0
    
    return {
      completed: completed.length,
      total,
      percentage
    }
  } catch (error) {
    apiLogger.error('Error fetching today completion stats', { error })
    return { completed: 0, total: 0, percentage: 0 }
  }
}