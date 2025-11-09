'use server'

import { EnhancedAIService as AIService } from '@/lib/ai/service'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { AIInsight, AIRecommendation, UserContext } from '@/lib/types/ai'
import { getDuas } from './duas'

export async function getAIRecommendations(userId: string): Promise<AIRecommendation[]> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured - AI recommendations unavailable')
      return []
    }

    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      throw new Error('Unauthorized')
    }

    const duas = await getDuas()

    const context: UserContext = {
      userId,
      currentTime: new Date(),
      recentActivities: [],
      preferences: {
        language: 'bn',
        difficulty: 'medium',
        categories: [],
      },
    }

    return await AIService.getSmartDuaRecommendations(context, duas)
  } catch (error) {
    console.error('Error getting AI recommendations:', error)
    return []
  }
}

export async function searchDuasWithAI(query: string): Promise<any[]> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured - AI search unavailable')
      return []
    }

    const duas = await getDuas()
    return await AIService.searchDuasNaturally(query, duas)
  } catch (error) {
    console.error('Error searching duas with AI:', error)
    return []
  }
}

export async function askIslamicQuestion(question: string): Promise<any> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured - AI chat unavailable')
      return {
        message: 'AI assistant is not available. Please configure OpenAI API key.',
        suggestions: [],
      }
    }

    const duas = await getDuas()
    return await AIService.askIslamicQuestion(question, duas)
  } catch (error) {
    console.error('Error asking Islamic question:', error)
    return {
      message: 'Sorry, I encountered an error. Please try again.',
      suggestions: [],
    }
  }
}

export async function getPersonalizedInsights(userId: string): Promise<AIInsight[]> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured - AI insights unavailable')
      return []
    }

    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      throw new Error('Unauthorized')
    }

    const context: UserContext = {
      userId,
      currentTime: new Date(),
      recentActivities: [],
      preferences: {
        language: 'bn',
        difficulty: 'medium',
        categories: [],
      },
    }

    // Mock user stats for now
    const userStats = {
      completionRate: 0.7,
      streak: 5,
      totalChallenges: 30,
    }

    return await AIService.generatePersonalizedInsights(context, userStats)
  } catch (error) {
    console.error('Error getting personalized insights:', error)
    return []
  }
}
