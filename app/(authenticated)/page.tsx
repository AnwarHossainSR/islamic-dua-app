import { AIRecommendations } from '@/components/ai/ai-recommendations'
import { SmartSearch } from '@/components/ai/smart-search'
import { DashboardClient } from '@/components/dashboard-client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAdminActivityStats, getTopActivitiesAction } from '@/lib/actions/admin'
import { getUserRole } from '@/lib/actions/auth'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { formatNumber } from '@/lib/utils'
import { Activity, Brain, Flame, Target, TrendingUp, Trophy, Users } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function DashboardContent() {
  const stats = await getAdminActivityStats()
  const topActivities = await getTopActivitiesAction(5)

  return (
    <>
      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActivities}</div>
            <p className="text-xs text-muted-foreground">Activities completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Completions</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalCompletions)}</div>
            <p className="text-xs text-muted-foreground">Total dhikr completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak Days</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActiveUsers}</div>
            <p className="text-xs text-muted-foreground">Days active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Challenges</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeChallenges}</div>
            <p className="text-xs text-muted-foreground">Challenges joined</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Activities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Top Activities</CardTitle>
              <CardDescription>Your most practiced dhikr and prayers</CardDescription>
            </div>
            <Button asChild variant="outline">
              <Link href="/activities">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topActivities.map((activity: any, index: number) => (
              <div
                key={activity.id}
                className="flex items-center justify-between border-b border-border pb-4 last:border-0"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Badge variant="outline" className="text-xs font-bold">
                    #{index + 1}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium truncate">{activity.name_bn}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.name_ar || activity.name_en}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-3">
                  <div className="text-right">
                    <p className="text-x md:text-2xl font-bold">
                      {formatNumber(activity.total_count)}
                    </p>
                    <p className="text-xs text-muted-foreground">completions</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-xs">
                      <Users className="mr-1 h-3 w-3" />
                      {activity.total_users}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}

            {topActivities.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                No activity data yet. Start challenges to see statistics.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Today's Progress
            </CardTitle>
            <CardDescription>Your completions today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(stats.todayCompletions)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.todayCompletions > (stats.yesterdayCompletions || 0) ? (
                <span className="text-emerald-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {(
                    ((stats.todayCompletions - (stats.yesterdayCompletions || 0)) /
                      Math.max(stats.yesterdayCompletions || 1, 1)) *
                    100
                  ).toFixed(0)}
                  % increase from yesterday
                </span>
              ) : (
                <span>Keep up the good work!</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              This Week
            </CardTitle>
            <CardDescription>Your weekly progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(stats.weekCompletions || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average {Math.round((stats.weekCompletions || 0) / 7)} per day
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your spiritual journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button asChild className="h-auto flex-col gap-2 py-4">
              <Link href="/challenges">
                <Target className="h-6 w-6" />
                <span>Join Challenges</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent">
              <Link href="/activities">
                <Activity className="h-6 w-6" />
                <span>View Activities</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent">
              <Link href="/duas">
                <TrendingUp className="h-6 w-6" />
                <span>Browse Duas</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto flex-col gap-2 py-4 bg-transparent border-purple-200 hover:bg-purple-50"
            >
              <Link href="/ai">
                <Brain className="h-6 w-6 text-purple-500" />
                <span>AI Assistant</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default async function Dashboard() {
  const userRole = await getUserRole()
  const stats = await getAdminActivityStats()
  const topActivities = await getTopActivitiesAction(5)
  const isSuperAdmin = userRole === 'super_admin'

  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="space-y-8">
      {/* AI Features Section */}
      {user && process.env.OPENAI_API_KEY && (
        <div className="grid gap-6 lg:grid-cols-2">
          <AIRecommendations userId={user.id} />
          <SmartSearch />
        </div>
      )}

      <DashboardClient
        isSuperAdmin={isSuperAdmin}
        initialStats={stats}
        initialTopActivities={topActivities}
      />
    </div>
  )
}
