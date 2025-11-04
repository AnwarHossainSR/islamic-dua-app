import { eq, asc, and } from 'drizzle-orm'
import { db } from '../index'
import { appSettings, userSettings } from '../schema'
import { seedDefaultSettings } from '../seed-settings'

export async function getAppSettings(category?: string) {
  try {
    const baseQuery = db.select().from(appSettings)

    let result
    if (category) {
      result = await baseQuery
        .where(eq(appSettings.category, category))
        .orderBy(asc(appSettings.category), asc(appSettings.label))
    } else {
      result = await baseQuery.orderBy(asc(appSettings.category), asc(appSettings.label))
    }

    // If no settings found and no category specified, seed default settings
    if (result.length === 0 && !category) {
      await seedDefaultSettings()
      // Retry the query after seeding
      result = await baseQuery.orderBy(asc(appSettings.category), asc(appSettings.label))
    }

    return result
  } catch (error) {
    console.error('Error in getAppSettings:', error)
    throw error
  }
}

export async function updateAppSetting(key: string, value: any) {
  return await db
    .update(appSettings)
    .set({ value: JSON.stringify(value), updated_at: new Date() })
    .where(eq(appSettings.key, key))
    .returning()
}

export async function getUserSettings(userId: string) {
  return await db
    .select({ key: userSettings.key, value: userSettings.value })
    .from(userSettings)
    .where(eq(userSettings.user_id, userId))
}

export async function updateUserSetting(userId: string, key: string, value: any) {
  // First try to update existing setting
  const updateResult = await db
    .update(userSettings)
    .set({ value: JSON.stringify(value), updated_at: new Date() })
    .where(and(eq(userSettings.user_id, userId), eq(userSettings.key, key)))
    .returning()

  // If no rows updated, insert new setting
  if (updateResult.length === 0) {
    return await db
      .insert(userSettings)
      .values({
        user_id: userId,
        key,
        value: JSON.stringify(value),
      })
      .returning()
  }

  return updateResult
}