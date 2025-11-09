'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles, Brain, TrendingUp } from 'lucide-react'
import { AIRecommendation, AIInsight } from '@/lib/types/ai'
import { getAIRecommendations, getPersonalizedInsights } from '@/lib/actions/ai-recommendations'

interface AIRecommendationsProps {
  userId: string
}

export function AIRecommendations({ userId }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAIData()
  }, [userId])

  const loadAIData = async () => {
    try {
      setLoading(true)
      const [recs, ins] = await Promise.all([
        getAIRecommendations(userId),
        getPersonalizedInsights(userId)
      ])
      setRecommendations(recs)
      setInsights(ins)
    } catch (error) {
      console.error('Error loading AI data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-24 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Smart Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.length === 0 ? (
              <p className="text-muted-foreground">No recommendations available at the moment.</p>
            ) : (
              recommendations.map((rec) => (
                <div key={rec.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground">{rec.reason}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {Math.round(rec.confidence * 100)}% match
                    </Badge>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            Personal Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.length === 0 ? (
              <p className="text-muted-foreground">Keep using the app to get personalized insights!</p>
            ) : (
              insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <TrendingUp className={`h-4 w-4 mt-1 ${
                    insight.priority === 'high' ? 'text-red-500' :
                    insight.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'
                  }`} />
                  <div className="flex-1">
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={insight.type === 'progress' ? 'default' : 'secondary'}>
                        {insight.type}
                      </Badge>
                      {insight.actionable && (
                        <Badge variant="outline">Actionable</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}