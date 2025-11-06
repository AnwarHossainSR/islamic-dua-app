export interface SalahPrayer {
  id: string
  name_bn: string
  name_ar?: string
  name_en?: string
  prayer_time: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'
  description_bn?: string
  description_ar?: string
  description_en?: string
  icon: string
  color: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  amols?: SalahAmol[]
}

export interface SalahAmol {
  id: string
  salah_prayer_id: string
  name_bn: string
  name_en?: string
  description_bn?: string
  description_en?: string
  reward_points: number
  is_required: boolean
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserSalahProgress {
  id: string
  user_id: string
  salah_prayer_id: string
  completed_date: string
  completed_amols: string[]
  total_amols: number
  completion_percentage: number
  notes?: string
  created_at: string
  updated_at: string
  salah_prayer?: SalahPrayer
}

export interface UserSalahStats {
  id: string
  user_id: string
  total_prayers_completed: number
  total_amols_completed: number
  current_streak: number
  longest_streak: number
  last_completed_at?: string
  created_at: string
  updated_at: string
}

export interface SalahFormData {
  name_bn: string
  name_ar?: string
  name_en?: string
  prayer_time: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'
  description_bn?: string
  description_ar?: string
  description_en?: string
  icon: string
  color: string
  is_active: boolean
  sort_order: number
}

export interface AmolFormData {
  salah_prayer_id: string
  name_en: string
  name_bn?: string
  description_en?: string
  description_bn?: string
  reward_points: number
  is_required: boolean
}