// Database schema types (what comes from Drizzle)
export interface AppSettingFromDB {
  id: string
  key: string
  value: string | null
  category: string
  type: string
  label: string
  description: string | null
  is_public: boolean | null
  created_at: Date | null
  updated_at: Date | null
}

export interface UserSettingFromDB {
  id: string
  user_id: string
  key: string
  value: string | null
  created_at: Date | null
  updated_at: Date | null
}

// Client types (what we use in components)
export interface AppSetting {
  id: string
  key: string
  value: any
  category: string
  type: string
  label: string
  description?: string
  is_public: boolean
}

export interface UserSetting {
  key: string
  value: any
}

export interface SettingsGroup {
  [category: string]: AppSetting[]
}