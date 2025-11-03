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
      title_bn: dua.titleBn,
      title_ar: dua.titleAr,
      title_en: dua.titleEn,
      dua_text_ar: dua.duaTextAr,
      translation_bn: dua.translationBn,
      translation_en: dua.translationEn,
      transliteration: dua.transliteration,
      category: dua.category,
      source: dua.source,
      reference: dua.reference,
      benefits: dua.benefits,
      is_important: dua.isImportant,
      is_active: dua.isActive,
      tags: dua.tags ? dua.tags.split(',') : [],
      audio_url: dua.audioUrl,
      created_by: dua.createdBy,
      created_at: dua.createdAt?.toISOString() || '',
      updated_at: dua.updatedAt?.toISOString() || '',
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
      title_bn: dua.titleBn,
      title_ar: dua.titleAr,
      title_en: dua.titleEn,
      dua_text_ar: dua.duaTextAr,
      translation_bn: dua.translationBn,
      translation_en: dua.translationEn,
      transliteration: dua.transliteration,
      category: dua.category,
      source: dua.source,
      reference: dua.reference,
      benefits: dua.benefits,
      is_important: dua.isImportant,
      is_active: dua.isActive,
      tags: dua.tags ? dua.tags.split(',') : [],
      audio_url: dua.audioUrl,
      created_by: dua.createdBy,
      created_at: dua.createdAt?.toISOString() || '',
      updated_at: dua.updatedAt?.toISOString() || '',
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
      titleBn: duaData.title_bn,
      titleAr: duaData.title_ar,
      titleEn: duaData.title_en,
      duaTextAr: duaData.dua_text_ar,
      translationBn: duaData.translation_bn,
      translationEn: duaData.translation_en,
      transliteration: duaData.transliteration,
      category: duaData.category,
      source: duaData.source,
      reference: duaData.reference,
      benefits: duaData.benefits,
      isImportant: duaData.is_important,
      isActive: duaData.is_active,
      tags: duaData.tags?.join(','),
      audioUrl: duaData.audio_url,
      createdBy: user?.id,
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
    if (duaData.title_bn) updateData.titleBn = duaData.title_bn
    if (duaData.title_ar) updateData.titleAr = duaData.title_ar
    if (duaData.title_en) updateData.titleEn = duaData.title_en
    if (duaData.dua_text_ar) updateData.duaTextAr = duaData.dua_text_ar
    if (duaData.translation_bn) updateData.translationBn = duaData.translation_bn
    if (duaData.translation_en) updateData.translationEn = duaData.translation_en
    if (duaData.transliteration) updateData.transliteration = duaData.transliteration
    if (duaData.category) updateData.category = duaData.category
    if (duaData.source) updateData.source = duaData.source
    if (duaData.reference) updateData.reference = duaData.reference
    if (duaData.benefits) updateData.benefits = duaData.benefits
    if (duaData.is_important !== undefined) updateData.isImportant = duaData.is_important
    if (duaData.is_active !== undefined) updateData.isActive = duaData.is_active
    if (duaData.tags) updateData.tags = duaData.tags.join(',')
    if (duaData.audio_url) updateData.audioUrl = duaData.audio_url

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
      name_bn: cat.nameBn,
      name_ar: cat.nameAr,
      name_en: cat.nameEn,
      description: cat.description,
      icon: cat.icon,
      color: cat.color,
      is_active: cat.isActive,
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
