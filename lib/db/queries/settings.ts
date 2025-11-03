import { eq, asc, and } from 'drizzle-orm'
import { db } from '../index'
import { appSettings, userSettings } from '../schema'

export async function getAppSettings(category?: string) {
  const baseQuery = db.select().from(appSettings)

  if (category) {
    return await baseQuery
      .where(eq(appSettings.category, category))
      .orderBy(asc(appSettings.category), asc(appSettings.label))
  }

  return await baseQuery.orderBy(asc(appSettings.category), asc(appSettings.label))
}

export async function updateAppSetting(key: string, value: any) {
  return await db
    .update(appSettings)
    .set({ value: JSON.stringify(value), updatedAt: new Date() })
    .where(eq(appSettings.key, key))
}

export async function getUserSettings(userId: string) {
  return await db
    .select({ key: userSettings.key, value: userSettings.value })
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
}

export async function updateUserSetting(userId: string, key: string, value: any) {
  // First try to update existing setting
  const updateResult = await db
    .update(userSettings)
    .set({ value: JSON.stringify(value), updatedAt: new Date() })
    .where(and(eq(userSettings.userId, userId), eq(userSettings.key, key)))
    .returning()

  // If no rows updated, insert new setting
  if (updateResult.length === 0) {
    return await db
      .insert(userSettings)
      .values({
        userId,
        key,
        value: JSON.stringify(value),
      })
      .returning()
  }

  return updateResult
}