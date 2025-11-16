import { unstable_cache } from 'next/cache'
import { db } from '@/lib/db'
import { challengeTemplates, activityStats } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Cached challenge data for prerendering
export const getCachedChallenges = unstable_cache(
  async () => {
    return await db.select().from(challengeTemplates).where(eq(challengeTemplates.is_active, true))
  },
  ['challenges'],
  { revalidate: 3600 } // 1 hour
)

// Cached activity stats for prerendering
export const getCachedActivities = unstable_cache(
  async () => {
    return await db.select().from(activityStats)
  },
  ['activities'],
  { revalidate: 1800 } // 30 minutes
)

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