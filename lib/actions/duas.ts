'use server'

import { apiLogger } from '@/lib/logger'
import { PERMISSIONS } from '@/lib/permissions'
import { getSupabaseAdminServerClient, getSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { checkPermission, getUser } from './auth'

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
  const supabase = await getSupabaseServerClient()

  let query = supabase
    .from('duas')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (filters?.category && filters.category !== 'all') {
    query = query.eq('category', filters.category)
  }

  if (filters?.search) {
    query = query.or(
      `title_bn.ilike.%${filters.search}%,title_en.ilike.%${filters.search}%,dua_text_ar.ilike.%${filters.search}%`
    )
  }

  if (filters?.isImportant) {
    query = query.eq('is_important', true)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    apiLogger.error('Failed to fetch duas', { error, filters })
    throw error
  }

  return data || []
}

const getDuaByIdUncached = async (id: string) => {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('duas')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) {
    apiLogger.error('Failed to fetch dua', { error, id })
    throw error
  }

  return data
}

export const getDuaById = cache(getDuaByIdUncached)

export async function createDua(
  duaData: Omit<Dua, 'id' | 'created_at' | 'updated_at' | 'created_by'>
) {
  await checkPermission(PERMISSIONS.DUAS_CREATE)
  const user = await getUser()
  const supabase = getSupabaseAdminServerClient()

  const { data, error } = await supabase
    .from('duas')
    .insert({
      ...duaData,
      created_by: user?.id,
    })
    .select()
    .single()

  if (error) {
    apiLogger.error('Failed to create dua', { error, duaData })
    throw error
  }

  revalidatePath('/duas')
  return data
}

export async function updateDua(
  id: string,
  duaData: Partial<Omit<Dua, 'id' | 'created_at' | 'updated_at' | 'created_by'>>
) {
  await checkPermission(PERMISSIONS.DUAS_UPDATE)
  const supabase = getSupabaseAdminServerClient()

  const { data, error } = await supabase.from('duas').update(duaData).eq('id', id).select().single()

  if (error) {
    apiLogger.error('Failed to update dua', { error, id, duaData })
    throw error
  }

  apiLogger.info('Dua updated successfully', { duaId: id })
  revalidatePath('/duas')
  return data
}

export async function deleteDua(id: string) {
  await checkPermission(PERMISSIONS.DUAS_DELETE)
  const supabase = getSupabaseAdminServerClient()

  const { error } = await supabase.from('duas').update({ is_active: false }).eq('id', id)

  if (error) {
    apiLogger.error('Failed to delete dua', { error, id })
    throw error
  }

  apiLogger.info('Dua deleted successfully', { duaId: id })
  revalidatePath('/duas')
}

export async function getDuaCategories() {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('dua_categories')
    .select('*')
    .eq('is_active', true)
    .order('name_bn')

  if (error) {
    apiLogger.error('Failed to fetch dua categories', { error })
    throw error
  }

  return data || []
}

export async function getDuaStats() {
  const supabase = await getSupabaseServerClient()

  const [{ count: totalDuas }, { count: importantDuas }, { data: categoryCounts }] =
    await Promise.all([
      supabase.from('duas').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase
        .from('duas')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('is_important', true),
      supabase.from('duas').select('category').eq('is_active', true),
    ])

  const categoryStats =
    categoryCounts?.reduce((acc: Record<string, number>, dua) => {
      acc[dua.category] = (acc[dua.category] || 0) + 1
      return acc
    }, {}) || {}

  return {
    total: totalDuas || 0,
    important: importantDuas || 0,
    byCategory: categoryStats,
  }
}
