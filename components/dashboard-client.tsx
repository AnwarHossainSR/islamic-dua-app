'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardToggle } from '@/components/dashboard-toggle'
import { formatNumber } from '@/lib/utils'
import { Activity, Flame, Target, TrendingUp, Trophy, Users } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface DashboardClientProps {
  isSuperAdmin: boolean
  initialStats: any
  initialTopActivities: any[]
}

export function DashboardClient({ isSuperAdmin, initialStats, initialTopActivities }: DashboardClientProps) {
  const [showGlobalStats, setShowGlobalStats] = useState(false)
  const [stats, setStats] = useState(initialStats)
  const [topActivities, setTopActivities] = useState(initialTopActivities)
  const [loading, setLoading] = useState(false)

  const handleToggle = async (showGlobal: boolean) => {
    setShowGlobalStats(showGlobal)
    setLoading(true)
    
    try {
      const response = await fetch('/api/dashboard/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showGlobal })
      })
      
      const data = await response.json()
      setStats(data.stats)
      setTopActivities(data.topActivities)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold">Your Dashboard</h1>
          <p className="text-muted-foreground">Track your spiritual journey and progress</p>
        </div>
        {isSuperAdmin && (
          <DashboardToggle onToggle={handleToggle} />
        )}
      </div>

      {/* Stats Grid */}
      <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-4 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        <Card className="relative">
          {loading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {showGlobalStats ? 'Total Activities' : 'Your Activities'}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActivities}</div>
            <p className="text-xs text-muted-foreground">
              {showGlobalStats ? 'System-wide activities' : 'Activities completed'}
            </p>
          </CardContent>
        </Card>

        <Card className="relative">
          {loading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {showGlobalStats ? 'Total Completions' : 'Your Completions'}
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalCompletions)}</div>
            <p className="text-xs text-muted-foreground">
              {showGlobalStats ? 'All-time completions' : 'Total dhikr completed'}
            </p>
          </CardContent>
        </Card>

        <Card className="relative">
          {loading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {showGlobalStats ? 'Active Users' : 'Streak Days'}
            </CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActiveUsers}</div>
            <p className="text-xs text-muted-foreground">
              {showGlobalStats ? 'Participating users' : 'Days active'}
            </p>
          </CardContent>
        </Card>

        <Card className="relative">
          {loading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {showGlobalStats ? 'Active Challenges' : 'Your Challenges'}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeChallenges}</div>
            <p className="text-xs text-muted-foreground">
              {showGlobalStats ? 'Ongoing challenges' : 'Challenges joined'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Activities */}
      <Card className="relative">
        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {showGlobalStats ? 'Top Activities' : 'Your Top Activities'}
              </CardTitle>
              <CardDescription>
                {showGlobalStats ? 'Most completed dhikr and prayers' : 'Your most practiced dhikr and prayers'}
              </CardDescription>
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
        <Card className="relative">
          {loading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              {showGlobalStats ? "Today's Activity" : "Today's Progress"}
            </CardTitle>
            <CardDescription>
              {showGlobalStats ? 'Completions in the last 24 hours' : 'Your completions today'}
            </CardDescription>
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

        <Card className="relative">
          {loading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              This Week
            </CardTitle>
            <CardDescription>
              {showGlobalStats ? 'Completions in the last 7 days' : 'Your weekly progress'}
            </CardDescription>
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}