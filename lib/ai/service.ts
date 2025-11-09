import { AIChatResponse, AIInsight, AIRecommendation, UserContext } from '@/lib/types/ai'
import { Dua } from '@/lib/types/duas'
import { apiLogger } from '@/lib/logger'
import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null

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
      const morningDuas = availableDuas.filter(
        d =>
          d.category.includes('morning') ||
          d.tags?.some(tag => ['morning', 'fajr', 'dawn'].includes(tag.toLowerCase()))
      )
      recommendations.push(
        ...morningDuas.slice(0, 2).map(dua => ({
          id: dua.id,
          type: 'dua' as const,
          title: dua.title_bn,
          reason: 'Perfect for morning spiritual reflection',
          confidence: 0.9,
        }))
      )
    }

    if (timeOfDay === 'evening') {
      const eveningDuas = availableDuas.filter(
        d =>
          d.category.includes('evening') ||
          d.tags?.some(tag => ['evening', 'maghrib', 'sunset'].includes(tag.toLowerCase()))
      )
      recommendations.push(
        ...eveningDuas.slice(0, 2).map(dua => ({
          id: dua.id,
          type: 'dua' as const,
          title: dua.title_bn,
          reason: 'Ideal for evening gratitude and reflection',
          confidence: 0.85,
        }))
      )
    }

    // Mood-based recommendations
    if (context.mood) {
      const moodDuas = this.getDuasForMood(context.mood, availableDuas)
      recommendations.push(
        ...moodDuas.slice(0, 1).map(dua => ({
          id: dua.id,
          type: 'dua' as const,
          title: dua.title_bn,
          reason: `Recommended for your current mood: ${context.mood}`,
          confidence: 0.8,
        }))
      )
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
        confidence: 0.95,
      })
    }

    // Use OpenAI for enhanced recommendations if available
    if (openai && recommendations.length < 3) {
      try {
        const aiRecommendations = await this.getAIEnhancedRecommendations(context, availableDuas)
        recommendations.push(...aiRecommendations)
      } catch (error) {
        await this.logOpenAIError('recommendations', error, { userId: context.userId })
      }
    }

    return recommendations.slice(0, 5)
  }

  private static async getAIEnhancedRecommendations(
    context: UserContext,
    duas: Dua[]
  ): Promise<AIRecommendation[]> {
    if (!openai) return []

    try {
      const timeContext = `Current time: ${context.currentTime.toLocaleString()}, Islamic time: ${this.getIslamicTimeContext(
        context.currentTime
      )}`
      const moodContext = context.mood ? `User mood: ${context.mood}` : ''

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an Islamic scholar. Based on the context, recommend 2 specific duas from this list. Return only the dua titles, one per line.\n\nAvailable duas: ${duas
              .map(d => d.title_bn)
              .join(', ')}`,
          },
          {
            role: 'user',
            content: `${timeContext}. ${moodContext}. What duas would you recommend?`,
          },
        ],
        max_tokens: 100,
        temperature: 0.5,
      })

      const recommendedTitles =
        completion.choices[0]?.message?.content?.split('\n').filter(Boolean) || []

      return recommendedTitles
        .map(title => {
          const matchedDua = duas.find(
            d => d.title_bn.includes(title.trim()) || title.trim().includes(d.title_bn)
          )
          if (matchedDua) {
            return {
              id: matchedDua.id,
              type: 'dua' as const,
              title: matchedDua.title_bn,
              reason: 'AI-recommended based on your current context',
              confidence: 0.85,
            }
          }
          return null
        })
        .filter(Boolean) as AIRecommendation[]
    } catch (error) {
      await this.logOpenAIError('enhanced_recommendations', error, { userId: context.userId })
      return []
    }
  }

  static async generatePersonalizedInsights(
    context: UserContext,
    userStats: any
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = []

    // Rule-based insights
    if (userStats.completionRate < 0.5) {
      insights.push({
        type: 'habit',
        title: 'Build Consistency',
        description: 'Try setting a specific time each day for your spiritual practices',
        actionable: true,
        priority: 'high',
      })
    }

    if (userStats.streak > 7) {
      insights.push({
        type: 'progress',
        title: 'Great Streak!',
        description: `You've maintained a ${userStats.streak}-day streak. Keep it up!`,
        actionable: false,
        priority: 'medium',
      })
    }

    // AI-enhanced insights
    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are an Islamic spiritual advisor. Provide 1-2 brief, actionable insights based on user stats. Keep responses under 50 words each.',
            },
            {
              role: 'user',
              content: `User stats: ${userStats.completionRate * 100}% completion rate, ${
                userStats.streak
              } day streak, ${userStats.totalChallenges} total challenges`,
            },
          ],
          max_tokens: 150,
          temperature: 0.7,
        })

        const aiInsight = completion.choices[0]?.message?.content
        if (aiInsight) {
          insights.push({
            type: 'recommendation',
            title: 'AI Spiritual Guidance',
            description: aiInsight,
            actionable: true,
            priority: 'medium',
          })
        }
      } catch (error) {
        await this.logOpenAIError('insights', error, { userId: context.userId })
      }
    }

    return insights
  }

  static async searchDuasNaturally(query: string, duas: Dua[]): Promise<Dua[]> {
    if (!openai) {
      // Fallback to simple keyword matching
      const normalizedQuery = query.toLowerCase()
      const keywords = normalizedQuery.split(' ')

      return duas
        .filter(dua => {
          const searchText = [
            dua.title_bn,
            dua.title_en,
            dua.translation_bn,
            dua.translation_en,
            dua.category,
            ...(dua.tags || []),
          ]
            .join(' ')
            .toLowerCase()

          return keywords.some(keyword => searchText.includes(keyword))
        })
        .slice(0, 10)
    }

    try {
      // Use OpenAI to understand the query better
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an Islamic scholar. Extract keywords from the user query to search for relevant duas. Return only comma-separated keywords.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
        max_tokens: 50,
        temperature: 0.3,
      })

      const aiKeywords =
        completion.choices[0]?.message?.content
          ?.toLowerCase()
          .split(',')
          .map(k => k.trim()) || []
      const userKeywords = query.toLowerCase().split(' ')
      const allKeywords = [...new Set([...aiKeywords, ...userKeywords])]

      return duas
        .filter(dua => {
          const searchText = [
            dua.title_bn,
            dua.title_en,
            dua.translation_bn,
            dua.translation_en,
            dua.category,
            ...(dua.tags || []),
          ]
            .join(' ')
            .toLowerCase()

          return allKeywords.some(keyword => searchText.includes(keyword))
        })
        .slice(0, 10)
    } catch (error) {
      await this.logOpenAIError('search', error, { query })
      // Fallback to simple search
      const normalizedQuery = query.toLowerCase()
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
  }

  static async askIslamicQuestion(question: string, availableDuas: Dua[]): Promise<AIChatResponse> {
    if (!openai) {
      return {
        message: 'AI assistant is not available. Please configure OpenAI API key.',
        suggestions: ['Configure API key to enable AI features'],
      }
    }

    try {
      const duasContext = availableDuas
        .slice(0, 20)
        .map(dua => `${dua.title_bn} (${dua.title_en}): ${dua.dua_text_ar} - ${dua.translation_bn}`)
        .join('\n')

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a knowledgeable Islamic scholar and assistant. Help users with Islamic questions, duas, prayers, and guidance. 

Available Duas in the database:\n${duasContext}\n\nProvide helpful, accurate Islamic guidance. If the user asks about specific duas or prayers, reference the available ones when relevant. Always be respectful and follow Islamic principles.`,
          },
          {
            role: 'user',
            content: question,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      })

      const response =
        completion.choices[0]?.message?.content ||
        'I apologize, but I could not generate a response.'

      // Find related duas based on the question (only if specifically asked)
      const relatedDuas = question.toLowerCase().includes('dua') || question.toLowerCase().includes('prayer') 
        ? this.findRelatedDuas(question, availableDuas) 
        : []

      // Generate follow-up suggestions
      const suggestions = this.generateSuggestions(question)

      return {
        message: response,
        suggestions,
        relatedDuas: relatedDuas.map(dua => ({
          id: dua.id,
          title: dua.title_bn,
          arabic: dua.dua_text_ar,
          translation: dua.translation_bn || dua.translation_en || '',
        })),
      }
    } catch (error) {
      const errorMessage = await this.getErrorMessage(error)
      await this.logOpenAIError('chat', error, { question })
      return {
        message: errorMessage,
        suggestions: ['Try rephrasing your question', 'Ask about specific duas or prayers'],
      }
    }
  }

  private static findRelatedDuas(question: string, duas: Dua[]): Dua[] {
    const keywords = question.toLowerCase().split(' ')
    const islamicKeywords = [
      'prayer',
      'dua',
      'fajr',
      'maghrib',
      'isha',
      'dhuhr',
      'asr',
      'morning',
      'evening',
      'travel',
      'food',
      'sleep',
      'anxiety',
      'peace',
    ]

    const relevantKeywords = keywords.filter(k =>
      islamicKeywords.some(ik => k.includes(ik) || ik.includes(k))
    )

    if (relevantKeywords.length === 0) return []

    return duas
      .filter(dua => {
        const searchText = [
          dua.title_bn,
          dua.title_en,
          dua.translation_bn,
          dua.category,
          ...(dua.tags || []),
        ]
          .join(' ')
          .toLowerCase()

        return relevantKeywords.some(keyword => searchText.includes(keyword))
      })
      .slice(0, 3)
  }

  private static generateSuggestions(question: string): string[] {
    const suggestions = [
      'What dua should I recite before eating?',
      'Tell me about Fajr prayer',
      'What are the benefits of morning dhikr?',
      'How to perform wudu properly?',
      'What dua for traveling?',
      'Evening duas and their benefits',
    ]

    // Return random suggestions, avoiding similar to current question
    return suggestions
      .filter(s => !s.toLowerCase().includes(question.toLowerCase().split(' ')[0]))
      .slice(0, 3)
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
      happy: ['joy', 'celebration', 'success', 'achievement'],
    }

    const keywords = moodKeywords[mood] || []

    return duas.filter(dua => {
      const searchText = [
        dua.title_bn,
        dua.title_en,
        dua.translation_bn,
        dua.benefits,
        ...(dua.tags || []),
      ]
        .join(' ')
        .toLowerCase()

      return keywords.some(keyword => searchText.includes(keyword))
    })
  }

  private static async logOpenAIError(operation: string, error: any, context: any) {
    const errorDetails = {
      operation,
      error: error.message || error.toString(),
      context,
      timestamp: new Date().toISOString()
    }
    
    apiLogger.error(`OpenAI ${operation} error`, errorDetails)
  }

  private static async getErrorMessage(error: any): Promise<string> {
    if (error?.error?.code === 'insufficient_quota') {
      return '⚠️ AI service quota exceeded. Please try again later or contact support.'
    }
    if (error?.error?.code === 'rate_limit_exceeded') {
      return '⚠️ Too many requests. Please wait a moment and try again.'
    }
    if (error?.error?.code === 'invalid_api_key') {
      return '⚠️ AI service configuration error. Please contact support.'
    }
    if (error?.error?.type === 'server_error') {
      return '⚠️ AI service is temporarily unavailable. Please try again in a few minutes.'
    }
    return '⚠️ I encountered an error while processing your request. Please try again.'
  }
}
