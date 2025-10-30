import { getChallenges } from '@/lib/actions/challenges'
import { getUserRecentLogs } from '@/lib/actions/user-activities'
import ChallengesClient from './challenges-client'

export const dynamic = 'force-dynamic'

export default async function ChallengesPage() {
  // Initial load - get user's challenges and their recent logs
  const [challenges, recentLogs] = await Promise.all([
    getChallenges(),
    getUserRecentLogs(10)
  ])
  // @ts-ignore
  return <ChallengesClient initialChallenges={challenges} initialRecentLogs={recentLogs} />
}
