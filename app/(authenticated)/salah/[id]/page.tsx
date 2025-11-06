'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getSalahPrayerDetails,
  getUserSalahData,
  markAmolCompleted,
  unmarkAmolCompleted,
} from '@/lib/actions/salah'
import { SalahAmol, SalahPrayer, UserSalahProgress } from '@/lib/types/salah'
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'
import { use, useEffect, useState } from 'react'

const prayerTimeLabels: Record<string, string> = {
  fajr: 'ফজর',
  dhuhr: 'যোহর',
  asr: 'আসর',
  maghrib: 'মাগরিব',
  isha: 'এশা',
}

export default function SalahDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [prayer, setPrayer] = useState<SalahPrayer | null>(null)
  const [userProgress, setUserProgress] = useState<UserSalahProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const isNewRoute = id === 'new'

  useEffect(() => {
    console.log('id:', id, 'isNewRoute:', isNewRoute)
    if (id && id !== 'new') {
      loadData()
    } else {
      setLoading(false)
    }
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [prayerData, userData] = await Promise.all([
        getSalahPrayerDetails(id),
        getUserSalahData(),
      ])

      setPrayer(prayerData as unknown as SalahPrayer)
      setUserProgress(
        (userData.progress as UserSalahProgress[]).find(p => p.salah_prayer_id === id) || null
      )
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAmolToggle = async (amolId: string, isCompleted: boolean) => {
    setActionLoading(amolId)
    try {
      if (isCompleted) {
        await markAmolCompleted(id, amolId)
      } else {
        await unmarkAmolCompleted(id, amolId)
      }
      await loadData()
    } catch (error) {
      console.error('Error toggling amol:', error)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Check for 'new' route first
  console.log('Render check - isNewRoute:', isNewRoute, 'loading:', loading, 'prayer:', !!prayer)
  if (isNewRoute) {
    console.log('Showing new route message')
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-lg font-semibold mb-2">নতুন সালাহ আমল তৈরি করুন</p>
        <p className="text-muted-foreground mb-4">এই ফিচারটি শীঘ্রই আসছে</p>
        <Button asChild>
          <Link href="/salah">
            <ArrowLeft className="mr-2 h-4 w-4" />
            ফিরে যান
          </Link>
        </Button>
      </div>
    )
  }

  // Then check if prayer exists (only for non-'new' routes)
  if (!prayer && !isNewRoute) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-lg font-semibold mb-2">সালাহ আমল পাওয়া যায়নি</p>
        <Button asChild>
          <Link href="/salah">
            <ArrowLeft className="mr-2 h-4 w-4" />
            ফিরে যান
          </Link>
        </Button>
      </div>
    )
  }

  const completedAmols = (userProgress?.completed_amols as string[]) || []
  const completionPercentage = userProgress?.completion_percentage || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/salah">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
            style={{ backgroundColor: prayer?.color + '20' }}
          >
            {prayer?.icon}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{prayer?.name_bn}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{prayerTimeLabels[prayer?.prayer_time || ''] || prayer?.prayer_time}</Badge>
              <Badge variant={completionPercentage === 100 ? 'default' : 'secondary'}>
                {completionPercentage}% সম্পূর্ণ
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {prayer?.description_bn && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">{prayer?.description_bn}</p>
          </CardContent>
        </Card>
      )}

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            আজকের অগ্রগতি
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                {completedAmols.length} / {prayer?.amols?.length || 0} আমল সম্পূর্ণ
              </span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${completionPercentage}%`,
                  backgroundColor: prayer?.color,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amols List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">আমল সমূহ</h2>

        {prayer?.amols?.map((amol: SalahAmol, index: number) => {
          const isCompleted = completedAmols.includes(amol.id)
          const isLoading = actionLoading === amol.id

          return (
            <Card
              key={amol.id}
              className={`transition-all ${
                isCompleted
                  ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800'
                  : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {index + 1}
                    </span>
                    <Checkbox
                      checked={isCompleted}
                      disabled={isLoading}
                      onCheckedChange={checked => handleAmolToggle(amol.id, checked as boolean)}
                    />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{amol.name_bn}</h3>
                      {isCompleted && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                    </div>

                    {amol.description_bn && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm">{amol.description_bn}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="outline">{amol.reward_points} পয়েন্ট</Badge>
                      {amol.is_required && <Badge variant="secondary">আবশ্যক</Badge>}
                    </div>


                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {completionPercentage === 100 && (
        <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mb-2">
                আলহামদুলিল্লাহ! আজকের আমল সম্পূর্ণ
              </h3>
              <p className="text-emerald-700 dark:text-emerald-300">আল্লাহ আপনার আমল কবুল করুন</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
