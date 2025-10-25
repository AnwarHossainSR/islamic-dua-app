'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useConfirm } from '@/components/ui/confirm'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useDebounce } from '@/hooks/use-debounce'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { toast } from '@/hooks/use-toast'
import { completeDailyChallenge } from '@/lib/actions/challenges'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Circle,
  Flame,
  Maximize2,
  Minimize2,
  RotateCcw,
  Target,
  Trophy,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

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
  const { confirm, ConfirmDialog } = useConfirm()
  const challenge = progress.challenge
  const target = challenge.daily_target_count
  const isAlreadyCompleted = todayLog?.is_completed

  // Generate unique localStorage key for this challenge and day
  const storageKey = useMemo(
    () => `challenge_${progress.id}_day_${progress.current_day}_count`,
    [progress.id, progress.current_day]
  )

  // Use custom localStorage hook with hydration fix
  const [count, setCount, removeCount, isHydrated] = useLocalStorage(
    storageKey,
    isAlreadyCompleted ? todayLog?.count_completed || 0 : 0
  )

  const [isCompleting, setIsCompleting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [notes, setNotes] = useState('')
  const [mood, setMood] = useState('')

  const { debouncedCallback: saveToLocalStorage, cancel: cancelSave } = useDebounce(
    (value: number) => {
      setCount(value)
    },
    10000,
    []
  )

  // Memoized calculations
  const dailyProgress = useMemo(() => (count / target) * 100, [count, target])
  const remaining = useMemo(() => Math.max(0, target - count), [target, count])
  const overallProgress = useMemo(
    () => ((progress.current_day - 1) / challenge.total_days) * 100,
    [progress.current_day, challenge.total_days]
  )

  // Format last completed date
  const formatLastCompleted = useCallback((dateString: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [])

  // Vibration feedback
  const vibrate = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }, [])

  const handleIncrement = useCallback(() => {
    if (count < target && !isAlreadyCompleted) {
      const newCount = count + 1
      setCount(newCount)
      vibrate()
      saveToLocalStorage(newCount)
    }
  }, [count, target, vibrate, isAlreadyCompleted, setCount, saveToLocalStorage])

  const handleReset = useCallback(async () => {
    const confirmed = await confirm({
      title: 'Reset Counter?',
      description:
        'Are you sure you want to reset the counter? This will clear your current progress.',
      confirmText: 'Reset',
      confirmVariant: 'destructive',
    })
    if (confirmed) {
      setCount(0)
      cancelSave()
    }
  }, [setCount, cancelSave, confirm])

  const handleComplete = useCallback(async () => {
    if (count < target) {
      toast({
        title: 'Incomplete',
        description: `You haven't reached the target count of ${target} yet.`,
      })
      return
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
        toast({
          title: 'Error',
          description: 'Error completing challenge: ' + result.error,
          variant: 'destructive',
        })
        setIsCompleting(false)
        return
      }

      removeCount()
      cancelSave()

      setShowSuccessModal(true)
      toast({ title: 'Success', description: `Day ${progress.current_day} completed!` })
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'Failed to save progress',
        variant: 'destructive',
      })
      setIsCompleting(false)
    }
  }, [
    count,
    target,
    progress.id,
    userId,
    challenge.id,
    progress.current_day,
    notes,
    mood,
    removeCount,
    cancelSave,
    router,
  ])

  // Auto-exit fullscreen when target is reached
  useEffect(() => {
    if (isFullscreen && count >= target) {
      const timer = setTimeout(() => {
        setIsFullscreen(false)
        toast({
          title: 'Target Reached! 🎉',
          description: 'Fullscreen mode automatically closed. You can now complete the challenge.',
        })
      }, 2000) // 2 second delay to show celebration

      return () => clearTimeout(timer)
    }
  }, [isFullscreen, count, target])

  // Hide body scroll and header when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isFullscreen])

  // Keyboard shortcuts
  useEffect(() => {
    if (isAlreadyCompleted) return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        handleIncrement()
      }
      if (e.code === 'KeyF' && e.ctrlKey) {
        e.preventDefault()
        setIsFullscreen(prev => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [handleIncrement, isAlreadyCompleted])

  // Show loading state during hydration to prevent mismatch
  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 pb-20 pt-4 sm:space-y-6 sm:px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-16 rounded-lg bg-muted" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-muted" />
            ))}
          </div>
          <div className="h-32 rounded-lg bg-muted" />
        </div>
      </div>
    )
  }

  // Fullscreen Counter View
  const fullscreenContent = isFullscreen && !isAlreadyCompleted && (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-white/95 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{challenge.icon || '📿'}</span>
          <div>
            <h1 className="text-lg font-bold">{challenge.title_bn}</h1>
            <p className="text-sm text-muted-foreground">Day {progress.current_day}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={() => setIsFullscreen(false)}
        >
          <Minimize2 className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex min-h-[calc(100vh-80px)] flex-col">
        {/* Dua Content Section */}
        <div className="flex-1 space-y-6 px-4 pb-6">
          {/* Arabic Text */}
          <div className="rounded-xl border-2 border-emerald-500/25 bg-emerald-500/5 p-6 text-center">
            <p className="arabic-text text-3xl leading-loose md:text-4xl">
              {challenge.arabic_text}
            </p>
          </div>

          {/* Transliteration */}
          {challenge.transliteration_bn && (
            <div className="rounded-lg bg-muted/90 p-4 text-center border">
              <p className="text-lg font-medium text-muted-foreground md:text-xl">
                {challenge.transliteration_bn}
              </p>
            </div>
          )}

          {/* Bengali Translation */}
          <div className="rounded-lg bg-background/95 p-4 text-center shadow-sm border">
            <p className="text-lg leading-relaxed md:text-xl">{challenge.translation_bn}</p>
          </div>

          {/* Fazilat */}
          {challenge.fazilat_bn && (
            <div className="rounded-lg bg-amber-50/95 p-4 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800">
              <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-100 md:text-base">
                <strong>ফযীলত:</strong> {challenge.fazilat_bn}
              </p>
              {challenge.reference && (
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-300 md:text-sm">
                  সূত্র: {challenge.reference}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Counter Section */}
        <div className="sticky bottom-0 bg-background/98 backdrop-blur-md border-t shadow-lg p-4">
          <div className="mx-auto max-w-md space-y-4">
            {/* Progress */}
            <div className="text-center">
              <Badge
                variant={count >= target ? 'default' : 'secondary'}
                className={cn('mb-2 text-lg', count >= target && 'bg-emerald-500')}
              >
                {count} / {target}
              </Badge>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-emerald-500/20">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(dailyProgress, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {remaining > 0 ? `${remaining} আরো বাকি` : 'লক্ষ্য পূরণ হয়েছে! 🎉'}
              </p>
            </div>

            {/* Large Counter Display */}
            <div className="text-center">
              <div className="text-8xl font-bold tabular-nums md:text-9xl text-emerald-500">
                {count}
              </div>
            </div>

            {/* Counter Button */}
            <Button
              type="button"
              size="lg"
              className="h-20 w-full text-xl font-bold bg-emerald-500 hover:bg-emerald-600"
              onClick={handleIncrement}
              disabled={count >= target}
            >
              {count >= target ? (
                <>
                  <Check className="mr-2 h-6 w-6" />
                  সম্পন্ন!
                </>
              ) : (
                <>
                  <Target className="mr-2 h-6 w-6" />
                  গণনা করুন (+১)
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              বাটনে ট্যাপ করুন অথবা স্পেস চাপুন • Ctrl+F দিয়ে ফুলস্ক্রিন বন্ধ
            </p>

            {/* Action Buttons */}
            {count >= target && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsFullscreen(false)} className="flex-1">
                  <Minimize2 className="mr-2 h-4 w-4" />
                  ফুলস্ক্রিন বন্ধ
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={isCompleting}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                >
                  <Check className="mr-2 h-4 w-4" />
                  {isCompleting ? 'সেভ হচ্ছে...' : 'সম্পন্ন করুন'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 pb-20 pt-4 sm:space-y-6 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <span className="shrink-0 text-2xl sm:text-3xl">{challenge.icon || '📿'}</span>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-bold sm:text-2xl">{challenge.title_bn}</h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Day {progress.current_day} of {challenge.total_days}
              </p>
              {progress.last_completed_at && (
                <p className="text-xs text-emerald-500">
                  Last completed: {formatLastCompleted(progress.last_completed_at)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col items-center text-center">
              <Calendar className="mb-1 h-4 w-4 text-blue-500 sm:mb-2 sm:h-5 sm:w-5" />
              <p className="text-xl font-bold sm:text-2xl">{progress.current_day}</p>
              <p className="text-xs text-muted-foreground">Current Day</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col items-center text-center">
              <Flame className="mb-1 h-4 w-4 text-orange-500 sm:mb-2 sm:h-5 sm:w-5" />
              <p className="text-xl font-bold sm:text-2xl">{progress.current_streak}</p>
              <p className="text-xs text-muted-foreground">Streak</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col items-center text-center">
              <Trophy className="mb-1 h-4 w-4 text-amber-500 sm:mb-2 sm:h-5 sm:w-5" />
              <p className="text-xl font-bold sm:text-2xl">{progress.total_completed_days}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col items-center text-center">
              <Target className="mb-1 h-4 w-4 text-emerald-500 sm:mb-2 sm:h-5 sm:w-5" />
              <p className="text-xl font-bold sm:text-2xl">
                {challenge.total_days - progress.current_day + 1}
              </p>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium sm:text-sm">Overall Progress</span>
              <span className="text-xs text-muted-foreground sm:text-sm">
                {progress.current_day - 1}/{challenge.total_days} days
              </span>
            </div>
            <Progress value={overallProgress} color={'#10b981'} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Dhikr Content */}
      <Card>
        <CardContent className="space-y-3 pt-4 sm:space-y-4 sm:pt-6">
          <div className="rounded-lg border-2 border-emerald-500/20 bg-emerald-500/5 p-4 sm:p-6">
            <p className="arabic-text text-center text-2xl leading-loose sm:text-3xl">
              {challenge.arabic_text}
            </p>
          </div>

          {challenge.transliteration_bn && (
            <p className="text-center text-sm text-muted-foreground sm:text-lg">
              {challenge.transliteration_bn}
            </p>
          )}

          <p className="text-center text-sm leading-relaxed sm:text-base">
            {challenge.translation_bn}
          </p>

          {challenge.fazilat_bn && (
            <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950 sm:p-4">
              <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-100 sm:text-sm">
                <strong>ফযীলত:</strong> {challenge.fazilat_bn}
              </p>
              {challenge.reference && (
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                  সূত্র: {challenge.reference}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Counter Section */}
      {!isAlreadyCompleted ? (
        <Card className="border-2 border-emerald-500">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center justify-between text-base sm:text-lg">
              <span>Today's Count</span>
              <div className="flex items-center gap-2">
                <Badge
                  variant={count >= target ? 'default' : 'secondary'}
                  className="text-sm sm:text-base"
                >
                  {count} / {target}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsFullscreen(true)}
                  title="Fullscreen mode (Ctrl+F)"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-emerald-500/20">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(dailyProgress, 100)}%` }}
                />
              </div>
              <p className="text-center text-xs text-muted-foreground sm:text-sm">
                {remaining > 0 ? `${remaining} more to go!` : 'Target reached! 🎉'}
              </p>
            </div>

            {/* Counter Display */}
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="mb-2 text-6xl font-bold tabular-nums sm:mb-4 sm:text-8xl text-emerald-500">
                  {count}
                </div>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Tap or press Space • Ctrl+F for fullscreen
                </p>
              </div>
            </div>

            {/* Main Counter Button */}
            <Button
              type="button"
              size="lg"
              className="h-24 w-full text-xl font-bold sm:h-32 sm:text-2xl bg-emerald-500 hover:bg-emerald-600"
              onClick={handleIncrement}
              disabled={count >= target}
            >
              {count >= target ? (
                <>
                  <Check className="mr-2 h-6 w-6 sm:h-8 sm:w-8" />
                  Target Reached!
                </>
              ) : (
                <>
                  <Target className="mr-2 h-6 w-6 sm:h-8 sm:w-8" />
                  Tap to Count
                </>
              )}
            </Button>

            {/* Action Buttons */}
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={count === 0}
                className="text-sm sm:text-base"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Counter
              </Button>

              <Button
                variant="default"
                onClick={handleComplete}
                disabled={isCompleting || count < target}
                className="text-sm sm:text-base bg-emerald-500 hover:bg-emerald-600"
              >
                <Check className="mr-2 h-4 w-4" />
                {isCompleting ? 'Saving...' : 'Complete Today'}
              </Button>
            </div>

            {/* Optional Notes */}
            <div className="space-y-3 border-t pt-4">
              <div className="space-y-2">
                <label className="text-xs font-medium sm:text-sm">
                  How do you feel? (Optional)
                </label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger className="text-sm">
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
                <label className="text-xs font-medium sm:text-sm">Notes (Optional)</label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any thoughts or reflections..."
                  rows={3}
                  className="text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-emerald-500 bg-emerald-500/5">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center sm:py-12">
            <CheckCircle2 className="mb-3 h-12 w-12 sm:mb-4 sm:h-16 sm:w-16 text-emerald-500" />
            <h3 className="mb-2 text-xl font-bold sm:text-2xl">
              Day {progress.current_day} Completed!
            </h3>
            <p className="mb-3 text-sm text-muted-foreground sm:mb-4 sm:text-base">
              You completed {todayLog.count_completed} repetitions today
            </p>
            {todayLog.mood && (
              <Badge variant="outline" className="mb-2">
                Mood: {todayLog.mood}
              </Badge>
            )}
            <Badge variant="secondary" className="text-sm sm:text-base">
              Come back tomorrow for Day {progress.current_day + 1}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Calendar/History */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Progress Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {Array.from({ length: challenge.total_days }, (_, i) => {
              const dayNum = i + 1
              const log = progress.daily_logs?.find((l: any) => l.day_number === dayNum)
              const isCompleted = log?.is_completed
              const isCurrent = dayNum === progress.current_day

              return (
                <div
                  key={dayNum}
                  className={cn(
                    'flex aspect-square flex-col items-center justify-center rounded-lg border-2 p-1 text-xs font-medium sm:p-2 sm:text-sm',
                    isCurrent && !isCompleted && 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950',
                    !isCompleted && !isCurrent && 'border-muted bg-muted/50 text-muted-foreground',
                    isCompleted && 'border-emerald-500 bg-emerald-500/5 text-emerald-500'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="mb-0.5 h-3 w-3 sm:mb-1 sm:h-5 sm:w-5" />
                  ) : isCurrent ? (
                    <Circle className="mb-0.5 h-3 w-3 sm:mb-1 sm:h-5 sm:w-5" />
                  ) : (
                    <Circle className="mb-0.5 h-3 w-3 opacity-30 sm:mb-1 sm:h-5 sm:w-5" />
                  )}
                  <span className="text-[10px] sm:text-xs">{dayNum}</span>
                </div>
              )
            })}
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-xs sm:mt-4 sm:gap-4 sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
              <span className="text-muted-foreground">Completed</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Circle className="h-3 w-3 text-blue-500 sm:h-4 sm:w-4" />
              <span className="text-muted-foreground">Today</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Circle className="h-3 w-3 text-muted-foreground opacity-30 sm:h-4 sm:w-4" />
              <span className="text-muted-foreground">Upcoming</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md animate-in fade-in zoom-in duration-300">
            <CardContent className="space-y-4 pt-6 text-center sm:space-y-6">
              <div className="flex justify-center">
                <div className="rounded-full p-4 sm:p-6 bg-emerald-500/10">
                  <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 text-emerald-500" />
                </div>
              </div>

              <div>
                <h2 className="mb-2 text-2xl font-bold sm:text-3xl">Well Done!</h2>
                <p className="text-base text-muted-foreground sm:text-lg">
                  Day {progress.current_day} completed successfully
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                  <span className="text-sm">Count</span>
                  <span className="font-bold">{target}</span>
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

              <div className="pt-4">
                <Link href="/challenges" passHref>
                  <Button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600">
                    Go to Challenges
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <ConfirmDialog />

      {/* Render fullscreen mode via portal */}
      {typeof window !== 'undefined' &&
        fullscreenContent &&
        createPortal(fullscreenContent, document.body)}
    </div>
  )
}
