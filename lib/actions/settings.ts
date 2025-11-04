'use server'

import { checkPermission, getUser } from '@/lib/actions/auth'
import { apiLogger } from '@/lib/logger'
import { PERMISSIONS } from '@/lib/permissions/constants'
import { getAppSettings as getAppSettingsQuery, getUserSettings as getUserSettingsQuery, updateAppSetting as updateAppSettingQuery, updateUserSetting as updateUserSettingQuery } from '../db/queries/settings'
import { AppSetting, UserSetting } from '@/lib/types/settings'

export async function getAppSettings(category?: string): Promise<AppSetting[]> {
  try {
    const data = await getAppSettingsQuery(category)
    return data.map(setting => {
      let parsedValue = null
      if (setting.value) {
        try {
          parsedValue = JSON.parse(setting.value)
        } catch {
          parsedValue = setting.value
        }
      }
      
      return {
        id: setting.id,
        key: setting.key,
        value: parsedValue,
        category: setting.category,
        type: setting.type,
        label: setting.label,
        description: setting.description || undefined,
        is_public: setting.is_public ?? false,
      }
    })
  } catch (error) {
    apiLogger.error('Error fetching app settings with Drizzle', { error, category })
    return []
  }
}

export async function updateAppSetting(key: string, value: any): Promise<void> {
  await checkPermission(PERMISSIONS.SETTINGS_UPDATE)
  
  try {
    const result = await updateAppSettingQuery(key, value)
    if (!result || result.length === 0) {
      throw new Error(`Setting with key '${key}' not found`)
    }
  } catch (error) {
    apiLogger.error('Error updating app setting with Drizzle', { error, key, value })
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
      let parsedValue = null
      if (setting.value) {
        try {
          parsedValue = JSON.parse(setting.value)
        } catch {
          parsedValue = setting.value
        }
      }
      settings[setting.key] = parsedValue
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
    apiLogger.error('Error updating user setting with Drizzle', { error, userId: user.id, key, value })
    throw error
  }
}
