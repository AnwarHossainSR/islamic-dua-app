import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAdminActivityStats, getTopActivities } from '@/lib/actions/admin'
import { Activity, Flame, Target, TrendingUp, Trophy, Users } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  try {
    const stats = await getAdminActivityStats()
    const topActivities = await getTopActivities(5)

    return (
      <div className="space-y-8">
        <div>
          <h1 className="mb-2 text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor user activities and challenge progress</p>
        </div>

        {/* Stats Grid - Activity Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalActivities}</div>
              <p className="text-xs text-muted-foreground">Tracked activities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Completions</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCompletions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All-time completions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalActiveUsers}</div>
              <p className="text-xs text-muted-foreground">Participating users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Challenges</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeChallenges}</div>
              <p className="text-xs text-muted-foreground">Ongoing challenges</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Activities */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Activities</CardTitle>
                <CardDescription>Most completed dhikr and prayers</CardDescription>
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
                    {/* <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-xl shrink-0"
                    style={{ backgroundColor: activity.color + '20' || '#10b98120' }}
                  >
                    {activity.icon || '📿'}
                  </div> */}
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
                        {activity.total_count.toLocaleString()}
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

        {/* Recent Challenge Stats */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Today's Activity
              </CardTitle>
              <CardDescription>Completions in the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.todayCompletions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.todayCompletions > stats.yesterdayCompletions ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {(
                      ((stats.todayCompletions - stats.yesterdayCompletions) /
                        Math.max(stats.yesterdayCompletions, 1)) *
                      100
                    ).toFixed(0)}
                    % increase from yesterday
                  </span>
                ) : (
                  <span>Activity tracking active</span>
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
              <CardDescription>Completions in the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.weekCompletions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Average {Math.round(stats.weekCompletions / 7)} per day
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Button asChild className="h-auto flex-col gap-2 py-4">
                <Link href="/challenges/new">
                  <Target className="h-6 w-6" />
                  <span>Create Challenge</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-auto flex-col gap-2 py-4 bg-transparent"
              >
                <Link href="/challenges">
                  <Activity className="h-6 w-6" />
                  <span>Manage Challenges</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-auto flex-col gap-2 py-4 bg-transparent"
              >
                <Link href="/activities">
                  <TrendingUp className="h-6 w-6" />
                  <span>View Activities</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('Dashboard error:', error)
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-red-600">Error Loading Dashboard</h1>
        <p className="text-gray-600">Please check the console for details.</p>
      </div>
    )
  }
}
