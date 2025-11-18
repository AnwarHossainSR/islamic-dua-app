import { cacheLife } from 'next/cache'
import { db } from '@/lib/db'
import { challengeTemplates, activityStats } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Cached challenge data for prerendering
export async function getCachedChallenges() {
  'use cache'
  cacheLife('hours')
  return await db.select().from(challengeTemplates).where(eq(challengeTemplates.is_active, true))
}

// Cached activity stats for prerendering
export async function getCachedActivities() {
  'use cache'
  cacheLife('minutes')
  return await db.select().from(activityStats)
}

// Static params for challenge pages
export async function generateChallengeStaticParams() {
  const challenges = await getCachedChallenges()
  return challenges.map((challenge) => ({
    id: challenge.id,
  }))
}

// Static params for activity pages
export async function generateActivityStaticParams() {
  const activities = await getCachedActivities()
  return activities.map((activity) => ({
    id: activity.id,
  }))
}