"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { DuaWithDetails } from "@/lib/types/database"

export async function getDuas(params?: {
  categoryId?: string
  search?: string
  featured?: boolean
  limit?: number
}) {
  const supabase = await getSupabaseServerClient()

  let query = supabase
    .from("duas")
    .select(
      `
      *,
      category:categories(*),
      tags:dua_tags(tag:tags(*)),
      fazilat(*)
    `,
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (params?.categoryId) {
    query = query.eq("category_id", params.categoryId)
  }

  if (params?.featured) {
    query = query.eq("is_featured", true)
  }

  if (params?.search) {
    query = query.or(
      `title_bn.ilike.%${params.search}%,title_ar.ilike.%${params.search}%,translation_bn.ilike.%${params.search}%`,
    )
  }

  if (params?.limit) {
    query = query.limit(params.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching duas:", error)
    return []
  }

  return data as DuaWithDetails[]
}

export async function getDuaById(id: string) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("duas")
    .select(
      `
      *,
      category:categories(*),
      tags:dua_tags(tag:tags(*)),
      fazilat(*)
    `,
    )
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (error) {
    console.error("[v0] Error fetching dua:", error)
    return null
  }

  // Increment view count
  await supabase
    .from("duas")
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq("id", id)

  return data as DuaWithDetails
}

export async function getCategories() {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching categories:", error)
    return []
  }

  return data
}

export async function toggleBookmark(duaId: string) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to bookmark" }
  }

  // Check if bookmark exists
  const { data: existing } = await supabase
    .from("user_bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("dua_id", duaId)
    .single()

  if (existing) {
    // Remove bookmark
    const { error } = await supabase.from("user_bookmarks").delete().eq("id", existing.id)
    if (error) return { error: error.message }
    return { bookmarked: false }
  } else {
    // Add bookmark
    const { error } = await supabase.from("user_bookmarks").insert({ user_id: user.id, dua_id: duaId })
    if (error) return { error: error.message }
    return { bookmarked: true }
  }
}

export async function checkBookmark(duaId: string) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { data } = await supabase
    .from("user_bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("dua_id", duaId)
    .single()

  return !!data
}

export async function getUserBookmarks() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from("user_bookmarks")
    .select(
      `
      *,
      dua:duas(
        *,
        category:categories(*),
        tags:dua_tags(tag:tags(*))
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching bookmarks:", error)
    return []
  }

  return data
}
