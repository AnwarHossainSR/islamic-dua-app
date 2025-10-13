import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getChallenges } from '@/lib/actions/challenges'
import { Calendar, Plus, Target, Trophy, Users } from 'lucide-react'
import Link from 'next/link'

export default async function AdminChallengesPage() {
  const challenges = await getChallenges()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold">Manage Daily Challenges</h1>
          <p className="text-muted-foreground">
            Create and manage daily dhikr challenges for users
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/challenges/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Challenge
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {challenges.map(challenge => (
          <Card key={challenge.id} className="relative overflow-hidden">
            {challenge.is_featured && (
              <div className="absolute right-0 top-0">
                <Badge className="rounded-bl-lg rounded-tr-lg">Featured</Badge>
              </div>
            )}

            <CardHeader>
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="text-3xl">{challenge.icon || '📿'}</div>
                <Badge
                  variant={
                    challenge.difficulty_level === 'easy'
                      ? 'secondary'
                      : challenge.difficulty_level === 'hard'
                      ? 'destructive'
                      : 'default'
                  }
                >
                  {challenge.difficulty_level}
                </Badge>
              </div>

              <CardTitle className="text-xl">{challenge.title_bn}</CardTitle>
              {challenge.title_ar && (
                <CardDescription className="arabic-text text-base">
                  {challenge.title_ar}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="arabic-text text-xl leading-loose">{challenge.arabic_text}</div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>{challenge.daily_target_count}x daily</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{challenge.total_days} days</span>
                </div>
                {challenge.recommended_prayer && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">🕌</span>
                    <span>After {challenge.recommended_prayer}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 border-t pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{challenge.total_participants || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  <span>{challenge.total_completions || 0}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" asChild className="flex-1">
                  <Link href={`/admin/challenges/${challenge.id}`}>Edit</Link>
                </Button>
                <Button size="sm" variant="outline" asChild className="flex-1">
                  <Link href={`/challenges/${challenge.id}`}>Preview</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {challenges.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-muted-foreground">No challenges created yet</p>
            <Button asChild>
              <Link href="/admin/challenges/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Challenge
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
