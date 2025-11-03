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
      const completionPercentage = challenge.total_completed_days && challenge.total_days
        ? Math.min(Math.round((challenge.total_completed_days / challenge.total_days) * 100), 100)
        : 0

      return {
        id: challenge.id,
        title_bn: challenge.title_bn,
        title_ar: challenge.title_ar,
        description_bn: challenge.description_bn,
        icon: challenge.icon,
        color: challenge.color,
        difficulty_level: challenge.difficulty_level,
        is_active: challenge.is_active,
        is_featured: challenge.is_featured,
        total_participants: challenge.total_participants || 0,
        total_completions: challenge.total_completions || 0,
        total_days: challenge.total_days,
        daily_target_count: challenge.daily_target_count,
        recommended_prayer: challenge.recommended_prayer,
        user_status: challenge.user_status || 'not_started',
        progress_id: challenge.progress_id,
        completed_at: challenge.completed_at,
        total_completed_days: challenge.total_completed_days || 0,
        current_day: challenge.current_day || 1,
        last_completed_at: challenge.last_completed_at,
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
      title_bn: challenge.title_bn,
      title_ar: challenge.title_ar,
      description_bn: challenge.description_bn,
      icon: challenge.icon,
      color: challenge.color,
      difficulty_level: challenge.difficulty_level,
      is_active: challenge.is_active,
      is_featured: challenge.is_featured,
      total_participants: challenge.total_participants || 0,
      total_completions: challenge.total_completions || 0,
      total_days: challenge.total_days,
      daily_target_count: challenge.daily_target_count,
      recommended_prayer: challenge.recommended_prayer,
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
      title_bn: challenge.title_bn,
      title_ar: challenge.title_ar,
      description_bn: challenge.description_bn,
      // ... map other fields as needed
    }
  } catch (error) {
    apiLogger.error('Error fetching challenge by ID with Drizzle', { error, id })
    return null
  }
}

export const getChallengeByIdDrizzle = cache(getChallengeByIdUncached)