import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { format, isToday } from 'date-fns'

import { ActionButton } from '@/components/ui/action-button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { deleteChallengeTemplate, getChallenges, getRecentLogs } from '@/lib/actions/challenges'
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  Edit,
  Eye,
  Plus,
  Search,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react'
import Link from 'next/link'

export default async function AdminChallengesPage() {
  const challenges = await getChallenges()

  // Calculate overall stats
  const totalChallenges = challenges.length
  const totalParticipants = challenges.reduce((sum, c) => sum + (c.total_participants || 0), 0)
  const totalCompletions = challenges.reduce((sum, c) => sum + (c.total_completions || 0), 0)
  const totalDays = challenges.reduce((sum, c) => sum + c.total_days, 0)
  const avgCompletionRate =
    totalParticipants > 0 ? Math.round((totalCompletions / totalDays) * 100) : 0

  const recentLogs = await getRecentLogs(10)

  function getLastCompletedBadge(lastCompletedAt: string | null) {
    if (!lastCompletedAt) {
      return (
        <Badge variant="outline" className="text-xs">
          Not started
        </Badge>
      )
    }

    const date = new Date(lastCompletedAt)
    const completedToday = isToday(date)

    if (completedToday) {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200 flex items-center gap-1 text-xs">
          <CheckCircle2 className="h-3 w-3" />
          Today at {format(date, 'h:mm a')}
        </Badge>
      )
    }

    return (
      <Badge variant="secondary" className="text-xs">
        {format(date, 'MMM d, h:mm a')}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div>
        <div className="mb-4">
          <h1 className="mb-2 text-4xl font-bold">Challenge Management</h1>
          <p className="text-muted-foreground">
            Manage daily dhikr challenges and track user progress
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/challenges/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Challenge
          </Link>
        </Button>
      </div>

      {/* Quick Stats Cards - Collapsible on Mobile */}
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
                      <p className="text-3xl font-bold">{totalChallenges}</p>
                    </div>
                    <Target className="h-8 w-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Participants</p>
                      <p className="text-3xl font-bold">{totalParticipants}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completions</p>
                      <p className="text-3xl font-bold">{totalCompletions}</p>
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
                      <p className="text-3xl font-bold">{avgCompletionRate}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </details>
        </div>

        {/* Stats always visible on desktop */}
        <div className="hidden md:grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Challenges</p>
                  <p className="text-3xl font-bold">{totalChallenges}</p>
                </div>
                <Target className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Participants</p>
                  <p className="text-3xl font-bold">{totalParticipants}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completions</p>
                  <p className="text-3xl font-bold">{totalCompletions}</p>
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
                  <p className="text-3xl font-bold">{avgCompletionRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Tabs */}
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
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search challenges..."
                      className="pl-10 text-xs md:text-sm w-full"
                    />
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Select defaultValue="all">
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
                  <Select defaultValue="all">
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

          {/* Challenges Table/Grid */}
          <div className="space-y-4">
            {challenges.map(challenge => {
              const completionRate =
                challenge.total_completions > 0
                  ? Math.round((challenge.total_completions / challenge.total_days) * 100)
                  : 0
              return (
                <Card key={challenge.id} className="overflow-hidden">
                  <div className="flex flex-col gap-6 p-4 md:p-6 md:flex-row">
                    {/* Left: Challenge Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div
                            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-2xl"
                            style={{ backgroundColor: challenge.color + '20' || '#10b98120' }}
                          >
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
                            </div>
                            {challenge.title_ar && (
                              <p className="arabic-text text-muted-foreground text-sm truncate">
                                {challenge.title_ar}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end shrink-0">
                          <Badge
                            variant={
                              challenge.difficulty_level === 'easy'
                                ? 'secondary'
                                : challenge.difficulty_level === 'hard'
                                ? 'destructive'
                                : 'default'
                            }
                            className="text-xs"
                          >
                            {challenge.difficulty_level}
                          </Badge>
                          {getLastCompletedBadge(challenge.last_completed_at)}
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
                      {/* Stats */}
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
                              {challenge.total_completions || 0}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                      </div>

                      {/* Completion Rate */}
                      <div className="rounded-lg border bg-muted/50 p-3">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Completion Rate</span>
                          <span className="font-bold">{completionRate}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-emerald-500 transition-all"
                            style={{ width: `${completionRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="flex-1 text-xs md:text-sm"
                        >
                          <Link href={`/admin/challenges/${challenge.id}/preview`}>
                            <Eye className="mr-1 h-3 w-3" />
                            Preview
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="flex-1 text-xs md:text-sm"
                        >
                          <Link href={`/admin/challenges/${challenge.id}`}>
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Link>
                        </Button>
                        <ActionButton
                          action={deleteChallengeTemplate}
                          actionParams={[challenge.id]}
                          title="Delete Challenge"
                          description="Are you sure you want to delete this challenge? This action cannot be undone."
                          confirmText="Delete"
                          confirmVariant="destructive"
                        />
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
                  <p className="mb-2 text-lg font-semibold">No challenges yet</p>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Create your first challenge to get started
                  </p>
                  <Button asChild>
                    <Link href="/admin/challenges/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Challenge
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Active Users Tab */}
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Participants</CardTitle>
              <CardDescription>Users currently participating in challenges</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-muted-foreground">
                Active user tracking coming soon... (Start a challenge to see data here)
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest challenge completions</CardDescription>
            </CardHeader>
            <CardContent>
              {recentLogs && recentLogs.length > 0 ? (
                <div className="space-y-3">
                  {recentLogs.map((log: any) => (
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
                            {log.user_progress?.challenge?.title_bn || 'Unknown Challenge'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            Day {log.day_number} • {log.count_completed} repetitions •{' '}
                            {format(new Date(log.completed_at), 'PPpp')}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={log.is_completed ? 'default' : 'secondary'}
                        className="shrink-0 ml-2"
                      >
                        {log.is_completed ? '✓ Completed' : 'In Progress'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  No recent activity. Complete some days to see logs here.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg md:text-base">Top Performing Challenges</CardTitle>
                <CardDescription className="text-xs md:text-sm">By completion rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {challenges
                    .filter(c => (c.total_participants || 0) > 0)
                    .sort((a, b) => {
                      const rateA = ((a.total_completions || 0) / (a.total_participants || 1)) * 100
                      const rateB = ((b.total_completions || 0) / (b.total_participants || 1)) * 100
                      return rateB - rateA
                    })
                    .slice(0, 5)
                    .map(challenge => {
                      const rate = Math.round(
                        ((challenge.total_completions || 0) / (challenge.total_days || 1)) * 100
                      )
                      return (
                        <div key={challenge.id} className="flex items-center gap-2 min-w-0">
                          <span className="text-lg md:text-xl shrink-0">
                            {challenge.icon || '📿'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{challenge.title_bn}</p>
                            <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full bg-emerald-500"
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm font-bold shrink-0">{rate}%</span>
                        </div>
                      )
                    }) || (
                    <p className="text-sm text-muted-foreground">
                      No data yet—start challenges to see rankings.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg md:text-base">Most Popular</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  By participant count
                </CardDescription>
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
                          <span className="text-lg md:text-xl shrink-0">
                            {challenge.icon || '📿'}
                          </span>
                          <p className="text-sm font-medium truncate">{challenge.title_bn}</p>
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          {challenge.total_participants || 0} users
                        </Badge>
                      </div>
                    )) || (
                    <p className="text-sm text-muted-foreground">
                      No data yet—start challenges to see popularity.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
