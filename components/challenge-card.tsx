'use client'

import { ActionButton } from '@/components/ui/action-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { deleteChallengeTemplate } from '@/lib/actions/challenges'
import { formatNumber, isCurrentDay } from '@/lib/utils'
import { format } from 'date-fns'
import {
  Calendar,
  CheckCircle2,
  Edit,
  Eye,
  Loader2,
  Play,
  RotateCcw,
  Target,
  Trash2,
  Trophy,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { Challenge } from '@/lib/types/challenges'

interface ChallengeCardProps {
  challenge: Challenge
  actionLoading: string | null
  onStartChallenge: (challengeId: string) => void
  onRestartChallenge: (challenge: Challenge) => void
  onShowCompletedDialog: () => void
}

export function ChallengeCard({
  challenge,
  actionLoading,
  onStartChallenge,
  onRestartChallenge,
  onShowCompletedDialog,
}: ChallengeCardProps) {
  const completionRate = challenge.completion_percentage || 0
  
  const getCardClassName = (userStatus: string) => {
    const baseClass = 'overflow-hidden'
    const completedClass =
      'bg-emerald-100/80 border-emerald-300 dark:bg-emerald-900/40 dark:border-emerald-600'
    return userStatus === 'completed' ? `${baseClass} ${completedClass}` : baseClass
  }

  const getStatusBadgeConfig = (userStatus: string) => {
    const configs = {
      completed: { variant: 'default' as const, text: 'Completed' },
      active: { variant: 'secondary' as const, text: 'Active' },
      paused: { variant: 'destructive' as const, text: 'Paused' },
      not_started: { variant: 'outline' as const, text: 'Not Started' },
    }
    return configs[userStatus as keyof typeof configs] || configs.not_started
  }

  const getDifficultyBadgeVariant = (difficulty: string) => {
    const variants = {
      easy: 'secondary' as const,
      hard: 'destructive' as const,
      medium: 'default' as const,
    }
    return variants[difficulty as keyof typeof variants] || 'default'
  }

  const getProgressConfig = (userStatus: string, completionRate: number) => {
    const isCompleted = userStatus === 'completed'
    return {
      label: isCompleted ? 'Completed' : 'Progress',
      percentage: isCompleted ? '100%' : `${completionRate}%`,
      width: isCompleted ? 100 : completionRate,
      color: isCompleted ? 'rgb(34 197 94)' : 'rgb(16 185 129)',
    }
  }

  function getLastCompletedBadge(lastCompletedAt: string | null) {
    if (!lastCompletedAt) {
      return (
        <Badge variant="outline" className="text-xs">
          Not started
        </Badge>
      )
    }
    // Database stores Bangladesh time but returns as UTC, so subtract 6 hours
    const utcDate = new Date(lastCompletedAt)
    const date = new Date(utcDate.getTime() - 6 * 60 * 60 * 1000)
    if (isNaN(date.getTime())) {
      return (
        <Badge variant="outline" className="text-xs">
          Invalid date
        </Badge>
      )
    }

    const completedToday = isCurrentDay(date.toISOString())

    return completedToday ? (
      <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200 flex items-center gap-1 text-xs">
        <CheckCircle2 className="h-3 w-3" />
        Today at {format(date, 'h:mm a')}
      </Badge>
    ) : (
      <Badge variant="secondary" className="text-xs">
        {format(date, 'MMM d, h:mm a')}
      </Badge>
    )
  }

  const statusBadge = getStatusBadgeConfig(challenge.user_status)
  const difficultyVariant = getDifficultyBadgeVariant(challenge.difficulty_level)
  const progressConfig = getProgressConfig(challenge.user_status, completionRate)
  const completedToday = isCurrentDay(challenge.last_completed_at || '')

  return (
    <Card className={getCardClassName(challenge.user_status)}>
      <div className="flex flex-col gap-6 p-4 md:p-6 md:flex-row">
        {/* Left: Challenge Info */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-2xl bg-emerald-500/10">
                {challenge.icon || '📿'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-1 flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg md:text-xl font-bold truncate">
                    {challenge.title_bn}
                  </h3>
                  {challenge.is_featured && (
                    <Badge variant="secondary" className="text-xs">
                      Featured
                    </Badge>
                  )}
                  {!challenge.is_active && (
                    <Badge variant="outline" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                  <Badge variant={statusBadge.variant} className="text-xs">
                    {statusBadge.text}
                  </Badge>
                </div>
                {challenge.title_ar && (
                  <p className="arabic-text text-muted-foreground text-sm truncate">
                    {challenge.title_ar}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end shrink-0">
              <Badge variant={difficultyVariant} className="text-xs">
                {challenge.difficulty_level}
              </Badge>
              {getLastCompletedBadge(challenge.last_completed_at || null)}
            </div>
          </div>

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {challenge.description_bn}
          </p>

          <div className="flex flex-wrap gap-3 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{challenge.daily_target_count}x daily</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{challenge.total_days} days</span>
            </div>
            {challenge.recommended_prayer && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground shrink-0">🕌</span>
                <span>After {challenge.recommended_prayer}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Stats & Actions */}
        <div className="flex flex-col justify-between gap-4 md:w-64">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border bg-muted/50 p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-blue-500">
                <Users className="h-4 w-4" />
                <span className="text-lg md:text-xl font-bold">
                  {formatNumber(challenge.total_participants || 0)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Participants</p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-500">
                <Trophy className="h-4 w-4" />
                <span className="text-lg md:text-xl font-bold">
                  {formatNumber(challenge.total_completed_days || 0)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Days Done</p>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/50 p-3">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{progressConfig.label}</span>
              <span className="font-bold">{progressConfig.percentage}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full transition-all"
                style={{
                  width: `${progressConfig.width}%`,
                  backgroundColor: progressConfig.color,
                }}
              />
            </div>
          </div>

          <div className="flex gap-2">
            {/* Start/Continue/Restart Button */}
            {challenge.user_status === 'not_started' && (
              <Button
                size="sm"
                className="flex-1 text-xs md:text-sm"
                onClick={() => onStartChallenge(challenge.id)}
                disabled={!challenge.is_active || actionLoading === challenge.id}
              >
                {actionLoading === challenge.id ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Play className="mr-1 h-3 w-3" />
                )}
                Start
              </Button>
            )}

            {challenge.user_status === 'completed' && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs md:text-sm"
                onClick={() => challenge.progress_id && onRestartChallenge(challenge)}
                disabled={actionLoading === challenge.progress_id}
              >
                {actionLoading === challenge.progress_id ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <RotateCcw className="mr-1 h-3 w-3" />
                )}
                Restart
              </Button>
            )}

            {/* Preview Button */}
            {completedToday ? (
              <Button
                size="sm"
                variant="outline"
                className="text-xs md:text-sm opacity-50 cursor-not-allowed"
                onClick={onShowCompletedDialog}
                disabled
              >
                <Eye className="mr-1 h-3 w-3" />
                Preview
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                asChild
                className="text-xs md:text-sm"
              >
                <Link href={`/challenges/${challenge.id}/preview`}>
                  <Eye className="mr-1 h-3 w-3" />
                  Preview
                </Link>
              </Button>
            )}

            {/* Admin Actions */}
            <Button size="sm" variant="outline" asChild className="text-xs md:text-sm">
              <Link href={`/challenges/${challenge.id}`}>
                <Edit className="mr-1 h-3 w-3" />
                Edit
              </Link>
            </Button>
            <ActionButton
              action={deleteChallengeTemplate}
              actionParams={[challenge.id]}
              title="Delete Challenge"
              description="Are you sure you want to delete this challenge?"
              confirmText="Delete"
              confirmVariant="destructive"
            >
              <Trash2 className="mr-1 h-3 w-3" />
            </ActionButton>
          </div>
        </div>
      </div>
    </Card>
  )
}