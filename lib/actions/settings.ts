'use server'

import { checkPermission, getUser } from '@/lib/actions/auth'
import { PERMISSIONS } from '@/lib/permissions/constants'
import { getSupabaseAdminServerClient, getSupabaseServerClient } from '@/lib/supabase/server'

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

export async function getAppSettings(category?: string): Promise<AppSetting[]> {
  const supabase = await getSupabaseServerClient()

  let query = supabase.from('app_settings').select('*').order('category, label')

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function updateAppSetting(key: string, value: any): Promise<void> {
  await checkPermission(PERMISSIONS.SETTINGS_UPDATE)
  const supabase = getSupabaseAdminServerClient()

  const { error } = await supabase.from('app_settings').update({ value }).eq('key', key)

  if (error) throw error
}

export async function getUserSettings(): Promise<Record<string, any>> {
  const supabase = await getSupabaseServerClient()
  const user = await getUser()

  if (!user) return {}

  const { data, error } = await supabase
    .from('user_settings')
    .select('key, value')
    .eq('user_id', user.id)

  if (error) throw error

  const settings: Record<string, any> = {}
  data?.forEach(setting => {
    settings[setting.key] = setting.value
  })

  return settings
}

export async function updateUserSetting(key: string, value: any): Promise<void> {
  const supabase = await getSupabaseServerClient()
  const user = await getUser()

  if (!user) throw new Error('User not authenticated')

  const { error } = await supabase.from('user_settings').upsert({
    user_id: user.id,
    key,
    value,
  })

  if (error) throw error
}
