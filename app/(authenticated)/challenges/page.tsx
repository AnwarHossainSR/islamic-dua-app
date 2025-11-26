import {
  getChallenges,
  getTodayCompletionStats,
  getTodayRemainingChallenges,
} from '@/lib/actions/challenges'
import { getUserRecentLogs } from '@/lib/actions/user-activities'
import ChallengesClient from './challenges-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ChallengesPage() {
  // Initial load - get user's challenges, recent logs, and today's stats
  const [challenges, recentLogs, todayRemaining, todayStats] = await Promise.all([
    getChallenges(),
    getUserRecentLogs(10),
    getTodayRemainingChallenges(),
    getTodayCompletionStats(),
  ])
  return (
    <ChallengesClient
      initialChallenges={challenges}
      initialRecentLogs={recentLogs}
      todayRemaining={todayRemaining}
      todayStats={todayStats}
    />
  )
}
