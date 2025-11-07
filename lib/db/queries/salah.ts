import { db } from '@/lib/db'
import { salahAmols, userSalahProgress } from '@/lib/db/schema/salah'
import { eq, and, desc, asc } from 'drizzle-orm'
import { AmolFormData } from '@/lib/types/salah'

// Salah Amols queries
export async function getAllAmols() {
  try {
    const result = await db
      .select()
      .from(salahAmols)
      .where(eq(salahAmols.is_active, true))
      .orderBy(asc(salahAmols.salah_type), asc(salahAmols.sort_order))
    
    return result
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

export async function getAmolById(id: string) {
  const result = await db
    .select()
    .from(salahAmols)
    .where(eq(salahAmols.id, id))
    .limit(1)
  return result[0] || null
}

export async function createAmol(data: AmolFormData) {
  const result = await db.insert(salahAmols).values({
    ...data,
    sort_order: 0,
    is_active: true
  }).returning()
  return result[0]
}

export async function updateAmol(id: string, data: AmolFormData) {
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
export async function getUserProgress(userId: string, date?: string) {
  const currentDate = date || new Date().toISOString().split('T')[0]
  
  return await db
    .select()
    .from(userSalahProgress)
    .where(and(
      eq(userSalahProgress.user_id, userId),
      eq(userSalahProgress.completed_date, currentDate)
    ))
}

export async function addUserProgress(userId: string, amolId: string) {
  const currentDate = new Date().toISOString().split('T')[0]
  
  const result = await db
    .insert(userSalahProgress)
    .values({
      user_id: userId,
      amol_id: amolId,
      completed_date: currentDate,
    })
    .onConflictDoNothing()
    .returning()

  return result[0]
}

export async function removeUserProgress(userId: string, amolId: string) {
  const currentDate = new Date().toISOString().split('T')[0]
  
  await db
    .delete(userSalahProgress)
    .where(and(
      eq(userSalahProgress.user_id, userId),
      eq(userSalahProgress.amol_id, amolId),
      eq(userSalahProgress.completed_date, currentDate)
    ))
}