import { eq, and, desc, ilike, or, count } from 'drizzle-orm'
import { db } from '../index'
import { duas, duaCategories } from '../schema'

export async function getDuas(filters?: {
  category?: string
  search?: string
  isImportant?: boolean
  limit?: number
  offset?: number
}) {
  const conditions = [eq(duas.isActive, true)]

  if (filters?.category && filters.category !== 'all') {
    conditions.push(eq(duas.category, filters.category))
  }

  if (filters?.search) {
    conditions.push(
      or(
        ilike(duas.titleBn, `%${filters.search}%`),
        ilike(duas.titleEn, `%${filters.search}%`),
        ilike(duas.duaTextAr, `%${filters.search}%`)
      )!
    )
  }

  if (filters?.isImportant) {
    conditions.push(eq(duas.isImportant, true))
  }

  const baseQuery = db
    .select()
    .from(duas)
    .where(and(...conditions))
    .orderBy(desc(duas.createdAt))

  if (filters?.limit && filters?.offset) {
    return await baseQuery.limit(filters.limit).offset(filters.offset)
  } else if (filters?.limit) {
    return await baseQuery.limit(filters.limit)
  } else {
    return await baseQuery
  }
}

export async function getDuaById(id: string) {
  const result = await db
    .select()
    .from(duas)
    .where(and(eq(duas.id, id), eq(duas.isActive, true)))
    .limit(1)

  return result[0] || null
}

export async function createDua(duaData: {
  titleBn: string
  titleAr?: string
  titleEn?: string
  duaTextAr: string
  translationBn?: string
  translationEn?: string
  transliteration?: string
  category: string
  source?: string
  reference?: string
  benefits?: string
  isImportant?: boolean
  isActive?: boolean
  tags?: string
  audioUrl?: string
  createdBy?: string
}) {
  return await db
    .insert(duas)
    .values(duaData)
    .returning()
}

export async function updateDua(id: string, duaData: Partial<{
  titleBn: string
  titleAr: string
  titleEn: string
  duaTextAr: string
  translationBn: string
  translationEn: string
  transliteration: string
  category: string
  source: string
  reference: string
  benefits: string
  isImportant: boolean
  isActive: boolean
  tags: string
  audioUrl: string
}>) {
  return await db
    .update(duas)
    .set({ ...duaData, updatedAt: new Date() })
    .where(eq(duas.id, id))
    .returning()
}

export async function deleteDua(id: string) {
  return await db
    .update(duas)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(duas.id, id))
}

export async function getDuaCategories() {
  return await db
    .select()
    .from(duaCategories)
    .where(eq(duaCategories.isActive, true))
    .orderBy(duaCategories.nameBn)
}

export async function getDuaStats() {
  const [totalResult] = await db
    .select({ count: count() })
    .from(duas)
    .where(eq(duas.isActive, true))

  const [importantResult] = await db
    .select({ count: count() })
    .from(duas)
    .where(and(eq(duas.isActive, true), eq(duas.isImportant, true)))

  const categoryData = await db
    .select({ category: duas.category })
    .from(duas)
    .where(eq(duas.isActive, true))

  const categoryStats = categoryData.reduce((acc: Record<string, number>, dua) => {
    acc[dua.category] = (acc[dua.category] || 0) + 1
    return acc
  }, {})

  return {
    total: totalResult.count,
    important: importantResult.count,
    byCategory: categoryStats,
  }
}