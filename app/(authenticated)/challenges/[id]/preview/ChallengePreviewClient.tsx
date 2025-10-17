'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, BookOpen, Calendar, Clock, Star, Target, Trophy, Users } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface ChallengePreviewClientProps {
  challenge: any
  isPreviewMode?: boolean
}

export default function ChallengePreviewClient({
  challenge,
  isPreviewMode = false,
}: ChallengePreviewClientProps) {
  const [count, setCount] = useState(0)
  const [isCounterActive, setIsCounterActive] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const target = challenge.repetitions_per_day
  const dailyProgress = (count / target) * 100
  const remaining = Math.max(0, target - count)

  const timeLabel = challenge.recommended_time
    ?.replace(/_/g, ' ')
    .replace(/\b\w/g, (l: string) => l.toUpperCase())
  const prayerLabel =
    challenge.recommended_prayer?.charAt(0).toUpperCase() + challenge.recommended_prayer?.slice(1)

  // Vibration feedback
  const vibrate = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }, [])

  // Use useCallback to memoize handleIncrement
  const handleIncrement = useCallback(() => {
    if (count < target) {
      setCount(prev => {
        return prev + 1
      })
      vibrate()
    } else {
      console.log('Count already at target, not incrementing')
    }
  }, [count, target, vibrate])

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the counter?')) {
      setCount(0)
      setStartTime(null)
      console.log('Counter reset')
    }
  }

  const handleStartCounter = () => {
    setIsCounterActive(true)
    setStartTime(Date.now())
  }

  const handleComplete = () => {
    alert(`Preview Mode: You completed ${count}/${target} repetitions!`)
    setCount(0)
    setIsCounterActive(false)
    setStartTime(null)
  }

  useEffect(() => {
    if (!isCounterActive) return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        console.log('Space key pressed')
        handleIncrement()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isCounterActive, handleIncrement])

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-4xl">{challenge.icon || '📿'}</span>
            <div>
              <h1 className="text-3xl font-bold">{challenge.title_bn}</h1>
              {challenge.title_ar && (
                <p className="arabic-text text-lg text-muted-foreground">{challenge.title_ar}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isPreviewMode && <Badge variant="secondary">Preview Mode</Badge>}
          <Badge
            variant={
              challenge.difficulty_level === 'easy'
                ? 'secondary'
                : challenge.difficulty_level === 'hard'
                ? 'destructive'
                : 'default'
            }
            className="text-base"
          >
            {challenge.difficulty_level}
          </Badge>
        </div>
      </div>

      {/* Challenge Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Target className="mb-2 h-6 w-6 text-emerald-500" />
              <p className="text-2xl font-bold">{challenge.daily_target_count}x</p>
              <p className="text-xs text-muted-foreground">Per Day</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Calendar className="mb-2 h-6 w-6 text-blue-500" />
              <p className="text-2xl font-bold">{challenge.total_days}</p>
              <p className="text-xs text-muted-foreground">Days</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Users className="mb-2 h-6 w-6 text-purple-500" />
              <p className="text-2xl font-bold">{challenge.total_participants || 0}</p>
              <p className="text-xs text-muted-foreground">Participants</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Trophy className="mb-2 h-6 w-6 text-amber-500" />
              <p className="text-2xl font-bold">{challenge.total_completions || 0}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>About This Challenge</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="leading-relaxed">{challenge.description_bn}</p>

          {(challenge.recommended_time || challenge.recommended_prayer) && (
            <div className="flex flex-wrap gap-4 rounded-lg border bg-muted/50 p-4">
              {challenge.recommended_time && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{timeLabel}</span>
                </div>
              )}
              {challenge.recommended_prayer && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">🕌</span>
                  <span className="text-sm font-medium">After {prayerLabel} Prayer</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dhikr Content */}
      <Card>
        <CardHeader>
          <CardTitle>The Dhikr</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950">
            <p className="arabic-text text-center text-3xl leading-loose">
              {challenge.arabic_text}
            </p>
          </div>

          {challenge.transliteration_bn && (
            <div>
              <h3 className="mb-2 font-semibold text-muted-foreground">Transliteration</h3>
              <p className="text-lg leading-relaxed">{challenge.transliteration_bn}</p>
            </div>
          )}

          <div>
            <h3 className="mb-2 font-semibold text-muted-foreground">Translation</h3>
            <p className="text-lg leading-relaxed">{challenge.translation_bn}</p>
          </div>

          {challenge.reference && (
            <div className="flex items-start gap-2 rounded-lg bg-muted p-4">
              <BookOpen className="mt-1 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Reference</p>
                <p className="text-sm text-muted-foreground">{challenge.reference}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fazilat (Benefits) */}
      {challenge.fazilat_bn && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Fazilat (Benefits)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed">{challenge.fazilat_bn}</p>
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                1
              </span>
              <span>
                Start the challenge and commit to reading this dhikr{' '}
                <strong>{challenge.daily_target_count} times</strong> every day
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                2
              </span>
              <span>
                Complete your daily goal for{' '}
                <strong>{challenge.total_days} consecutive days</strong>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                3
              </span>
              <span>Track your progress, build streaks, and earn achievements</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                4
              </span>
              <span>Complete the challenge and experience the benefits!</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Preview Mode Notice */}
      {isPreviewMode && (
        <Card className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-950">
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
              <Star className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Preview Mode Active</p>
              <p className="text-sm text-muted-foreground">
                This is a preview. No data will be saved.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
