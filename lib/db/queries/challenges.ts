import { eq, and, desc, asc, ilike, or, sql } from 'drizzle-orm'
import { db } from '../index'
import { challengeTemplates, userChallengeProgress, userChallengeDailyLogs } from '../schema'

export async function getChallengesWithProgress(userId: string) {
  const challenges = await db
    .select({
      id: challengeTemplates.id,
      title_bn: challengeTemplates.title_bn,
      title_ar: challengeTemplates.title_ar,
      description_bn: challengeTemplates.description_bn,
      icon: challengeTemplates.icon,
      color: challengeTemplates.color,
      difficulty_level: challengeTemplates.difficulty_level,
      is_active: challengeTemplates.is_active,
      is_featured: challengeTemplates.is_featured,
      total_participants: challengeTemplates.total_participants,
      total_completions: challengeTemplates.total_completions,
      total_days: challengeTemplates.total_days,
      daily_target_count: challengeTemplates.daily_target_count,
      recommended_prayer: challengeTemplates.recommended_prayer,
      // Progress fields
      user_status: userChallengeProgress.status,
      progress_id: userChallengeProgress.id,
      completed_at: userChallengeProgress.completed_at,
      total_completed_days: userChallengeProgress.total_completed_days,
      current_day: userChallengeProgress.current_day,
      last_completed_at: userChallengeProgress.last_completed_at,
    })
    .from(challengeTemplates)
    .leftJoin(
      userChallengeProgress,
      and(
        eq(userChallengeProgress.challenge_id, challengeTemplates.id),
        eq(userChallengeProgress.user_id, userId)
      )
    )
    .where(eq(challengeTemplates.is_active, true))
    .orderBy(asc(challengeTemplates.display_order))

  // Return challenges with Unix timestamps (already numbers)
  return challenges
}

export async function searchChallenges({
  searchQuery,
  difficulty,
  status,
}: {
  searchQuery?: string
  difficulty?: string
  status?: string
}) {
  const conditions = [eq(challengeTemplates.is_active, true)]

  if (searchQuery?.trim()) {
    conditions.push(
      or(
        ilike(challengeTemplates.title_bn, `%${searchQuery}%`),
        ilike(challengeTemplates.title_ar, `%${searchQuery}%`),
        ilike(challengeTemplates.description_bn, `%${searchQuery}%`)
      )!
    )
  }

  if (difficulty && difficulty !== 'all') {
    conditions.push(eq(challengeTemplates.difficulty_level, difficulty as any))
  }

  if (status === 'featured') {
    conditions.push(eq(challengeTemplates.is_featured, true))
  } else if (status === 'inactive') {
    conditions[0] = eq(challengeTemplates.is_active, false)
  }

  return await db
    .select()
    .from(challengeTemplates)
    .where(and(...conditions))
    .orderBy(asc(challengeTemplates.display_order))
}

export async function getChallengeById(id: string) {
  const result = await db
    .select()
    .from(challengeTemplates)
    .where(eq(challengeTemplates.id, id))
    .limit(1)

  return result[0] || null
}

export async function getFeaturedChallenges() {
  return await db
    .select()
    .from(challengeTemplates)
    .where(and(eq(challengeTemplates.is_active, true), eq(challengeTemplates.is_featured, true)))
    .orderBy(asc(challengeTemplates.display_order))
}