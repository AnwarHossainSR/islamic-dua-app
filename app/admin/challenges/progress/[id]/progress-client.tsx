'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { completeDailyChallenge } from '@/lib/actions/challenges'
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Circle,
  Flame,
  RotateCcw,
  Target,
  Trophy,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface UserChallengeProgressClientProps {
  progress: any
  todayLog: any | null
  userId: string
}

export default function UserChallengeProgressClient({
  progress,
  todayLog,
  userId,
}: UserChallengeProgressClientProps) {
  const router = useRouter()
  const [count, setCount] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [notes, setNotes] = useState('')
  const [mood, setMood] = useState('')
  const [startTime] = useState(Date.now())

  const challenge = progress.challenge
  const target = challenge.daily_target_count
  const dailyProgress = (count / target) * 100
  const remaining = Math.max(0, target - count)
  const overallProgress = ((progress.current_day - 1) / challenge.total_days) * 100
  const isAlreadyCompleted = todayLog?.is_completed

  // Vibration feedback
  const vibrate = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }, [])

  const handleIncrement = useCallback(() => {
    if (count < target && !isAlreadyCompleted) {
      setCount(prev => prev + 1)
      vibrate()
    }
  }, [count, target, vibrate, isAlreadyCompleted])

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the counter?')) {
      setCount(0)
    }
  }

  const handleComplete = async () => {
    if (count < target) {
      if (!confirm(`You're at ${count}/${target}. Complete anyway?`)) {
        return
      }
    }

    setIsCompleting(true)

    try {
      const result = await completeDailyChallenge(
        progress.id,
        userId,
        challenge.id,
        progress.current_day,
        count,
        target,
        notes || undefined,
        mood || undefined
      )

      if (result.error) {
        alert('Error completing challenge: ' + result.error)
        setIsCompleting(false)
        return
      }

      setShowSuccessModal(true)

      // Auto-close modal and refresh after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false)
        router.refresh()
      }, 3000)
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to save progress')
      setIsCompleting(false)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    if (isAlreadyCompleted) return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        handleIncrement()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [handleIncrement, isAlreadyCompleted])

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{challenge.icon}</span>
            <div>
              <h1 className="text-2xl font-bold">{challenge.title_bn}</h1>
              <p className="text-sm text-muted-foreground">
                Day {progress.current_day} of {challenge.total_days}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Calendar className="mb-2 h-5 w-5 text-blue-500" />
              <p className="text-2xl font-bold">{progress.current_day}</p>
              <p className="text-xs text-muted-foreground">Current Day</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Flame className="mb-2 h-5 w-5 text-orange-500" />
              <p className="text-2xl font-bold">{progress.current_streak}</p>
              <p className="text-xs text-muted-foreground">Streak</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Trophy className="mb-2 h-5 w-5 text-amber-500" />
              <p className="text-2xl font-bold">{progress.total_completed_days}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Target className="mb-2 h-5 w-5 text-emerald-500" />
              <p className="text-2xl font-bold">
                {challenge.total_days - progress.current_day + 1}
              </p>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {progress.current_day - 1}/{challenge.total_days} days
              </span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Dhikr Content */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950">
            <p className="arabic-text text-center text-3xl leading-loose">
              {challenge.arabic_text}
            </p>
          </div>

          {challenge.transliteration_bn && (
            <p className="text-center text-lg text-muted-foreground">
              {challenge.transliteration_bn}
            </p>
          )}

          <p className="text-center leading-relaxed">{challenge.translation_bn}</p>
        </CardContent>
      </Card>

      {/* Counter Section */}
      {!isAlreadyCompleted ? (
        <Card className="border-2 border-emerald-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Today's Count</span>
              <Badge variant={count >= target ? 'default' : 'secondary'} className="text-base">
                {count} / {target}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={dailyProgress} className="h-3" />
              <p className="text-center text-sm text-muted-foreground">
                {remaining > 0 ? `${remaining} more to go!` : 'Target reached! 🎉'}
              </p>
            </div>

            {/* Counter Display */}
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div
                  className="mb-4 text-8xl font-bold tabular-nums"
                  style={{ color: challenge.color }}
                >
                  {count}
                </div>
                <p className="text-muted-foreground">Tap or press Space</p>
              </div>
            </div>

            {/* Main Counter Button */}
            <Button
              type="button"
              size="lg"
              className="h-32 w-full text-2xl font-bold"
              style={{ backgroundColor: challenge.color }}
              onClick={handleIncrement}
              disabled={count >= target}
            >
              {count >= target ? (
                <>
                  <Check className="mr-2 h-8 w-8" />
                  Target Reached!
                </>
              ) : (
                <>
                  <Target className="mr-2 h-8 w-8" />
                  Tap to Count
                </>
              )}
            </Button>

            {/* Action Buttons */}
            <div className="grid gap-3 sm:grid-cols-2">
              <Button variant="outline" onClick={handleReset} disabled={count === 0}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Counter
              </Button>

              <Button
                variant="default"
                onClick={handleComplete}
                disabled={isCompleting || count === 0}
              >
                <Check className="mr-2 h-4 w-4" />
                {isCompleting ? 'Saving...' : 'Complete Today'}
              </Button>
            </div>

            {/* Optional Notes */}
            <div className="space-y-3 border-t pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">How do you feel? (Optional)</label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="great">😊 Great</SelectItem>
                    <SelectItem value="good">🙂 Good</SelectItem>
                    <SelectItem value="okay">😐 Okay</SelectItem>
                    <SelectItem value="difficult">😓 Difficult</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any thoughts or reflections..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="mb-4 h-16 w-16 text-emerald-500" />
            <h3 className="mb-2 text-2xl font-bold">Day {progress.current_day} Completed!</h3>
            <p className="mb-4 text-muted-foreground">
              You completed {todayLog.count_completed} repetitions today
            </p>
            <Badge variant="secondary" className="text-base">
              Come back tomorrow for Day {progress.current_day + 1}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Calendar/History */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: challenge.total_days }, (_, i) => {
              const dayNum = i + 1
              const log = progress.daily_logs?.find((l: any) => l.day_number === dayNum)
              const isCompleted = log?.is_completed
              const isCurrent = dayNum === progress.current_day

              return (
                <div
                  key={dayNum}
                  className={`
                    flex aspect-square flex-col items-center justify-center rounded-lg border-2 p-2 text-sm font-medium
                    ${
                      isCompleted
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950'
                        : ''
                    }
                    ${
                      isCurrent && !isCompleted
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950'
                        : ''
                    }
                    ${
                      !isCompleted && !isCurrent
                        ? 'border-muted bg-muted/50 text-muted-foreground'
                        : ''
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="mb-1 h-5 w-5" />
                  ) : isCurrent ? (
                    <Circle className="mb-1 h-5 w-5" />
                  ) : (
                    <Circle className="mb-1 h-5 w-5 opacity-30" />
                  )}
                  <span className="text-xs">{dayNum}</span>
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-muted-foreground">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-muted-foreground opacity-30" />
              <span className="text-muted-foreground">Upcoming</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md animate-in fade-in zoom-in duration-300">
            <CardContent className="space-y-6 pt-6 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-emerald-100 p-6 dark:bg-emerald-900">
                  <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                </div>
              </div>

              <div>
                <h2 className="mb-2 text-3xl font-bold">Well Done!</h2>
                <p className="text-lg text-muted-foreground">
                  Day {progress.current_day} completed successfully
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                  <span className="text-sm">Count</span>
                  <span className="font-bold">{count}</span>
                </div>
                {progress.current_streak >= 0 && (
                  <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                    <span className="text-sm">Streak</span>
                    <span className="flex items-center gap-1 font-bold">
                      <Flame className="h-4 w-4 text-orange-500" />
                      {progress.current_streak + 1} days
                    </span>
                  </div>
                )}
              </div>

              <p className="text-sm font-medium text-muted-foreground">
                See you tomorrow for Day {progress.current_day + 1}!
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
