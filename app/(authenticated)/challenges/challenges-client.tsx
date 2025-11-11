'use client'

import { ChallengeCard } from '@/components/challenge-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDebounce } from '@/hooks/use-debounce'
import { getUser } from '@/lib/actions/auth'
import {
  restartChallenge,
  searchAndFilterChallenges,
  startChallenge,
} from '@/lib/actions/challenges'
import { isCurrentDay, sortChallengesByCompletion } from '@/lib/utils'
import { format } from 'date-fns'
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Plus,
  Search,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react'

import Link from 'next/link'
import React, { useCallback, useMemo, useState, useTransition } from 'react'

import { Challenge, RecentLog } from '@/lib/types/challenges'

export default function ChallengesClient({
  initialChallenges,
  initialRecentLogs,
  todayRemaining,
  todayStats,
}: {
  initialChallenges: Challenge[]
  initialRecentLogs: RecentLog[]
  todayRemaining: any[]
  todayStats: { completed: number; total: number; percentage: number }
}) {
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges)
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [completionFilter, setCompletionFilter] = useState('all') // Show all challenges by default
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isPending, startTransition] = useTransition()
  const [completionLoading, setCompletionLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showCompletedDialog, setShowCompletedDialog] = useState(false)

  // Get user on mount
  React.useEffect(() => {
    let mounted = true
    getUser().then(userData => {
      if (mounted) setUser(userData)
    })
    return () => {
      mounted = false
    }
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
      setCurrentPage(1) // Reset to first page
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

  const handleCompletionChange = (value: string) => {
    setCompletionLoading(true)
    setCompletionFilter(value)
    setCurrentPage(1) // Reset to first page
    // Brief loading state for visual feedback
    setTimeout(() => setCompletionLoading(false), 200)
  }

  const handleStartChallenge = async (challengeId: string) => {
    if (!user) return

    setActionLoading(challengeId)
    try {
      const result = await startChallenge(user.id, challengeId)
      if (result.error) {
        console.error('Error starting challenge:', result.error)
      } else {
        // Hard reload the page
        window.location.reload()
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
        // Hard reload the page
        window.location.reload()
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
    const completions = challenges.reduce((sum, c) => sum + (c.total_completed_days || 0), 0)
    const days = challenges.reduce((sum, c) => sum + c.total_days, 0)
    const avgRate = participants > 0 ? Math.round((completions / days) * 100) : 0
    return { total, participants, completions, days, avgRate, todayCompleted }
  }, [challenges])

  // Filter challenges by completion status
  const filteredChallenges = useMemo(() => {
    if (completionFilter === 'completed') {
      return challenges.filter(c => isCurrentDay(c.last_completed_at || ''))
    } else if (completionFilter === 'pending') {
      return challenges.filter(c => !isCurrentDay(c.last_completed_at || ''))
    }
    return challenges
  }, [challenges, completionFilter])

  // Paginated challenges
  const paginatedChallenges = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredChallenges.slice(startIndex, endIndex)
  }, [filteredChallenges, currentPage, itemsPerPage])

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
                      <p className="text-sm text-muted-foreground">Remain Today</p>
                      <p className="text-3xl font-bold">{todayRemaining.length}</p>
                    </div>
                    <Trophy className="h-8 w-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Today Average</p>
                      <p className="text-3xl font-bold">{todayStats.percentage}%</p>
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
                  <p className="text-sm text-muted-foreground">Remain Today</p>
                  <p className="text-3xl font-bold">{todayRemaining.length}</p>
                </div>
                <Trophy className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today Average</p>
                  <p className="text-3xl font-bold">{todayStats.percentage}%</p>
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
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  <CardTitle>Challenges</CardTitle>
                </div>
                <div className="flex gap-1 shrink-0 flex-wrap">
                  <Select value={completionFilter} onValueChange={handleCompletionChange}>
                    <SelectTrigger className="w-[130px] md:w-[160px] text-xs md:text-sm">
                      <SelectValue placeholder="Completion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Challenges</SelectItem>
                      <SelectItem value="pending">Not Done Today</SelectItem>
                      <SelectItem value="completed">Done Today</SelectItem>
                    </SelectContent>
                  </Select>
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search challenges..."
                    className="pl-10 text-xs md:text-sm w-full"
                    value={searchQuery}
                    onChange={e => handleSearchChange(e.target.value)}
                    disabled={isPending}
                  />
                  {(isPending || completionLoading) && (
                    <Skeleton className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="hidden sm:inline">
                    Total: {filteredChallenges.length} challenges | Showing{' '}
                    {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredChallenges.length)} of{' '}
                    {filteredChallenges.length}
                  </span>
                  <span className="sm:hidden">
                    {filteredChallenges.length} challenges | Page {currentPage}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Challenges List */}
              <div className="space-y-4">
                {isPending || completionLoading
                  ? // Skeleton loading state
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="border rounded-lg p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="flex-1 space-y-4">
                            <div className="flex items-start gap-3">
                              <Skeleton className="h-14 w-14 rounded-lg" />
                              <div className="flex-1 space-y-2">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-4 w-2/3" />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Skeleton className="h-6 w-16" />
                              <Skeleton className="h-6 w-20" />
                            </div>
                          </div>
                          <div className="md:w-72 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <Skeleton className="h-16 rounded-lg" />
                              <Skeleton className="h-16 rounded-lg" />
                            </div>
                            <Skeleton className="h-12 rounded-lg" />
                            <Skeleton className="h-9 w-full" />
                          </div>
                        </div>
                      </div>
                    ))
                  : paginatedChallenges.map((challenge: Challenge) => (
                      <ChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        actionLoading={actionLoading}
                        onStartChallenge={handleStartChallenge}
                        onRestartChallenge={handleRestartChallenge}
                        onShowCompletedDialog={() => setShowCompletedDialog(true)}
                      />
                    ))}

                {!isPending && !completionLoading && filteredChallenges.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Target className="mb-4 h-16 w-16 text-muted-foreground" />
                    <p className="mb-2 text-lg font-semibold">No challenges found</p>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Try adjusting your filters or search query
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalItems={filteredChallenges.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                showInfo={false}
              />
            </CardContent>
          </Card>
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
                            {log.completed_at &&
                            !isNaN(new Date(log.completed_at + ' GMT+0600').getTime())
                              ? format(new Date(log.completed_at + ' GMT+0600'), 'PPpp')
                              : 'Invalid date'}
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

      {/* Completed Today Dialog */}
      <Dialog open={showCompletedDialog} onOpenChange={setShowCompletedDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Challenge Completed Today!
            </DialogTitle>
            <DialogDescription className="text-center py-4">
              You have already completed this challenge today. Please come back tomorrow to continue
              your journey.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Button onClick={() => setShowCompletedDialog(false)}>Got it!</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
