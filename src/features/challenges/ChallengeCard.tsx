import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import { Card, Badge, Button } from '@/components/ui'
import { Target, Calendar, Users, Trophy, Eye, Play } from 'lucide-react'
import type { Challenge } from '@/lib/types'

interface ChallengeCardProps {
  challenge: Challenge & { user_challenge_progress?: any[] }
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const progress = challenge.user_challenge_progress?.[0]
  const isActive = progress?.status === 'active'
  const completionRate = progress ? Math.round((progress.total_completed_days / challenge.total_days) * 100) : 0

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-2xl bg-emerald-500/10">
              {challenge.icon || '📿'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="mb-1 flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold">{challenge.title_bn}</h3>
                {isActive && (
                  <Badge variant="secondary" className="text-xs">Active</Badge>
                )}
                {challenge.is_featured && (
                  <Badge variant="secondary" className="text-xs">Featured</Badge>
                )}
              </div>
            </div>
          </div>

          <p className="line-clamp-2 text-sm text-muted-foreground">{challenge.description_bn}</p>

          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>{challenge.daily_target_count}x daily</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{challenge.total_days} days</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border bg-muted/50 p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-blue-500">
                <Users className="h-4 w-4" />
                <span className="text-xl font-bold">{challenge.total_participants || 0}</span>
              </div>
              <p className="text-xs text-muted-foreground">Participants</p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-500">
                <Trophy className="h-4 w-4" />
                <span className="text-xl font-bold">{progress?.total_completed_days || 0}</span>
              </div>
              <p className="text-xs text-muted-foreground">Days Done</p>
            </div>
          </div>

          {progress && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-bold">{completionRate}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full transition-all bg-emerald-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild className="flex-1">
              <Link to={isActive ? ROUTES.CHALLENGE_PROGRESS(challenge.id) : ROUTES.CHALLENGE_DETAIL(challenge.id)}>
                {isActive ? <Eye className="mr-1 h-3 w-3" /> : <Play className="mr-1 h-3 w-3" />}
                {isActive ? 'Continue' : 'Start'}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
