'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { updateActivityCount } from '@/lib/actions/admin'
import { format } from 'date-fns'
import { ArrowLeft, Calendar, Flame, RotateCcw, Trophy, Users, X } from 'lucide-react'
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
  const { toast } = useToast()
  const [currentCount, setCurrentCount] = useState(activity.total_count)
  const [inputValue, setInputValue] = useState(activity.total_count.toString())
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const avgPerUser = activity.total_users > 0 ? Math.round(currentCount / activity.total_users) : 0

  const handleSetCustomCount = async () => {
    const newCount = parseInt(inputValue, 10)
    if (isNaN(newCount) || newCount < 0) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a valid non-negative number.',
        variant: 'destructive',
      })
    }

    setIsLoading(true)

    try {
      const result = await updateActivityCount(activity.id, newCount)
      if (result.success) {
        setCurrentCount(result.newCount)
        toast({
          title: 'Success',
          description: 'Activity count updated successfully.',
        })
        setShowModal(false)
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Update failed',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while updating the activity count.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setInputValue(currentCount.toString())
  }

  const handleQuickAdjust = (amount: number) => {
    const current = parseInt(inputValue, 10)
    const newValue = Math.max(0, current + amount)
    setInputValue(newValue.toString())
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

      {/* Manual Counter Update - Compact */}
      <div className="space-y-2">
        <div className="rounded-lg bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Count Display */}
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs text-slate-500">Count</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {currentCount.toLocaleString()}
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowModal(true)}
              disabled={isLoading}
              className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              Add Custom Count
            </Button>
          </div>
        </div>
      </div>

      {/* Modal for Custom Count */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Adjust Count</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Current Display */}
              <div className="bg-slate-800 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400 mb-1">Current</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {currentCount.toLocaleString()}
                </p>
              </div>

              {/* Quick Level Buttons */}
              <div>
                <p className="text-xs text-slate-400 mb-2 font-semibold uppercase">Quick Adjust</p>
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    onClick={() => handleQuickAdjust(-10)}
                    disabled={isLoading}
                    className="px-2 py-2 rounded-md bg-red-900/30 hover:bg-red-900/50 text-red-400 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    -10
                  </Button>
                  <Button
                    onClick={() => handleQuickAdjust(-50)}
                    disabled={isLoading}
                    className="px-2 py-2 rounded-md bg-red-900/30 hover:bg-red-900/50 text-red-400 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    -50
                  </Button>
                  <Button
                    onClick={() => handleQuickAdjust(50)}
                    disabled={isLoading}
                    className="px-2 py-2 rounded-md bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    +50
                  </Button>
                  <Button
                    onClick={() => handleQuickAdjust(10)}
                    disabled={isLoading}
                    className="px-2 py-2 rounded-md bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    +10
                  </Button>
                </div>
              </div>

              {/* Custom Input */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Custom Value</label>
                <input
                  type="number"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-medium outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                  placeholder="Enter count"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleReset}
                  disabled={isLoading || inputValue === currentCount.toString()}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors disabled:opacity-50 flex-1"
                >
                  Reset
                </Button>
                <Button
                  onClick={() => setShowModal(false)}
                  disabled={isLoading}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors disabled:opacity-50 flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSetCustomCount}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors disabled:opacity-50 flex-1"
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
