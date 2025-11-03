import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getUserActivities, getUserChallengeStats } from '@/lib/actions/user-activities'
import { Activity, ArrowLeft, Search, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'

export default async function ActivitiesPage() {
  const [userActivities, challengeStats] = await Promise.all([
    getUserActivities(),
    getUserChallengeStats()
  ])

  // Calculate user's total stats
  const totalCompletions = userActivities.reduce((sum, a) => sum + (a?.total_completed || 0), 0)
  const totalActivities = userActivities.length
  const avgPerActivity = totalActivities > 0 ? Math.round(totalCompletions / totalActivities) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-4xl font-bold">My Activities</h1>
          <p className="text-muted-foreground">
            Track your personal dhikr, prayers, and activities progress
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">My Completions</p>
                <p className="text-3xl font-bold">{totalCompletions.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Days Completed</p>
                <p className="text-3xl font-bold">{challengeStats.totalDaysCompleted}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Longest Streak</p>
                <p className="text-3xl font-bold">{challengeStats.longestStreak}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search activities..." className="pl-10" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My Activities List */}
      <div className="space-y-4">
        {userActivities.map((userActivity, index) => {
          const activity = userActivity?.activity
          if (!activity) return null
          
          const completionRate = userActivity?.total_completed || 0

          return (
            <Card key={activity.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row gap-6 p-6">
                {/* Left: Activity Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-2xl"
                      style={{ backgroundColor: (activity?.color || '#10b981') + '20' }}
                    >
                      {activity?.icon || '📿'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-xl font-bold truncate">{activity?.name_bn || 'Unknown Activity'}</h3>
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                      {activity?.name_ar && (
                        <p className="arabic-text text-muted-foreground text-sm mb-1">
                          {activity.name_ar}
                        </p>
                      )}
                      {activity?.name_en && (
                        <p className="text-sm text-muted-foreground">{activity.name_en}</p>
                      )}
                      {activity?.arabic_text && activity.arabic_text !== 'none' && (
                        <p className="arabic-text text-lg mt-2 text-emerald-700 dark:text-emerald-400">
                          {activity.arabic_text}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm">
                    <Badge variant="secondary">{activity?.activity_type || 'dhikr'}</Badge>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Slug:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {activity?.unique_slug || 'unknown'}
                      </code>
                    </div>
                  </div>
                </div>

                {/* Right: Stats */}
                <div className="flex flex-col justify-between gap-4 md:w-72">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border bg-muted/50 p-3 text-center">
                      <p className="text-2xl font-bold text-emerald-600">
                        {(userActivity?.total_completed || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">My Count</p>
                    </div>
                    <div className="rounded-lg border bg-muted/50 p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-2xl font-bold text-blue-600">
                          {userActivity?.longest_streak || 0}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Best Streak</p>
                    </div>
                  </div>

                  {/* Average per user */}
                  <div className="rounded-lg border bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950 dark:to-blue-950 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Last Completed</span>
                      <span className="text-sm font-medium">
                        {userActivity?.last_completed_at 
                          ? new Date(userActivity.last_completed_at).toLocaleDateString()
                          : 'Never'
                        }
                      </span>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href={`/activities/${activity.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            </Card>
          )
        }).filter(Boolean)}

        {userActivities.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Activity className="mb-4 h-16 w-16 text-muted-foreground" />
              <p className="mb-2 text-lg font-semibold">No activities yet</p>
              <p className="mb-4 text-sm text-muted-foreground">
                Start completing challenges to see your activity stats here
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Activity className="h-5 w-5" />
            About Activity Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-200">
          <ul className="list-disc list-inside space-y-1">
            <li>Your personal activity stats are updated when you complete daily challenges</li>
            <li>Stats show your individual progress and achievements</li>
            <li>Track your completion counts, streaks, and progress over time</li>
            <li>My Count shows your total completions for each activity</li>
            <li>Best Streak shows your longest consecutive completion streak</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
