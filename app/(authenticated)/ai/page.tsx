import { AIRecommendations } from '@/components/ai/ai-recommendations'
import { SmartSearch } from '@/components/ai/smart-search'
import { AIStatusWarning } from '@/components/ai/ai-status-warning'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Sparkles, Search, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AIPage() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in to access AI features.</div>
  }

  const hasOpenAIKey = !!process.env.OPENAI_API_KEY

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-8 w-8 text-purple-500" />
          AI Assistant
        </h1>
        <p className="text-muted-foreground">
          Get personalized recommendations and smart insights for your spiritual journey
        </p>
      </div>

      {/* Warning for missing API key */}
      {!hasOpenAIKey && <AIStatusWarning />}

      {/* Features Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Smart Recommendations
            </CardTitle>
            <CardDescription>
              Get personalized dua and challenge suggestions based on your habits and preferences
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5 text-blue-500" />
              Natural Search
            </CardTitle>
            <CardDescription>
              Search for duas using natural language like "dua for anxiety" or "morning prayers"
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Personal Insights
            </CardTitle>
            <CardDescription>
              Receive intelligent insights about your spiritual progress and habits
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* AI Components */}
      {hasOpenAIKey ? (
        <div className="grid gap-8 lg:grid-cols-2">
          <AIRecommendations userId={user.id} />
          <SmartSearch />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3 opacity-50 pointer-events-none">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Smart Recommendations
              </CardTitle>
              <CardDescription>
                Configure API key to enable personalized recommendations
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Search className="h-5 w-5 text-blue-500" />
                Natural Search
              </CardTitle>
              <CardDescription>
                Configure API key to enable intelligent search
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Personal Insights
              </CardTitle>
              <CardDescription>
                Configure API key to enable progress insights
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}
    </div>
  )
}