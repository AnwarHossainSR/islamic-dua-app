'use server'

import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { apiLogger } from '../logger'
import { isCurrentDay } from '../utils'
import { getUser } from './auth'
import { getChallengesWithProgress, searchChallenges, getChallengeById, getFeaturedChallenges } from '../db/queries/challenges'

// ============================================
// CHALLENGE QUERIES (Using Drizzle)
// ============================================

export async function getChallenges() {
  const user = await getUser()
  if (!user) return []

  try {
    const challenges = await getChallengesWithProgress(user.id)
    
    // Transform and calculate completion percentage
    const mergedData = challenges.map(challenge => {
      const completionPercentage = challenge.totalCompletedDays && challenge.totalDays
        ? Math.min(Math.round((challenge.totalCompletedDays / challenge.totalDays) * 100), 100)
        : 0

      return {
        id: challenge.id,
        title_bn: challenge.titleBn,
        title_ar: challenge.titleAr,
        description_bn: challenge.descriptionBn,
        icon: challenge.icon,
        color: challenge.color,
        difficulty_level: challenge.difficultyLevel,
        is_active: challenge.isActive,
        is_featured: challenge.isFeatured,
        total_participants: challenge.totalParticipants || 0,
        total_completions: challenge.totalCompletions || 0,
        total_days: challenge.totalDays,
        daily_target_count: challenge.dailyTargetCount,
        recommended_prayer: challenge.recommendedPrayer,
        user_status: challenge.userStatus || 'not_started',
        progress_id: challenge.progressId,
        completed_at: challenge.completedAt,
        total_completed_days: challenge.totalCompletedDays || 0,
        current_day: challenge.currentDay || 1,
        completion_count: challenge.completionCount || 0,
        last_completed_at: challenge.lastCompletedAt,
        completion_percentage: completionPercentage,
      }
    })

    // Sort based on completion status
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
      title_bn: challenge.titleBn,
      title_ar: challenge.titleAr,
      description_bn: challenge.descriptionBn,
      icon: challenge.icon,
      color: challenge.color,
      difficulty_level: challenge.difficultyLevel,
      is_active: challenge.isActive,
      is_featured: challenge.isFeatured,
      total_participants: challenge.totalParticipants || 0,
      total_completions: challenge.totalCompletions || 0,
      total_days: challenge.totalDays,
      daily_target_count: challenge.dailyTargetCount,
      recommended_prayer: challenge.recommendedPrayer,
      last_completed_at: null, // Will need to join with progress for this
    }))
  } catch (error) {
    apiLogger.error('Error searching challenges with Drizzle', { error })
    return []
  }
}

const getChallengeByIdUncached = async (id: string) => {
  try {
    const challenge = await getChallengeById(id)
    if (!challenge) return null

    return {
      id: challenge.id,
      title_bn: challenge.titleBn,
      title_ar: challenge.titleAr,
      description_bn: challenge.descriptionBn,
      // ... map other fields as needed
    }
  } catch (error) {
    apiLogger.error('Error fetching challenge by ID with Drizzle', { error, id })
    return null
  }
}

export const getChallengeByIdDrizzle = cache(getChallengeByIdUncached)