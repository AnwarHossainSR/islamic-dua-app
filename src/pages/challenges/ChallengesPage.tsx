import { challengesApi } from '@/api/challenges.api'
import { activityApi } from '@/api/activity.api'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { useConfirm } from '@/components/ui/Confirm'
import { Pagination } from '@/components/ui/Pagination'
import { useAuth } from '@/hooks/useAuth'
import { formatNumber } from '@/lib/utils/format'
import { format } from 'date-fns'
import {
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ClockAlert,
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
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

function isCurrentDay(timestamp: number | null): boolean {
  if (!timestamp) return false
  const date = new Date(timestamp)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export default function ChallengesPage() {
  const { user } = useAuth()
  const { confirm, ConfirmDialog } = useConfirm()
  const [challenges, setChallenges] = useState<any[]>([])
  const [recentLogs, setRecentLogs] = useState<any[]>([])
  const [filteredChallenges, setFilteredChallenges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [completionFilter, setCompletionFilter] = useState('pending')
  const [currentPage, setCurrentPage] = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showCompletedDialog, setShowCompletedDialog] = useState(false)
  const itemsPerPage = 10

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        const data = await challengesApi.getAll()
        setChallenges(data)
        applyFilters(data, searchQuery, difficultyFilter, statusFilter, completionFilter)
      } catch (error) {
        console.error('Failed to load challenges:', error)
      } finally {
        setLoading(false)
      }
    }
    const loadRecentLogs = async () => {
      try {
        const logs = await activityApi.getUserRecentLogs(10)
        setRecentLogs(logs)
      } catch (error) {
        console.error('Failed to load recent logs:', error)
      }
    }
    loadChallenges()
    loadRecentLogs()
  }, [])

  const applyFilters = (data: any[], search: string, difficulty: string, status: string, completion: string) => {
    let filtered = [...data]

    // Search filter
    if (search) {
      filtered = filtered.filter(c => 
        c.title_bn?.toLowerCase().includes(search.toLowerCase()) ||
        c.title_ar?.toLowerCase().includes(search.toLowerCase()) ||
        c.description_bn?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Difficulty filter
    if (difficulty !== 'all') {
      filtered = filtered.filter(c => c.difficulty_level === difficulty)
    }

    // Status filter
    if (status === 'active') {
      filtered = filtered.filter(c => c.is_active === true)
    } else if (status === 'inactive') {
      filtered = filtered.filter(c => c.is_active === false)
    } else if (status === 'featured') {
      filtered = filtered.filter(c => c.is_featured === true)
    }

    // Completion filter
    if (completion === 'completed') {
      filtered = filtered.filter(c => isCurrentDay(c.last_completed_at || null))
    } else if (completion === 'pending') {
      filtered = filtered.filter(c => !isCurrentDay(c.last_completed_at || null))
    }

    setFilteredChallenges(filtered)
  }

  useEffect(() => {
    applyFilters(challenges, searchQuery, difficultyFilter, statusFilter, completionFilter)
  }, [searchQuery, difficultyFilter, statusFilter, completionFilter, challenges])

  const stats = useMemo(() => {
    const total = challenges.length
    const todayCompleted = challenges.filter((c) =>
      isCurrentDay(c.last_completed_at || null)
    ).length
    const todayRemaining = challenges.filter(
      (c) => !isCurrentDay(c.last_completed_at || null)
    ).length
    const todayPercentage = total > 0 ? Math.round((todayCompleted / total) * 100) : 0
    return { total, todayCompleted, todayRemaining, todayPercentage }
  }, [challenges])

  const paginatedChallenges = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredChallenges.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredChallenges, currentPage])

  const handleStartChallenge = async (challengeId: string) => {
    if (!user) return
    setActionLoading(challengeId)
    try {
      await challengesApi.start(user.id, challengeId)
      window.location.reload()
    } catch (error) {
      console.error('Error starting challenge:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRestartChallenge = async (challenge: any) => {
    setActionLoading(challenge.progress_id || '')
    try {
      await challengesApi.restart(challenge.progress_id, challenge.id)
      window.location.reload()
    } catch (error) {
      console.error('Error restarting challenge:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteChallenge = async (challengeId: string) => {
    const confirmed = await confirm({
      title: 'Delete Challenge',
      description: 'Are you sure you want to delete this challenge? This action cannot be undone.',
      confirmText: 'Delete',
      confirmVariant: 'destructive',
      icon: 'warning'
    })
    if (confirmed) {
      await challengesApi.delete(challengeId)
      window.location.reload()
    }
  }



  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4">
          <h1 className="mb-2 text-4xl font-bold">Challenge Management</h1>
          <p className="text-muted-foreground">
            Manage daily dhikr challenges and track user progress
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/challenges/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Challenge
          </Link>
        </Button>
      </div>

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
                      <p className="text-3xl font-bold">{stats.todayRemaining}</p>
                    </div>
                    <ClockAlert className="h-8 w-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Today Average</p>
                      <p className="text-3xl font-bold">{stats.todayPercentage}%</p>
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
                  <p className="text-3xl font-bold">{stats.todayRemaining}</p>
                </div>
                <ClockAlert className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today Average</p>
                  <p className="text-3xl font-bold">{stats.todayPercentage}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  <CardTitle>Challenges</CardTitle>
                </div>
                <div className="flex gap-1 shrink-0 flex-wrap">
                  <Select value={completionFilter} onValueChange={setCompletionFilter}>
                    <SelectTrigger className="w-[130px] md:w-[160px] text-xs md:text-sm">
                      <SelectValue placeholder="Completion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Challenges</SelectItem>
                      <SelectItem value="pending">Not Done Today</SelectItem>
                      <SelectItem value="completed">Done Today</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
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
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="hidden sm:inline">
                    Total: {filteredChallenges.length} challenges
                  </span>
                  <span className="sm:hidden">{filteredChallenges.length} challenges</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paginatedChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    actionLoading={actionLoading}
                    onStartChallenge={handleStartChallenge}
                    onRestartChallenge={handleRestartChallenge}
                    onDeleteChallenge={handleDeleteChallenge}
                    onShowCompletedDialog={() => setShowCompletedDialog(true)}
                  />
                ))}
                {filteredChallenges.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Target className="mb-4 h-16 w-16 text-muted-foreground" />
                    <p className="mb-2 text-lg font-semibold">No challenges found</p>
                  </div>
                )}
              </div>
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
              {recentLogs.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">No activity</p>
              ) : (
                <div className="space-y-3">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between gap-4 rounded-lg border p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl shrink-0">
                          {log.user_progress?.challenge?.icon || '📿'}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {log.user_progress?.challenge?.title_bn || 'Unknown Challenge'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Day {log.day_number} • {log.count_completed} reps
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.completed_at || log.created_at).toLocaleDateString('en-GB')}
                        </span>
                        {log.is_completed && (
                          <Badge variant="default" className="bg-emerald-500">
                            ✓
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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

      <ConfirmDialog />
    </div>
  )
}

function ChallengeCard({ challenge, actionLoading, onStartChallenge, onRestartChallenge, onDeleteChallenge, onShowCompletedDialog }: any) {
  const completionRate = challenge.completion_percentage || 0
  const completedToday = isCurrentDay(challenge.last_completed_at || null)
  const statusBadge =
    challenge.user_status === 'completed'
      ? { variant: 'default' as const, text: 'Completed' }
      : challenge.user_status === 'active'
      ? { variant: 'secondary' as const, text: 'Active' }
      : { variant: 'outline' as const, text: 'Not Started' }
  const difficultyVariant =
    challenge.difficulty_level === 'easy'
      ? ('secondary' as const)
      : challenge.difficulty_level === 'hard'
      ? ('destructive' as const)
      : ('default' as const)
  const progressConfig =
    challenge.user_status === 'completed'
      ? { label: 'Completed', percentage: '100%', width: 100, color: 'rgb(34 197 94)' }
      : {
          label: 'Progress',
          percentage: `${completionRate}%`,
          width: completionRate,
          color: 'rgb(16 185 129)',
        }

  return (
    <Card
      className={
        challenge.user_status === 'completed'
          ? 'overflow-hidden bg-emerald-100/80 border-emerald-300 dark:bg-emerald-900/40 dark:border-emerald-600'
          : 'overflow-hidden'
      }
    >
      <div className="flex flex-col gap-6 p-4 md:p-6 md:flex-row">
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-2xl bg-emerald-500/10">
                {challenge.icon || '📿'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-1 flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg md:text-xl font-bold truncate">{challenge.title_bn}</h3>
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
              {!challenge.last_completed_at ? (
                <Badge variant="outline" className="text-xs">Not started</Badge>
              ) : completedToday ? (
                <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200 flex items-center gap-1 text-xs">
                  <CheckCircle2 className="h-3 w-3" />
                  Today at {format(new Date(challenge.last_completed_at), 'h:mm a')}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  {format(new Date(challenge.last_completed_at), 'MMM d, h:mm a')}
                </Badge>
              )}
            </div>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{challenge.description_bn}</p>
          <div className="flex flex-wrap gap-3 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{challenge.daily_target_count}x daily</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{challenge.total_days} days</span>
            </div>
          </div>
        </div>
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
                style={{ width: `${progressConfig.width}%`, backgroundColor: progressConfig.color }}
              />
            </div>
          </div>
          <div className="flex gap-2">
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
              <Button size="sm" variant="outline" asChild className="text-xs md:text-sm">
                <Link to={`/challenges/${challenge.id}/preview`}>
                  <Eye className="mr-1 h-3 w-3" />
                  Preview
                </Link>
              </Button>
            )}
            <Button size="sm" variant="outline" asChild className="text-xs md:text-sm">
              <Link to={`/challenges/${challenge.id}`}>
                <Edit className="mr-1 h-3 w-3" />
                Edit
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs md:text-sm"
              onClick={() => onDeleteChallenge(challenge.id)}
            >
              <Trash2 className="mr-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
