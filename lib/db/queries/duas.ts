import { and, count, desc, eq, ilike, or } from 'drizzle-orm'
import { db } from '../index'
import { duaCategories, duas } from '../schema'

export async function getDuas(filters?: {
  category?: string
  search?: string
  isImportant?: boolean
  limit?: number
  offset?: number
}) {
  const conditions = [eq(duas.is_active, true)]

  if (filters?.category && filters.category !== 'all') {
    conditions.push(eq(duas.category, filters.category))
  }

  if (filters?.search) {
    conditions.push(
      or(
        ilike(duas.title_bn, `%${filters.search}%`),
        ilike(duas.title_en, `%${filters.search}%`),
        ilike(duas.dua_text_ar, `%${filters.search}%`)
      )!
    )
  }

  if (filters?.isImportant === true) {
    conditions.push(eq(duas.is_important, true))
  }

  const baseQuery = db
    .select()
    .from(duas)
    .where(and(...conditions))
    .orderBy(desc(duas.created_at))

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
    .where(and(eq(duas.id, id), eq(duas.is_active, true)))
    .limit(1)

  return result[0] || null
}

export async function createDua(duaData: {
  title_bn: string
  title_ar?: string
  title_en?: string
  dua_text_ar: string
  translation_bn?: string
  translation_en?: string
  transliteration?: string
  category: string
  source?: string
  reference?: string
  benefits?: string
  is_important?: boolean
  is_active?: boolean
  tags?: string
  audio_url?: string
  created_by?: string
}) {
  return await db
    .insert(duas)
    .values(duaData)
    .returning()
}

export async function updateDua(id: string, duaData: Partial<{
  title_bn: string
  title_ar: string
  title_en: string
  dua_text_ar: string
  translation_bn: string
  translation_en: string
  transliteration: string
  category: string
  source: string
  reference: string
  benefits: string
  is_important: boolean
  is_active: boolean
  tags: string
  audio_url: string
}>) {
  return await db
    .update(duas)
    .set({ ...duaData, updated_at: new Date() })
    .where(eq(duas.id, id))
    .returning()
}

export async function deleteDua(id: string) {
  return await db
    .update(duas)
    .set({ is_active: false, updated_at: new Date() })
    .where(eq(duas.id, id))
}

export async function getDuaCategories() {
  return await db
    .select()
    .from(duaCategories)
    .where(eq(duaCategories.is_active, true))
    .orderBy(duaCategories.name_bn)
}

export async function getDuaStats() {
  const [totalResult] = await db
    .select({ count: count() })
    .from(duas)
    .where(eq(duas.is_active, true))

  const [importantResult] = await db
    .select({ count: count() })
    .from(duas)
    .where(and(eq(duas.is_active, true), eq(duas.is_important, true)))

  const categoryData = await db
    .select({ category: duas.category })
    .from(duas)
    .where(eq(duas.is_active, true))

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