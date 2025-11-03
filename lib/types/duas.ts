// Database schema types (what comes from Drizzle)
export interface DuaFromDB {
  id: string
  title_bn: string
  title_ar: string | null
  title_en: string | null
  dua_text_ar: string
  translation_bn: string | null
  translation_en: string | null
  transliteration: string | null
  category: string
  source: string | null
  reference: string | null
  benefits: string | null
  is_important: boolean | null
  is_active: boolean | null
  tags: string | null
  audio_url: string | null
  created_by: string | null
  created_at: Date | null
  updated_at: Date | null
}

export interface DuaCategoryFromDB {
  id: string
  name_bn: string
  name_ar: string | null
  name_en: string | null
  description: string | null
  icon: string | null
  color: string | null
  is_active: boolean | null
  created_at: Date | null
}

// Client types (what we use in components)
export interface Dua {
  id: string
  title_bn: string
  title_ar?: string
  title_en?: string
  dua_text_ar: string
  translation_bn?: string
  translation_en?: string
  transliteration?: string
  category: string
  source?: string
  reference?: string
  benefits?: string
  is_important: boolean
  is_active: boolean
  tags?: string[]
  audio_url?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface DuaCategory {
  id: string
  name_bn: string
  name_ar?: string
  name_en?: string
  description?: string
  icon?: string
  color: string
  is_active: boolean
}

export interface DuaStats {
  total: number
  important: number
  byCategory: Record<string, number>
}