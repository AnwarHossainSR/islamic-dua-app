export interface AIRecommendation {
  id: string
  type: 'dua' | 'challenge'
  title: string
  reason: string
  confidence: number
  metadata?: Record<string, any>
}

export interface UserContext {
  userId: string
  currentTime: Date
  location?: {
    latitude: number
    longitude: number
    timezone: string
  }
  recentActivities: string[]
  preferences: {
    language: 'bn' | 'en' | 'ar'
    difficulty: 'easy' | 'medium' | 'hard'
    categories: string[]
  }
  mood?: 'happy' | 'sad' | 'anxious' | 'grateful' | 'seeking_guidance'
}

export interface AIInsight {
  type: 'progress' | 'habit' | 'recommendation'
  title: string
  description: string
  actionable: boolean
  priority: 'low' | 'medium' | 'high'
}