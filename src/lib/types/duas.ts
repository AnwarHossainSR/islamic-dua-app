export interface Dua {
  id: string;
  title_bn: string;
  title_ar?: string;
  title_en?: string;
  dua_text_ar: string;
  translation_bn?: string;
  translation_en?: string;
  transliteration?: string;
  category: string;
  source?: string;
  reference?: string;
  benefits?: string;
  is_important: boolean;
  is_active: boolean;
  tags?: string[];
  audio_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DuaCategory {
  id: string;
  name_bn: string;
  name_ar?: string;
  name_en?: string;
  description?: string;
  icon?: string;
  color: string;
  is_active: boolean;
}

export interface DuaStats {
  total: number;
  important: number;
  byCategory: Record<string, number>;
}
