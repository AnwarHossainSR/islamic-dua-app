import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getSalahPrayers, getUserSalahData } from '@/lib/actions/salah'
import { formatNumber } from '@/lib/utils'
import { Clock, Plus, Target, TrendingUp } from 'lucide-react'
import Link from 'next/link'

const prayerTimeLabels: Record<string, string> = {
  fajr: 'ফজর',
  dhuhr: 'যোহর',
  asr: 'আসর',
  maghrib: 'মাগরিব',
  isha: 'এশা',
}

export default async function SalahPage() {
  const [prayers, userData] = await Promise.all([getSalahPrayers(), getUserSalahData()])

  const stats = userData.stats || {
    total_prayers_completed: 0,
    total_amols_completed: 0,
    current_streak: 0,
    longest_streak: 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">সালাহ আমল</h1>
          <p className="text-muted-foreground">প্রত্যেক সালাতের পর টেনশন-দুশ্চিন্তা দূর করার আমল</p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="lg">
            <Link href="/salah/add-amol">
              <Plus className="mr-2 h-4 w-4" />
              নতুন আমল যোগ করুন
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">সম্পূর্ণ সালাহ</p>
                <p className="text-3xl font-bold">
                  {formatNumber(stats?.total_prayers_completed || 0)}
                </p>
              </div>
              <Target className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">মোট আমল</p>
                <p className="text-3xl font-bold">
                  {formatNumber(stats?.total_amols_completed || 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">বর্তমান ধারা</p>
                <p className="text-3xl font-bold">{stats.current_streak}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">সর্বোচ্চ ধারা</p>
                <p className="text-3xl font-bold">{stats.longest_streak}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prayer Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {prayers.map(prayer => {
          const userProgress = userData.progress.find(p => p.salah_prayer_id === prayer.id)
          const completionPercentage = userProgress?.completion_percentage || 0

          return (
            <Card key={prayer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
                      style={{ backgroundColor: prayer.color + '20' }}
                    >
                      {prayer.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{prayer.name_bn}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">
                        {prayerTimeLabels[prayer.prayer_time] || prayer.prayer_time}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {prayer.description_bn && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {prayer.description_bn}
                  </p>
                )}

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>অগ্রগতি</span>
                    <span>{completionPercentage}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${completionPercentage}%`,
                        backgroundColor: prayer.color || '#10b981',
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button asChild className="flex-1" size="sm">
                    <Link href={`/salah/${prayer.id}`}>আমল শুরু করুন</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/salah/${prayer.id}/edit`}>সম্পাদনা</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {prayers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Target className="mb-4 h-16 w-16 text-muted-foreground" />
            <p className="mb-2 text-lg font-semibold">কোনো সালাহ আমল নেই</p>
            <p className="mb-4 text-sm text-muted-foreground">নতুন সালাহ আমল যোগ করে শুরু করুন</p>
            <Button asChild>
              <Link href="/salah/add-amol">
                <Plus className="mr-2 h-4 w-4" />
                প্রথম আমল যোগ করুন
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
