'use client'

import { ActionButton } from '@/components/ui/action-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDebounce } from '@/hooks/use-debounce'
import { getUser } from '@/lib/actions/auth'
import {
  deleteChallengeTemplate,
  restartChallenge,
  searchAndFilterChallenges,
  startChallenge,
} from '@/lib/actions/challenges'
import { isCurrentDay, sortChallengesByCompletion } from '@/lib/utils'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import {
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Edit,
  Eye,
  Loader2,
  Play,
  Plus,
  RotateCcw,
  Search,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import React, { useCallback, useMemo, useState, useTransition } from 'react'

export interface Challenge {
  id: string
  title_bn: string
  title_ar?: string
  description_bn?: string
  icon?: string
  color?: string
  difficulty_level: 'easy' | 'medium' | 'hard'
  is_active: boolean
  is_featured: boolean
  total_participants: number
  total_completions: number
  total_days: number
  daily_target_count: number
  recommended_prayer?: string
  last_completed_at?: string
  user_status: 'not_started' | 'active' | 'paused' | 'completed'
  progress_id?: string
  completed_at?: string
  total_completed_days: number
  current_day: number
  completion_count: number
  completion_percentage?: number
}

interface RecentLog {
  id: string
  day_number: number
  count_completed: number
  completed_at: string
  is_completed: boolean
  user_progress?: {
    challenge?: {
      icon?: string
      title_bn: string
    }
  }
}

export default function ChallengesClient({
  initialChallenges,
  initialRecentLogs,
}: {
  initialChallenges: Challenge[]
  initialRecentLogs: RecentLog[]
}) {
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges)
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isPending, startTransition] = useTransition()
  const [user, setUser] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Get user on mount
  React.useEffect(() => {
    let mounted = true
    getUser().then(userData => {
      if (mounted) setUser(userData)
    })
    return () => { mounted = false }
  }, [])

  // Server search action with debounce
  const performSearch = useCallback(async (query: string, difficulty: string, status: string) => {
    startTransition(async () => {
      const results = await searchAndFilterChallenges({
        searchQuery: query,
        difficulty,
        status,
      })

      // Sort results to keep incomplete challenges at top
      const sortedResults = sortChallengesByCompletion(results)
      setChallenges(sortedResults)
    })
  }, [])

  // Use your custom debounce hook
  const { debouncedCallback: debouncedSearch } = useDebounce(
    (query: string, difficulty: string, status: string) => {
      performSearch(query, difficulty, status)
    },
    500,
    []
  )

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    debouncedSearch(value, difficultyFilter, statusFilter)
  }

  // Handle filter changes (immediate, no debounce needed)
  const handleDifficultyChange = (value: string) => {
    setDifficultyFilter(value)
    performSearch(searchQuery, value, statusFilter)
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    performSearch(searchQuery, difficultyFilter, value)
  }

  const handleStartChallenge = async (challengeId: string) => {
    if (!user) return

    setActionLoading(challengeId)
    try {
      const result = await startChallenge(user.id, challengeId)
      if (result.error) {
        console.error('Error starting challenge:', result.error)
      } else {
        // Refresh challenges
        performSearch(searchQuery, difficultyFilter, statusFilter)
      }
    } catch (error) {
      console.error('Error starting challenge:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRestartChallenge = async (challenge: Challenge) => {
    setActionLoading(challenge.progress_id || '')
    try {
      const result = await restartChallenge(challenge)
      if (result.error) {
        console.error('Error restarting challenge:', result.error)
      } else {
        // Refresh challenges
        performSearch(searchQuery, difficultyFilter, statusFilter)
      }
    } catch (error) {
      console.error('Error restarting challenge:', error)
    } finally {
      setActionLoading(null)
    }
  }

  // Calculate stats
  const stats = useMemo(() => {
    const total = challenges.length
    const participants = challenges.reduce((sum, c) => sum + (c.total_participants || 0), 0)
    const todayCompleted = challenges.filter(c => isCurrentDay(c.last_completed_at || '')).length
    console.log('challenges for stats calculation:', challenges)
    const completions = challenges.reduce((sum, c) => sum + (c.total_completed_days || 0), 0)
    const days = challenges.reduce((sum, c) => sum + c.total_days, 0)
    const avgRate = participants > 0 ? Math.round((completions / days) * 100) : 0
    return { total, participants, completions, days, avgRate, todayCompleted }
  }, [challenges])

  // Helper functions to clean up JSX
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

    const completedToday = isCurrentDay(lastCompletedAt)
    const timeZone = 'Asia/Dhaka'
    const utcDate = new Date(lastCompletedAt)
    const date = toZonedTime(utcDate, timeZone)

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="mb-4">
          <h1 className="mb-2 text-4xl font-bold">Challenge Management</h1>
          <p className="text-muted-foreground">
            Manage daily dhikr challenges and track user progress
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/challenges/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Challenge
          </Link>
        </Button>
      </div>

      {/* Quick Stats Cards */}
      <div>
        <div className="md:hidden mb-4">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
              <span className="font-semibold text-sm">Quick Stats</span>
              <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="grid gap-4 md:grid-cols-4 mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Challenges</p>
                      <p className="text-3xl font-bold">{stats.total}</p>
                    </div>
                    <Target className="h-8 w-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Today Completed</p>
                      <p className="text-3xl font-bold">{stats.todayCompleted}</p>
                    </div>
                    <Check className="h-8 w-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Days Completed</p>
                      <p className="text-3xl font-bold">{stats.completions}</p>
                    </div>
                    <Trophy className="h-8 w-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Completion</p>
                      <p className="text-3xl font-bold">{stats.avgRate}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </details>
        </div>

        <div className="hidden md:grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Challenges</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <Target className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today Completed</p>
                  <p className="text-3xl font-bold">{stats.todayCompleted}</p>
                </div>
                <Check className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Days Completed</p>
                  <p className="text-3xl font-bold">{stats.completions}</p>
                </div>
                <Trophy className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Completion</p>
                  <p className="text-3xl font-bold">{stats.avgRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-auto grid-cols-4 gap-2">
            <TabsTrigger className="cursor-pointer text-xs md:text-sm py-2 shrink-0" value="all">
              All Challenges
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer text-xs md:text-sm py-2 shrink-0" value="active">
              Active Users
            </TabsTrigger>
            <TabsTrigger
              className="cursor-pointer text-xs md:text-sm py-2 shrink-0"
              value="history"
            >
              History
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer text-xs md:text-sm py-2 shrink-0" value="stats">
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        {/* All Challenges Tab */}
        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search challenges..."
                    className="pl-10 text-xs md:text-sm w-full"
                    value={searchQuery}
                    onChange={e => handleSearchChange(e.target.value)}
                    disabled={isPending}
                  />
                  {isPending && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Select value={difficultyFilter} onValueChange={handleDifficultyChange}>
                    <SelectTrigger className="w-[140px] md:w-[160px] text-xs md:text-sm">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulty</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[140px] md:w-[160px] text-xs md:text-sm">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="featured">Featured</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Challenges List */}
          <div className="space-y-4">
            {challenges.map((challenge: Challenge, index) => {
              const completionRate = challenge.completion_percentage || 0
              const statusBadge = getStatusBadgeConfig(challenge.user_status)
              const difficultyVariant = getDifficultyBadgeVariant(challenge.difficulty_level)
              const progressConfig = getProgressConfig(challenge.user_status, completionRate)

              return (
                <Card key={challenge.id} className={getCardClassName(challenge.user_status)}>
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
                              {challenge.total_participants || 0}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">Participants</p>
                        </div>
                        <div className="rounded-lg border bg-muted/50 p-3 text-center">
                          <div className="flex items-center justify-center gap-1 text-amber-500">
                            <Trophy className="h-4 w-4" />
                            <span className="text-lg md:text-xl font-bold">
                              {challenge.total_completed_days || 0}
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
                            onClick={() => handleStartChallenge(challenge.id)}
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
                            onClick={() =>
                              challenge.progress_id && handleRestartChallenge(challenge)
                            }
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

                        {/* Preview Button - only show for non-completed challenges */}
                        {challenge.user_status !== 'completed' && (
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
            })}

            {challenges.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Target className="mb-4 h-16 w-16 text-muted-foreground" />
                  <p className="mb-2 text-lg font-semibold">No challenges found</p>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Try adjusting your filters or search query
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Other Tabs - Placeholder */}
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {initialRecentLogs && initialRecentLogs.length > 0 ? (
                <div className="space-y-3">
                  {initialRecentLogs.map((log: RecentLog) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl shrink-0">
                          {log.user_progress?.challenge?.icon || '📿'}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {log.user_progress?.challenge?.title_bn || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            Day {log.day_number} • {log.count_completed} reps •{' '}
                            {format(new Date(log.completed_at), 'PPpp')}
                          </p>
                        </div>
                      </div>
                      <Badge variant={log.is_completed ? 'default' : 'secondary'}>
                        {log.is_completed ? '✓' : 'In Progress'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">No activity</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Performing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {challenges
                    .filter(c => (c.total_participants || 0) > 0)
                    .sort((a, b) => {
                      const rateA = ((a.total_completed_days || 0) / (a.total_days || 1)) * 100
                      const rateB = ((b.total_completed_days || 0) / (b.total_days || 1)) * 100
                      return rateB - rateA
                    })
                    .slice(0, 5)
                    .map(challenge => {
                      const rate = Math.round(
                        ((challenge.total_completed_days || 0) / (challenge.total_days || 1)) * 100
                      )
                      return (
                        <div key={challenge.id} className="flex items-center gap-2 min-w-0">
                          <span className="text-xl shrink-0">{challenge.icon || '📿'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{challenge.title_bn}</p>
                            <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full"
                                style={{
                                  width: `${rate}%`,
                                  backgroundColor: 'rgb(16 185 129)',
                                }}
                              />
                            </div>
                          </div>
                          <span className="text-sm font-bold shrink-0">{rate}%</span>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Most Popular</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {challenges
                    .sort((a, b) => (b.total_participants || 0) - (a.total_participants || 0))
                    .slice(0, 5)
                    .map(challenge => (
                      <div
                        key={challenge.id}
                        className="flex items-center justify-between gap-2 min-w-0"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xl shrink-0">{challenge.icon || '📿'}</span>
                          <p className="text-sm font-medium truncate">{challenge.title_bn}</p>
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          {challenge.total_participants || 0}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
