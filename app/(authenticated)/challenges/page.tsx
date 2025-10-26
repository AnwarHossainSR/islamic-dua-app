import { getChallenges, getRecentLogs } from '@/lib/actions/challenges'
import ChallengesClient from './challenges-client'

export const dynamic = 'force-dynamic'

export default async function ChallengesPage() {
  // Initial load - get all challenges
  const challenges = await getChallenges()
  const recentLogs = await getRecentLogs(10)
  // @ts-ignore
  return <ChallengesClient initialChallenges={challenges} initialRecentLogs={recentLogs} />
}
