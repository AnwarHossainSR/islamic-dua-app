import { eq, and, desc, asc, ilike, or, sql } from 'drizzle-orm'
import { db } from '../index'
import { challengeTemplates, userChallengeProgress, userChallengeDailyLogs } from '../schema'

export async function getChallengesWithProgress(userId: string) {
  const challenges = await db
    .select({
      id: challengeTemplates.id,
      titleBn: challengeTemplates.titleBn,
      titleAr: challengeTemplates.titleAr,
      descriptionBn: challengeTemplates.descriptionBn,
      icon: challengeTemplates.icon,
      color: challengeTemplates.color,
      difficultyLevel: challengeTemplates.difficultyLevel,
      isActive: challengeTemplates.isActive,
      isFeatured: challengeTemplates.isFeatured,
      totalParticipants: challengeTemplates.totalParticipants,
      totalCompletions: challengeTemplates.totalCompletions,
      totalDays: challengeTemplates.totalDays,
      dailyTargetCount: challengeTemplates.dailyTargetCount,
      recommendedPrayer: challengeTemplates.recommendedPrayer,
      // Progress fields
      userStatus: userChallengeProgress.status,
      progressId: userChallengeProgress.id,
      completedAt: userChallengeProgress.completedAt,
      totalCompletedDays: userChallengeProgress.totalCompletedDays,
      currentDay: userChallengeProgress.currentDay,
      completionCount: userChallengeProgress.completionCount,
      lastCompletedAt: userChallengeProgress.lastCompletedAt,
    })
    .from(challengeTemplates)
    .leftJoin(
      userChallengeProgress,
      and(
        eq(userChallengeProgress.challengeId, challengeTemplates.id),
        eq(userChallengeProgress.userId, userId)
      )
    )
    .where(eq(challengeTemplates.isActive, true))
    .orderBy(asc(challengeTemplates.displayOrder))

  // Convert dates to strings to avoid serialization issues
  return challenges.map(challenge => ({
    ...challenge,
    completedAt: challenge.completedAt ? challenge.completedAt.toISOString() : null,
    lastCompletedAt: challenge.lastCompletedAt ? challenge.lastCompletedAt.toISOString() : null
  }))
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
  const conditions = [eq(challengeTemplates.isActive, true)]

  if (searchQuery?.trim()) {
    conditions.push(
      or(
        ilike(challengeTemplates.titleBn, `%${searchQuery}%`),
        ilike(challengeTemplates.titleAr, `%${searchQuery}%`),
        ilike(challengeTemplates.descriptionBn, `%${searchQuery}%`)
      )!
    )
  }

  if (difficulty && difficulty !== 'all') {
    conditions.push(eq(challengeTemplates.difficultyLevel, difficulty as any))
  }

  if (status === 'featured') {
    conditions.push(eq(challengeTemplates.isFeatured, true))
  } else if (status === 'inactive') {
    conditions[0] = eq(challengeTemplates.isActive, false)
  }

  return await db
    .select()
    .from(challengeTemplates)
    .where(and(...conditions))
    .orderBy(asc(challengeTemplates.displayOrder))
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
    .where(and(eq(challengeTemplates.isActive, true), eq(challengeTemplates.isFeatured, true)))
    .orderBy(asc(challengeTemplates.displayOrder))
}