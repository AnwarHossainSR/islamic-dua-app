export type SalahType = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'tahajjud' | 'chasht' | 'ishraq' | 'nafal'

export interface SalahAmol {
  id: string
  name_bn: string
  name_en?: string
  description_bn?: string
  description_en?: string
  arabic_text?: string
  transliteration?: string
  translation_bn?: string
  translation_en?: string
  repetition_count: number
  salah_type: SalahType
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
  amol_id: string
  completed_date: string
  notes?: string
  created_at: string
  updated_at: string
  amol?: SalahAmol
}

export interface AmolFormData {
  name_bn: string
  name_en?: string
  description_bn?: string
  description_en?: string
  arabic_text?: string
  transliteration?: string
  translation_bn?: string
  translation_en?: string
  repetition_count: number
  salah_type: SalahType
  reward_points: number
  is_required: boolean
}

export const SALAH_TYPES: Record<SalahType, { name_bn: string; name_en: string; icon: string; color: string }> = {
  fajr: { name_bn: 'ফজর', name_en: 'Fajr', icon: '🌅', color: '#f59e0b' },
  dhuhr: { name_bn: 'যোহর', name_en: 'Dhuhr', icon: '☀️', color: '#eab308' },
  asr: { name_bn: 'আসর', name_en: 'Asr', icon: '🌇', color: '#f97316' },
  maghrib: { name_bn: 'মাগরিব', name_en: 'Maghrib', icon: '🌆', color: '#e11d48' },
  isha: { name_bn: 'এশা', name_en: 'Isha', icon: '🌙', color: '#7c3aed' },
  tahajjud: { name_bn: 'তাহাজ্জুদ', name_en: 'Tahajjud', icon: '🌌', color: '#1e40af' },
  chasht: { name_bn: 'চাশত', name_en: 'Chasht', icon: '🌤️', color: '#059669' },
  ishraq: { name_bn: 'ইশরাক', name_en: 'Ishraq', icon: '🌄', color: '#dc2626' },
  nafal: { name_bn: 'নফল', name_en: 'Nafal', icon: '🤲', color: '#6366f1' }
}