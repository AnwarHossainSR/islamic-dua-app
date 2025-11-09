import OpenAI from 'openai'
import { AIRecommendation, UserContext, AIInsight } from '@/lib/types/ai'
import { Dua } from '@/lib/types/duas'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export class AIService {
  static async getSmartDuaRecommendations(
    context: UserContext,
    availableDuas: Dua[]
  ): Promise<AIRecommendation[]> {
    const timeOfDay = this.getTimeOfDay(context.currentTime)
    const islamicTime = this.getIslamicTimeContext(context.currentTime)
    
    // Rule-based recommendations for better performance
    const recommendations: AIRecommendation[] = []
    
    // Time-based recommendations
    if (timeOfDay === 'morning') {
      const morningDuas = availableDuas.filter(d => 
        d.category.includes('morning') || 
        d.tags?.some(tag => ['morning', 'fajr', 'dawn'].includes(tag.toLowerCase()))
      )
      recommendations.push(...morningDuas.slice(0, 2).map(dua => ({
        id: dua.id,
        type: 'dua' as const,
        title: dua.title_bn,
        reason: 'Perfect for morning spiritual reflection',
        confidence: 0.9
      })))
    }
    
    if (timeOfDay === 'evening') {
      const eveningDuas = availableDuas.filter(d => 
        d.category.includes('evening') || 
        d.tags?.some(tag => ['evening', 'maghrib', 'sunset'].includes(tag.toLowerCase()))
      )
      recommendations.push(...eveningDuas.slice(0, 2).map(dua => ({
        id: dua.id,
        type: 'dua' as const,
        title: dua.title_bn,
        reason: 'Ideal for evening gratitude and reflection',
        confidence: 0.85
      })))
    }
    
    // Mood-based recommendations
    if (context.mood) {
      const moodDuas = this.getDuasForMood(context.mood, availableDuas)
      recommendations.push(...moodDuas.slice(0, 1).map(dua => ({
        id: dua.id,
        type: 'dua' as const,
        title: dua.title_bn,
        reason: `Recommended for your current mood: ${context.mood}`,
        confidence: 0.8
      })))
    }
    
    // Important duas
    const importantDuas = availableDuas.filter(d => d.is_important)
    if (importantDuas.length > 0) {
      const randomImportant = importantDuas[Math.floor(Math.random() * importantDuas.length)]
      recommendations.push({
        id: randomImportant.id,
        type: 'dua',
        title: randomImportant.title_bn,
        reason: 'Essential dua for every Muslim',
        confidence: 0.95
      })
    }
    
    return recommendations.slice(0, 5)
  }
  
  static async generatePersonalizedInsights(
    context: UserContext,
    userStats: any
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = []
    
    // Progress insights
    if (userStats.completionRate < 0.5) {
      insights.push({
        type: 'habit',
        title: 'Build Consistency',
        description: 'Try setting a specific time each day for your spiritual practices',
        actionable: true,
        priority: 'high'
      })
    }
    
    if (userStats.streak > 7) {
      insights.push({
        type: 'progress',
        title: 'Great Streak!',
        description: `You've maintained a ${userStats.streak}-day streak. Keep it up!`,
        actionable: false,
        priority: 'medium'
      })
    }
    
    return insights
  }
  
  static async searchDuasNaturally(query: string, duas: Dua[]): Promise<Dua[]> {
    const normalizedQuery = query.toLowerCase()
    
    // Simple keyword matching for now
    const keywords = normalizedQuery.split(' ')
    
    return duas.filter(dua => {
      const searchText = [
        dua.title_bn,
        dua.title_en,
        dua.translation_bn,
        dua.translation_en,
        dua.category,
        ...(dua.tags || [])
      ].join(' ').toLowerCase()
      
      return keywords.some(keyword => searchText.includes(keyword))
    }).slice(0, 10)
  }
  
  private static getTimeOfDay(date: Date): string {
    const hour = date.getHours()
    if (hour < 6) return 'night'
    if (hour < 12) return 'morning'
    if (hour < 18) return 'afternoon'
    return 'evening'
  }
  
  private static getIslamicTimeContext(date: Date): string {
    const hour = date.getHours()
    if (hour >= 5 && hour < 7) return 'fajr'
    if (hour >= 12 && hour < 15) return 'dhuhr'
    if (hour >= 15 && hour < 18) return 'asr'
    if (hour >= 18 && hour < 20) return 'maghrib'
    if (hour >= 20 || hour < 5) return 'isha'
    return 'general'
  }
  
  private static getDuasForMood(mood: string, duas: Dua[]): Dua[] {
    const moodKeywords: Record<string, string[]> = {
      anxious: ['peace', 'calm', 'anxiety', 'worry', 'stress'],
      sad: ['comfort', 'sadness', 'grief', 'healing', 'hope'],
      grateful: ['gratitude', 'thanks', 'blessing', 'appreciation'],
      seeking_guidance: ['guidance', 'decision', 'wisdom', 'direction'],
      happy: ['joy', 'celebration', 'success', 'achievement']
    }
    
    const keywords = moodKeywords[mood] || []
    
    return duas.filter(dua => {
      const searchText = [
        dua.title_bn,
        dua.title_en,
        dua.translation_bn,
        dua.benefits,
        ...(dua.tags || [])
      ].join(' ').toLowerCase()
      
      return keywords.some(keyword => searchText.includes(keyword))
    })
  }
}