import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getAllActivities } from '@/lib/actions/admin'
import { Activity, ArrowLeft, Search, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'

export default async function AdminActivitiesPage() {
  const activities = await getAllActivities()

  // Calculate total stats
  const totalCompletions = activities.reduce((sum, a) => sum + (a.total_count || 0), 0)
  const totalUsers = activities.reduce((sum, a) => sum + (a.total_users || 0), 0)
  const avgPerActivity =
    activities.length > 0 ? Math.round(totalCompletions / activities.length) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-4xl font-bold">Activity Statistics</h1>
          <p className="text-muted-foreground">
            Track all dhikr, prayers, and activities completed by users
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Completions</p>
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
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-3xl font-bold">{totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg per Activity</p>
                <p className="text-3xl font-bold">{avgPerActivity.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
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

      {/* Activities List */}
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const completionRate =
            activity.total_users > 0 ? Math.round(activity.total_count / activity.total_users) : 0

          return (
            <Card key={activity.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row gap-6 p-6">
                {/* Left: Activity Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-2xl"
                      style={{ backgroundColor: activity.color + '20' || '#10b98120' }}
                    >
                      {activity.icon || '📿'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-xl font-bold truncate">{activity.name_bn}</h3>
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                      {activity.name_ar && (
                        <p className="arabic-text text-muted-foreground text-sm mb-1">
                          {activity.name_ar}
                        </p>
                      )}
                      {activity.name_en && (
                        <p className="text-sm text-muted-foreground">{activity.name_en}</p>
                      )}
                      {activity.arabic_text && activity.arabic_text !== 'none' && (
                        <p className="arabic-text text-lg mt-2 text-emerald-700 dark:text-emerald-400">
                          {activity.arabic_text}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm">
                    <Badge variant="secondary">{activity.activity_type || 'dhikr'}</Badge>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Slug:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {activity.unique_slug}
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
                        {activity.total_count.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Total Count</p>
                    </div>
                    <div className="rounded-lg border bg-muted/50 p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-2xl font-bold text-blue-600">
                          {activity.total_users}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Users</p>
                    </div>
                  </div>

                  {/* Average per user */}
                  <div className="rounded-lg border bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950 dark:to-blue-950 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Avg per User</span>
                      <span className="text-lg font-bold">{completionRate.toLocaleString()}</span>
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
        })}

        {activities.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Activity className="mb-4 h-16 w-16 text-muted-foreground" />
              <p className="mb-2 text-lg font-semibold">No activities yet</p>
              <p className="mb-4 text-sm text-muted-foreground">
                Activities will appear here when users complete challenges
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
            <li>Activity stats are automatically created when you create a new challenge</li>
            <li>Stats are updated in real-time when users complete daily challenge logs</li>
            <li>Multiple challenges can be linked to the same activity</li>
            <li>Total count shows all-time completions across all users</li>
            <li>Users count shows unique participants who completed this activity</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
