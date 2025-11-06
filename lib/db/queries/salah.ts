import { db } from '@/lib/db'
import { salahPrayers, salahAmols, userSalahProgress, userSalahStats } from '@/lib/db/schema/salah'
import { eq, and, desc, asc } from 'drizzle-orm'

// Salah Prayers queries
export async function getAllSalahPrayers() {
  try {
    const result = await db
      .select()
      .from(salahPrayers)
      .where(eq(salahPrayers.is_active, true))
      .orderBy(asc(salahPrayers.sort_order))
    
    console.log('Salah prayers query result:', result.length, 'prayers found')
    return result
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

export async function getSalahPrayerById(id: string) {
  const result = await db
    .select()
    .from(salahPrayers)
    .where(eq(salahPrayers.id, id))
    .limit(1)
  return result[0] || null
}

export async function getSalahPrayerWithAmols(id: string) {
  const prayer = await getSalahPrayerById(id)
  if (!prayer) return null

  const amols = await db
    .select()
    .from(salahAmols)
    .where(and(
      eq(salahAmols.salah_prayer_id, id),
      eq(salahAmols.is_active, true)
    ))
    .orderBy(asc(salahAmols.sort_order))

  return { ...prayer, amols }
}

export async function createSalahPrayer(data: any) {
  const result = await db.insert(salahPrayers).values(data).returning()
  return result[0]
}

export async function updateSalahPrayer(id: string, data: any) {
  const result = await db
    .update(salahPrayers)
    .set({ ...data, updated_at: new Date() })
    .where(eq(salahPrayers.id, id))
    .returning()
  return result[0]
}

export async function deleteSalahPrayer(id: string) {
  await db.delete(salahPrayers).where(eq(salahPrayers.id, id))
}

// Salah Amols queries
export async function getAmolsBySalahId(salahId: string) {
  return await db
    .select()
    .from(salahAmols)
    .where(and(
      eq(salahAmols.salah_prayer_id, salahId),
      eq(salahAmols.is_active, true)
    ))
    .orderBy(asc(salahAmols.sort_order))
}

export async function getAmolById(id: string) {
  const result = await db
    .select()
    .from(salahAmols)
    .where(eq(salahAmols.id, id))
    .limit(1)
  return result[0] || null
}

export async function createAmol(data: any) {
  const result = await db.insert(salahAmols).values(data).returning()
  return result[0]
}

export async function updateAmol(id: string, data: any) {
  const result = await db
    .update(salahAmols)
    .set({ ...data, updated_at: new Date() })
    .where(eq(salahAmols.id, id))
    .returning()
  return result[0]
}

export async function deleteAmol(id: string) {
  await db.delete(salahAmols).where(eq(salahAmols.id, id))
}

// User progress queries
export async function getUserSalahProgress(userId: string, date?: string) {
  const currentDate = date || new Date().toISOString().split('T')[0]
  
  return await db
    .select()
    .from(userSalahProgress)
    .where(and(
      eq(userSalahProgress.user_id, userId),
      eq(userSalahProgress.completed_date, currentDate)
    ))
}

export async function getUserSalahStats(userId: string) {
  const result = await db
    .select()
    .from(userSalahStats)
    .where(eq(userSalahStats.user_id, userId))
    .limit(1)
  return result[0] || null
}

export async function updateUserSalahProgress(userId: string, salahId: string, completedAmols: string[]) {
  const currentDate = new Date().toISOString().split('T')[0]
  const totalAmols = await db
    .select()
    .from(salahAmols)
    .where(and(
      eq(salahAmols.salah_prayer_id, salahId),
      eq(salahAmols.is_active, true)
    ))
  
  const completionPercentage = Math.round((completedAmols.length / totalAmols.length) * 100)

  const result = await db
    .insert(userSalahProgress)
    .values({
      user_id: userId,
      salah_prayer_id: salahId,
      completed_date: currentDate,
      completed_amols: completedAmols,
      total_amols: totalAmols.length,
      completion_percentage: completionPercentage,
    })
    .onConflictDoUpdate({
      target: [userSalahProgress.user_id, userSalahProgress.salah_prayer_id, userSalahProgress.completed_date],
      set: {
        completed_amols: completedAmols,
        completion_percentage: completionPercentage,
        updated_at: new Date(),
      }
    })
    .returning()

  // Update user stats
  await updateUserSalahStats(userId)
  
  return result[0]
}

export async function updateUserSalahStats(userId: string) {
  const progress = await db
    .select()
    .from(userSalahProgress)
    .where(eq(userSalahProgress.user_id, userId))

  const totalPrayers = progress.filter(p => p.completion_percentage === 100).length
  const totalAmols = progress.reduce((sum, p) => sum + (p.completed_amols as string[]).length, 0)

  await db
    .insert(userSalahStats)
    .values({
      user_id: userId,
      total_prayers_completed: totalPrayers,
      total_amols_completed: totalAmols,
      last_completed_at: new Date(),
    })
    .onConflictDoUpdate({
      target: userSalahStats.user_id,
      set: {
        total_prayers_completed: totalPrayers,
        total_amols_completed: totalAmols,
        last_completed_at: new Date(),
        updated_at: new Date(),
      }
    })
}