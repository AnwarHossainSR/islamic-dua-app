'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateActivityCount } from '@/lib/actions/admin'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Calendar,
  Flame,
  Minus,
  Plus,
  RotateCcw,
  RotateCw,
  Save,
  Trophy,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface ActivityDetailsPageProps {
  activity: any
  topUsers: any[]
}

export default function ActivityDetailsPageClient({
  activity,
  topUsers,
}: ActivityDetailsPageProps) {
  const [currentCount, setCurrentCount] = useState(activity.total_count)
  const [inputValue, setInputValue] = useState(activity.total_count.toString())
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  )

  const avgPerUser = activity.total_users > 0 ? Math.round(currentCount / activity.total_users) : 0

  const handleAddCount = async (amount: number) => {
    setIsLoading(true)
    setFeedback(null)
    try {
      const result: any = await updateActivityCount(activity.id, amount, 'add')
      if (result.success) {
        setCurrentCount(result.newCount)
        setInputValue(result.newCount.toString())
        setFeedback({ type: 'success', message: `Added ${amount}. New count: ${result.newCount}` })
      } else {
        setFeedback({ type: 'error', message: result.error || 'Update failed' })
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Something went wrong' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubtractCount = async (amount: number) => {
    setIsLoading(true)
    setFeedback(null)
    try {
      const result: any = await updateActivityCount(activity.id, amount, 'subtract')
      if (result.success) {
        setCurrentCount(result.newCount)
        setInputValue(result.newCount.toString())
        setFeedback({
          type: 'success',
          message: `Subtracted ${amount}. New count: ${result.newCount}`,
        })
      } else {
        setFeedback({ type: 'error', message: result.error || 'Update failed' })
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Something went wrong' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetCustomCount = async () => {
    const newCount = parseInt(inputValue, 10)
    if (isNaN(newCount) || newCount < 0) {
      setFeedback({ type: 'error', message: 'Please enter a valid number' })
      return
    }

    setIsLoading(true)
    setFeedback(null)
    try {
      const result = await updateActivityCount(activity.id, newCount, 'set')
      if (result.success) {
        setCurrentCount(result.newCount)
        setFeedback({ type: 'success', message: `Count set to ${result.newCount}` })
      } else {
        setFeedback({ type: 'error', message: result.error || 'Update failed' })
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Something went wrong' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setInputValue(currentCount.toString())
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/activities">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{activity.name_bn}</h1>
          <p className="text-muted-foreground">{activity.name_en || activity.name_ar}</p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Trophy className="mb-2 h-8 w-8 text-amber-500" />
              <p className="text-3xl font-bold">{currentCount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Completions</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Users className="mb-2 h-8 w-8 text-blue-500" />
              <p className="text-3xl font-bold">{activity.total_users}</p>
              <p className="text-xs text-muted-foreground">Unique Users</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <RotateCcw className="mb-2 h-8 w-8 text-emerald-500" />
              <p className="text-3xl font-bold">{avgPerUser.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Avg per User</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Calendar className="mb-2 h-8 w-8 text-purple-500" />
              <p className="text-3xl font-bold">{activity.challenges?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Linked Challenges</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Counter Update */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-1">
        <div className="relative rounded-2xl bg-slate-950 p-8 backdrop-blur-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Manual Count Management
            </h2>
            <p className="text-slate-400">Adjust the dhikir count as needed</p>
          </div>

          {/* Current Count Display */}
          <div className="mb-8 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-6 border border-emerald-500/20">
            <p className="text-sm font-medium text-slate-300 mb-2">Current Count</p>
            <p className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              {currentCount.toLocaleString()}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Quick Actions
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <button
                onClick={() => handleSubtractCount(10)}
                disabled={isLoading}
                className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-red-500 to-pink-500 p-0.5 transition-all hover:shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="relative rounded-lg bg-slate-950 px-4 py-3 transition-all group-hover:bg-slate-900 flex items-center justify-center gap-2">
                  <Minus className="h-4 w-4 text-red-400" />
                  <span className="font-semibold text-red-400">10</span>
                </div>
              </button>

              <button
                onClick={() => handleAddCount(10)}
                disabled={isLoading}
                className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 p-0.5 transition-all hover:shadow-lg hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="relative rounded-lg bg-slate-950 px-4 py-3 transition-all group-hover:bg-slate-900 flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4 text-emerald-400" />
                  <span className="font-semibold text-emerald-400">10</span>
                </div>
              </button>

              <button
                onClick={() => handleAddCount(100)}
                disabled={isLoading}
                className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 p-0.5 transition-all hover:shadow-lg hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="relative rounded-lg bg-slate-950 px-4 py-3 transition-all group-hover:bg-slate-900 flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4 text-emerald-400" />
                  <span className="font-semibold text-emerald-400">100</span>
                </div>
              </button>

              <button
                onClick={() => handleSubtractCount(100)}
                disabled={isLoading}
                className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-red-500 to-pink-500 p-0.5 transition-all hover:shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="relative rounded-lg bg-slate-950 px-4 py-3 transition-all group-hover:bg-slate-900 flex items-center justify-center gap-2">
                  <Minus className="h-4 w-4 text-red-400" />
                  <span className="font-semibold text-red-400">100</span>
                </div>
              </button>
            </div>
          </div>

          {/* Custom Input Section */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Set Custom Count
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  disabled={isLoading}
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-lg font-semibold text-emerald-400 placeholder-slate-500 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                  placeholder="Enter new count"
                />
              </div>
              <button
                onClick={handleReset}
                disabled={isLoading || inputValue === currentCount.toString()}
                className="rounded-lg bg-slate-800 px-4 py-3 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 hover:border-slate-600"
              >
                <RotateCw className="h-5 w-5" />
              </button>
              <button
                onClick={handleSetCustomCount}
                disabled={isLoading}
                className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 p-0.5 transition-all hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="relative rounded-lg bg-slate-950 px-6 py-3 transition-all group-hover:bg-slate-900 flex items-center justify-center gap-2">
                  <Save className="h-5 w-5 text-purple-400" />
                  <span className="font-semibold text-purple-400">Save</span>
                </div>
              </button>
            </div>
          </div>

          {/* Feedback Message */}
          {feedback && (
            <div
              className={`mb-6 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 animate-in fade-in slide-in-from-top-2'
                  : 'bg-red-500/10 border-red-500/30 text-red-300 animate-in fade-in slide-in-from-top-2'
              }`}
            >
              {feedback.message}
            </div>
          )}

          {/* Footer Info */}
          <div className="border-t border-slate-700 pt-4">
            <p className="text-xs text-slate-500">
              Last updated just now • All changes are saved automatically
            </p>
          </div>
        </div>
      </div>
      {/* Activity Content */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg text-3xl"
              style={{ backgroundColor: activity.color + '20' || '#10b98120' }}
            >
              {activity.icon || '📿'}
            </div>
            <div>
              <Badge variant="secondary" className="mb-2">
                {activity.activity_type || 'dhikr'}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Slug: <code className="bg-muted px-2 py-1 rounded">{activity.unique_slug}</code>
              </p>
            </div>
          </div>

          {activity.arabic_text && activity.arabic_text !== 'none' && (
            <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950">
              <p className="arabic-text text-center text-3xl leading-loose">
                {activity.arabic_text}
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium mb-1">Bangla</p>
              <p className="text-sm text-muted-foreground">{activity.name_bn}</p>
            </div>
            {activity.name_ar && (
              <div>
                <p className="text-sm font-medium mb-1">Arabic</p>
                <p className="arabic-text text-sm text-muted-foreground">{activity.name_ar}</p>
              </div>
            )}
            {activity.name_en && (
              <div>
                <p className="text-sm font-medium mb-1">English</p>
                <p className="text-sm text-muted-foreground">{activity.name_en}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Linked Challenges */}
      {activity.challenges && activity.challenges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Linked Challenges</CardTitle>
            <CardDescription>Challenges that contribute to this activity's stats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activity.challenges.map((challenge: any) => (
                <div
                  key={challenge.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl shrink-0">{challenge.icon || '📿'}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium truncate">{challenge.title_bn}</h3>
                      <p className="text-sm text-muted-foreground">
                        {challenge.daily_target_count}x daily • {challenge.total_days} days
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <Badge variant={challenge.is_active ? 'default' : 'secondary'}>
                      {challenge.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/challenges/${challenge.id}`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Users Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Top Contributors
          </CardTitle>
          <CardDescription>Users with the most completions</CardDescription>
        </CardHeader>
        <CardContent>
          {topUsers.length > 0 ? (
            <div className="space-y-3">
              {topUsers.map((user: any, index: number) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={index < 3 ? 'default' : 'outline'}
                      className="h-8 w-8 flex items-center justify-center rounded-full text-sm font-bold shrink-0"
                    >
                      #{index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">User {user.user_id.slice(0, 8)}...</p>
                      {user.last_completed_at && (
                        <p className="text-xs text-muted-foreground">
                          Last: {format(new Date(user.last_completed_at), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600">
                        {user.total_completed.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">completions</p>
                    </div>
                    {user.longest_streak > 0 && (
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Flame className="h-4 w-4 text-orange-500" />
                          <span className="text-lg font-bold text-orange-600">
                            {user.longest_streak}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">streak</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">
              No users have completed this activity yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
