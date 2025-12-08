export interface Challenge {
  id: string;
  title_bn: string;
  title_ar?: string;
  title_en?: string;
  description_bn?: string;
  arabic_text: string;
  translation_bn: string;
  daily_target_count: number;
  total_days: number;
  icon?: string;
  color?: string;
  is_featured: boolean;
  total_participants: number;
  userProgress?: UserChallengeProgress;
}

export interface UserChallengeProgress {
  id: string;
  user_id: string;
  challenge_id: string;
  current_day: number;
  status: "active" | "completed" | "paused";
  current_streak: number;
  total_completed_days: number;
  missed_days: number;
  started_at: number;
  last_completed_at?: number;
  completed_at?: number;
}

export interface DailyLog {
  id: string;
  day_number: number;
  completion_date: string;
  count_completed: number;
  target_count: number;
  is_completed: boolean;
  completed_at?: number;
}

export interface Activity {
  id: string;
  name_bn: string;
  name_ar?: string;
  unique_slug: string;
  total_count: number;
  total_users: number;
  icon?: string;
  color?: string;
}

export interface UserActivityStats {
  id: string;
  activity_stat_id: string;
  total_completed: number;
  current_streak: number;
  longest_streak: number;
  last_completed_at?: number;
  activity?: Activity;
}

export interface Dua {
  id: string;
  title_bn: string;
  title_ar?: string;
  dua_text_ar: string;
  translation_bn?: string;
  transliteration?: string;
  category: string;
  source?: string;
  reference?: string;
  benefits?: string;
  is_important: boolean;
  audio_url?: string;
}

export interface User {
  id: string;
  email: string;
  role?: string;
}
