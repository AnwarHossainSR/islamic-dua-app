import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getChallengeById, startChallenge } from '@/lib/actions/challenges'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ChallengePreviewClient from './ChallengePreviewClient'

interface Props {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    preview?: string
  }>
}

export default async function ChallengePreviewPage({ params, searchParams }: Props) {
  const { id } = await params
  const { preview } = await searchParams
  const isPreviewMode = preview === 'true'
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const challenge = await getChallengeById(id)

  if (!challenge) {
    notFound()
  }

  // Check if user already has an active challenge (only if logged in and not preview mode)
  let hasActiveChallenge = false
  let activeProgressId = null

  if (user && !isPreviewMode) {
    const { data: existing } = await supabase
      .from('user_challenge_progress')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('challenge_id', challenge.id)
      .in('status', ['active', 'paused'])
      .single()

    if (existing) {
      hasActiveChallenge = true
      activeProgressId = existing.id
    }
  }

  // Handle start challenge action
  async function handleStartChallenge() {
    'use server'

    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login?redirect=/challenges/' + id + '/preview')
    }

    // Use the server action
    const result = await startChallenge(user.id, id)

    if (result.error) {
      console.error('Error starting challenge:', result.error)
      return
    }

    if (result.data) {
      // Redirect to the user's progress page
      redirect(`/challenges/progress/${result.data.id}`)
    }
  }

  return (
    <>
      <ChallengePreviewClient challenge={challenge} isPreviewMode={isPreviewMode} />

      {/* Fixed Bottom Action Bar (only show if not preview mode) */}
      {!isPreviewMode && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto max-w-4xl p-4">
            {user ? (
              <Card className="border-2">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-semibold">
                      {hasActiveChallenge ? 'Continue Your Challenge' : 'Ready to begin?'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {challenge.total_days} days • {challenge.daily_target_count}x per day
                    </p>
                  </div>
                  {hasActiveChallenge ? (
                    <Button size="lg" asChild>
                      <a href={`/challenges/progress/${activeProgressId}`}>Continue Challenge</a>
                    </Button>
                  ) : (
                    <form action={handleStartChallenge}>
                      <Button size="lg" type="submit">
                        Start Challenge
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-blue-500">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-semibold">Login to Start Challenge</p>
                    <p className="text-sm text-muted-foreground">
                      Track your progress and earn achievements
                    </p>
                  </div>
                  <Button size="lg" asChild>
                    <a href={`/login?redirect=/challenges/${id}/preview`}>Login</a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  if (!id) {
    return {
      title: 'Challenge Not Found',
    }
  }
  const challenge = await getChallengeById(id)

  if (!challenge) {
    return {
      title: 'Challenge Not Found',
    }
  }

  return {
    title: `${challenge.title_bn} - Heaven Rose Islamic`,
    description: challenge.description_bn,
  }
}
