export interface Challenge {
  id: string;
  title_bn: string;
  title_ar?: string;
  description_bn: string;
  arabic_text: string;
  transliteration_bn?: string;
  translation_bn: string;
  reference?: string;
  fazilat_bn?: string;
  icon?: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  daily_target_count: number;
  total_days: number;
  recommended_time?: string;
  recommended_prayer?: string;
  total_participants?: number;
  total_completions?: number;
  created_at?: string;
  updated_at?: string;
}
