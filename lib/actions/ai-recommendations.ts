'use server'

import { EnhancedAIService } from '@/lib/ai/service'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function getAIRecommendations(userId: string) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured - AI recommendations unavailable')
      return []
    }

    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      throw new Error('Unauthorized')
    }

    return []
  } catch (error) {
    console.error('Error getting AI recommendations:', error)
    return []
  }
}

export async function searchDuasWithAI(query: string) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured - AI search unavailable')
      return []
    }

    return []
  } catch (error) {
    console.error('Error searching duas with AI:', error)
    return []
  }
}

export async function askIslamicQuestion(question: string, userId: string) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured - AI chat unavailable')
      return {
        message: 'AI assistant is not available. Please configure OpenAI API key.',
        suggestions: [],
      }
    }

    return await EnhancedAIService.askIslamicQuestionWithMCP(question, userId)
  } catch (error) {
    console.error('Error asking Islamic question:', error)
    return {
      message: 'Sorry, I encountered an error. Please try again.',
      suggestions: [],
    }
  }
}

export async function getPersonalizedInsights(userId: string) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured - AI insights unavailable')
      return []
    }

    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      throw new Error('Unauthorized')
    }

    return []
  } catch (error) {
    console.error('Error getting personalized insights:', error)
    return []
  }
}
