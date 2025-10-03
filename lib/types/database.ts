export type Category = {
  id: string
  name_bn: string
  name_ar: string | null
  name_en: string | null
  slug: string
  icon: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Tag = {
  id: string
  name_bn: string
  name_ar: string | null
  name_en: string | null
  slug: string
  created_at: string
}

export type Dua = {
  id: string
  category_id: string | null
  title_bn: string
  title_ar: string | null
  title_en: string | null
  arabic_text: string
  transliteration_bn: string | null
  translation_bn: string
  translation_en: string | null
  reference: string | null
  audio_url: string | null
  is_featured: boolean
  is_active: boolean
  view_count: number
  created_at: string
  updated_at: string
}

export type DuaWithDetails = Dua & {
  category?: Category
  tags?: Tag[]
  fazilat?: Fazilat[]
}

export type Fazilat = {
  id: string
  dua_id: string
  text_bn: string
  text_ar: string | null
  text_en: string | null
  reference: string | null
  display_order: number
  created_at: string
}

export type DhikrPreset = {
  id: string
  name_bn: string
  name_ar: string | null
  name_en: string | null
  arabic_text: string
  transliteration_bn: string | null
  translation_bn: string
  target_count: number
  is_default: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export type UserBookmark = {
  id: string
  user_id: string
  dua_id: string
  created_at: string
}

export type UserPreferences = {
  id: string
  user_id: string
  language: string
  theme: string
  font_size: string
  show_transliteration: boolean
  show_translation: boolean
  auto_play_audio: boolean
  created_at: string
  updated_at: string
}

export type AdminUser = {
  id: string
  user_id: string
  email: string
  role: "super_admin" | "admin" | "editor"
  is_active: boolean
  created_at: string
  updated_at: string
}
