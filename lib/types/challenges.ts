// Database schema types (what comes from Drizzle)
export interface ChallengeTemplateFromDB {
  id: string
  title_bn: string
  title_ar: string | null
  title_en: string | null
  description_bn: string | null
  description_ar: string | null
  description_en: string | null
  arabic_text: string
  transliteration_bn: string | null
  translation_bn: string
  translation_en: string | null
  daily_target_count: number | null
  total_days: number | null
  recommended_time: string | null
  recommended_prayer: string | null
  reference: string | null
  fazilat_bn: string | null
  fazilat_ar: string | null
  fazilat_en: string | null
  difficulty_level: string | null
  icon: string | null
  color: string | null
  display_order: number | null
  is_featured: boolean | null
  is_active: boolean | null
  total_participants: number | null
  total_completions: number | null
  created_at: Date | null
  updated_at: Date | null
}

export interface UserChallengeProgressFromDB {
  id: string
  user_id: string
  challenge_id: string
  current_day: number | null
  status: string | null
  current_streak: number | null
  longest_streak: number | null
  total_completed_days: number | null
  missed_days: number | null
  started_at: Date | null
  last_completed_at: Date | null
  completed_at: Date | null
  paused_at: Date | null
  daily_reminder_enabled: boolean | null
  reminder_time: string | null
  created_at: Date | null
  updated_at: Date | null
}

// Client types (what we use in components)
export interface Challenge {
  id: string
  title_bn: string
  title_ar?: string
  title_en?: string
  description_bn?: string
  icon?: string
  color?: string
  difficulty_level: 'easy' | 'medium' | 'hard'
  is_active: boolean
  is_featured: boolean
  total_participants: number
  total_completions: number
  total_days: number
  daily_target_count: number
  recommended_prayer?: string
  last_completed_at?: string
  user_status: 'not_started' | 'active' | 'paused' | 'completed'
  progress_id?: string
  completed_at?: string
  total_completed_days: number
  current_day: number
  completion_percentage?: number
}

export interface RecentLog {
  id: string
  day_number: number
  count_completed: number
  completed_at: string
  is_completed: boolean
  user_progress?: {
    challenge?: {
      icon?: string
      title_bn: string
    }
  }
}