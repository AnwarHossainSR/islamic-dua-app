import { getActivityWithChallenges, getTopUsersForActivity } from '@/lib/actions/admin'
import { getUser } from '@/lib/actions/auth'
import { db } from '@/lib/db'
import { userChallengeDailyLogs, challengeActivityMapping } from '@/lib/db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import ActivityDetailsPageClient from './activity-details-client'

interface Props {
  params: Promise<{
    id: string
  }>
}

async function getUserDailyLogsForActivity(activityId: string, userId: string) {
  try {
    // Get challenges linked to this activity through mapping table
    const linkedChallenges = await db
      .select({ challenge_id: challengeActivityMapping.challenge_id })
      .from(challengeActivityMapping)
      .where(eq(challengeActivityMapping.activity_stat_id, activityId))
    
    if (linkedChallenges.length === 0) return []
    
    const challengeIds = linkedChallenges.map(c => c.challenge_id)
    
    // Get user's daily logs for these challenges
    const logs = await db
      .select()
      .from(userChallengeDailyLogs)
      .where(
        and(
          eq(userChallengeDailyLogs.user_id, userId),
          eq(userChallengeDailyLogs.is_completed, true),
          inArray(userChallengeDailyLogs.challenge_id, challengeIds)
        )
      )
      .orderBy(userChallengeDailyLogs.completion_date)
    
    return logs
  } catch (error) {
    console.error('Error fetching user daily logs:', error)
    return []
  }
}

export default async function ActivityDetailsPage({ params }: Props) {
  const resolvedParams = await params
  const user = await getUser()
  
  const [activity, topUsers, userDailyLogs] = await Promise.all([
    getActivityWithChallenges(resolvedParams.id),
    getTopUsersForActivity(resolvedParams.id, 10),
    user ? getUserDailyLogsForActivity(resolvedParams.id, user.id) : []
  ])

  if (!activity) {
    notFound()
  }

  return <ActivityDetailsPageClient activity={activity} topUsers={topUsers} userDailyLogs={userDailyLogs} />
}
