'use server'

import { apiLogger } from '@/lib/logger'
import { PERMISSIONS } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { checkPermission, getUser } from './auth'
import { getDuas as getDuasQuery, getDuaById as getDuaByIdQuery, createDua as createDuaQuery, updateDua as updateDuaQuery, deleteDua as deleteDuaQuery, getDuaCategories as getDuaCategoriesQuery, getDuaStats as getDuaStatsQuery } from '@/lib/db/queries/duas'

export interface Dua {
  id: string
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
  is_important: boolean
  is_active: boolean
  tags?: string[]
  audio_url?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface DuaCategory {
  id: string
  name_bn: string
  name_ar?: string
  name_en?: string
  description?: string
  icon?: string
  color: string
  is_active: boolean
}

export async function getDuas(filters?: {
  category?: string
  search?: string
  isImportant?: boolean
  limit?: number
  offset?: number
}) {
  try {
    const data = await getDuasQuery(filters)
    return data.map(dua => ({
      id: dua.id,
      title_bn: dua.title_bn,
      title_ar: dua.title_ar,
      title_en: dua.title_en,
      dua_text_ar: dua.dua_text_ar,
      translation_bn: dua.translation_bn,
      translation_en: dua.translation_en,
      transliteration: dua.transliteration,
      category: dua.category,
      source: dua.source,
      reference: dua.reference,
      benefits: dua.benefits,
      is_important: dua.is_important,
      is_active: dua.is_active,
      tags: dua.tags ? dua.tags.split(',') : [],
      audio_url: dua.audio_url,
      created_by: dua.created_by,
      created_at: dua.created_at?.toISOString() || '',
      updated_at: dua.updated_at?.toISOString() || '',
    }))
  } catch (error) {
    apiLogger.error('Failed to fetch duas with Drizzle', { error, filters })
    return []
  }
}

const getDuaByIdUncached = async (id: string) => {
  try {
    const dua = await getDuaByIdQuery(id)
    if (!dua) return null
    
    return {
      id: dua.id,
      title_bn: dua.title_bn,
      title_ar: dua.title_ar,
      title_en: dua.title_en,
      dua_text_ar: dua.dua_text_ar,
      translation_bn: dua.translation_bn,
      translation_en: dua.translation_en,
      transliteration: dua.transliteration,
      category: dua.category,
      source: dua.source,
      reference: dua.reference,
      benefits: dua.benefits,
      is_important: dua.is_important,
      is_active: dua.is_active,
      tags: dua.tags ? dua.tags.split(',') : [],
      audio_url: dua.audio_url,
      created_by: dua.created_by,
      created_at: dua.created_at?.toISOString() || '',
      updated_at: dua.updated_at?.toISOString() || '',
    }
  } catch (error) {
    apiLogger.error('Failed to fetch dua with Drizzle', { error, id })
    return null
  }
}

export const getDuaById = cache(getDuaByIdUncached)

export async function createDua(
  duaData: Omit<Dua, 'id' | 'created_at' | 'updated_at' | 'created_by'>
) {
  await checkPermission(PERMISSIONS.DUAS_CREATE)
  const user = await getUser()

  try {
    const result = await createDuaQuery({
      title_bn: duaData.title_bn,
      title_ar: duaData.title_ar,
      title_en: duaData.title_en,
      dua_text_ar: duaData.dua_text_ar,
      translation_bn: duaData.translation_bn,
      translation_en: duaData.translation_en,
      transliteration: duaData.transliteration,
      category: duaData.category,
      source: duaData.source,
      reference: duaData.reference,
      benefits: duaData.benefits,
      is_important: duaData.is_important,
      is_active: duaData.is_active,
      tags: duaData.tags?.join(','),
      audio_url: duaData.audio_url,
      created_by: user?.id,
    })

    revalidatePath('/duas')
    return result[0]
  } catch (error) {
    apiLogger.error('Failed to create dua with Drizzle', { error, duaData })
    throw error
  }
}

export async function updateDua(
  id: string,
  duaData: Partial<Omit<Dua, 'id' | 'created_at' | 'updated_at' | 'created_by'>>
) {
  await checkPermission(PERMISSIONS.DUAS_UPDATE)

  try {
    const updateData: any = {}
    if (duaData.title_bn) updateData.title_bn = duaData.title_bn
    if (duaData.title_ar) updateData.title_ar = duaData.title_ar
    if (duaData.title_en) updateData.title_en = duaData.title_en
    if (duaData.dua_text_ar) updateData.dua_text_ar = duaData.dua_text_ar
    if (duaData.translation_bn) updateData.translation_bn = duaData.translation_bn
    if (duaData.translation_en) updateData.translation_en = duaData.translation_en
    if (duaData.transliteration) updateData.transliteration = duaData.transliteration
    if (duaData.category) updateData.category = duaData.category
    if (duaData.source) updateData.source = duaData.source
    if (duaData.reference) updateData.reference = duaData.reference
    if (duaData.benefits) updateData.benefits = duaData.benefits
    if (duaData.is_important !== undefined) updateData.is_important = duaData.is_important
    if (duaData.is_active !== undefined) updateData.is_active = duaData.is_active
    if (duaData.tags) updateData.tags = duaData.tags.join(',')
    if (duaData.audio_url) updateData.audio_url = duaData.audio_url

    const result = await updateDuaQuery(id, updateData)
    
    apiLogger.info('Dua updated successfully', { duaId: id })
    revalidatePath('/duas')
    return result[0]
  } catch (error) {
    apiLogger.error('Failed to update dua with Drizzle', { error, id, duaData })
    throw error
  }
}

export async function deleteDua(id: string) {
  await checkPermission(PERMISSIONS.DUAS_DELETE)

  try {
    await deleteDuaQuery(id)
    
    apiLogger.info('Dua deleted successfully', { duaId: id })
    revalidatePath('/duas')
  } catch (error) {
    apiLogger.error('Failed to delete dua with Drizzle', { error, id })
    throw error
  }
}

export async function getDuaCategories() {
  try {
    const data = await getDuaCategoriesQuery()
    return data.map(cat => ({
      id: cat.id,
      name_bn: cat.name_bn,
      name_ar: cat.name_ar,
      name_en: cat.name_en,
      description: cat.description,
      icon: cat.icon,
      color: cat.color,
      is_active: cat.is_active,
    }))
  } catch (error) {
    apiLogger.error('Failed to fetch dua categories with Drizzle', { error })
    return []
  }
}

export async function getDuaStats() {
  try {
    return await getDuaStatsQuery()
  } catch (error) {
    apiLogger.error('Failed to fetch dua stats with Drizzle', { error })
    return {
      total: 0,
      important: 0,
      byCategory: {},
    }
  }
}
