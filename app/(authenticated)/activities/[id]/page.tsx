import { getActivityWithChallenges, getTopUsersForActivity } from '@/lib/actions/admin'
import { notFound } from 'next/navigation'
import ActivityDetailsPageClient from './activity-details-client'

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function ActivityDetailsPage({ params }: Props) {
  const resolvedParams = await params
  const activity = await getActivityWithChallenges(resolvedParams.id)
  const topUsers = await getTopUsersForActivity(resolvedParams.id, 10)

  if (!activity) {
    notFound()
  }

  return <ActivityDetailsPageClient activity={activity} topUsers={topUsers} />
}
