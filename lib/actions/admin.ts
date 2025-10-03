'use server'

import { getSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function checkAdminAccess() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!adminUser) {
    redirect('/')
  }

  return adminUser
}

export async function getAdminStats() {
  const supabase = await getSupabaseServerClient()

  const [duasCount, categoriesCount, tagsCount, bookmarksCount] = await Promise.all([
    supabase.from('duas').select('id', { count: 'exact', head: true }),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
    supabase.from('tags').select('id', { count: 'exact', head: true }),
    supabase.from('user_bookmarks').select('id', { count: 'exact', head: true }),
  ])

  return {
    totalDuas: duasCount.count || 0,
    totalCategories: categoriesCount.count || 0,
    totalTags: tagsCount.count || 0,
    totalBookmarks: bookmarksCount.count || 0,
  }
}

export async function getRecentDuas(limit = 5) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('duas')
    .select(
      `
      *,
      category:categories(name_bn)
    `
    )
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[v0] Error fetching recent duas:', error)
    return []
  }

  return data
}

export async function isUserAdmin() {
  console.log('[v0] isUserAdmin called')
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log('[v0] isUserAdmin - User ID:', user?.id)

  if (!user) {
    console.log('[v0] isUserAdmin - No user found, returning false')
    return false
  }

  const { data: adminUser, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  console.log('[v0] isUserAdmin - Error:', error)
  console.log('[v0] isUserAdmin - Result:', !!adminUser)

  return !!adminUser
}
