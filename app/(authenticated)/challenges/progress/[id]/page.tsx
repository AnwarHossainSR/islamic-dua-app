import { getUserChallengeProgress } from '@/lib/actions/challenges'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import UserChallengeProgressClient from './progress-client'

interface Props {
  params: {
    id: string // This is the user_challenge_progress.id
  }
}

export default async function UserChallengeProgressPage({ params }: Props) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/challenges/progress/' + params.id)
  }

  const progress = await getUserChallengeProgress(params.id)

  if (!progress) {
    notFound()
  }

  // Verify this progress belongs to the current user
  if (progress.user_id !== user.id) {
    notFound()
  }

  // Check if already completed today
  const today = new Date().toISOString().split('T')[0]
  const todayLog = progress.daily_logs?.find(
    (log: any) => log.completion_date === today && log.day_number === progress.current_day
  )

  return (
    <UserChallengeProgressClient progress={progress} todayLog={todayLog || null} userId={user.id} />
  )
}
