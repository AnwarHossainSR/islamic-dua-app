'use server'

import { checkPermission, getUser } from '@/lib/actions/auth'
import { PERMISSIONS } from '@/lib/permissions/constants'
import { getAppSettings as getAppSettingsQuery, updateAppSetting as updateAppSettingQuery, getUserSettings as getUserSettingsQuery, updateUserSetting as updateUserSettingQuery } from '../db/queries/settings'
import { apiLogger } from '@/lib/logger'

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
  try {
    const data = await getAppSettingsQuery(category)
    return data.map(setting => ({
      id: setting.id,
      key: setting.key,
      value: setting.value ? (typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value) : null,
      category: setting.category,
      type: setting.type,
      label: setting.label,
      description: setting.description || undefined,
      is_public: setting.isPublic || false,
    }))
  } catch (error) {
    apiLogger.error('Error fetching app settings with Drizzle', { error, category })
    return []
  }
}

export async function updateAppSetting(key: string, value: any): Promise<void> {
  await checkPermission(PERMISSIONS.SETTINGS_UPDATE)
  
  try {
    await updateAppSettingQuery(key, value)
  } catch (error) {
    apiLogger.error('Error updating app setting with Drizzle', { error, key })
    throw error
  }
}

export async function getUserSettings(): Promise<Record<string, any>> {
  const user = await getUser()

  if (!user) return {}

  try {
    const data = await getUserSettingsQuery(user.id)
    const settings: Record<string, any> = {}
    data.forEach(setting => {
      settings[setting.key] = setting.value ? (typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value) : null
    })
    return settings
  } catch (error) {
    apiLogger.error('Error fetching user settings with Drizzle', { error, userId: user.id })
    return {}
  }
}

export async function updateUserSetting(key: string, value: any): Promise<void> {
  const user = await getUser()

  if (!user) throw new Error('User not authenticated')

  try {
    await updateUserSettingQuery(user.id, key, value)
  } catch (error) {
    apiLogger.error('Error updating user setting with Drizzle', { error, userId: user.id, key })
    throw error
  }
}
