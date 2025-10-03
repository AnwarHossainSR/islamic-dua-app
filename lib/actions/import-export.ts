"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function exportDuasToJSON() {
  const supabase = await getSupabaseServerClient()

  const { data: duas, error } = await supabase
    .from("duas")
    .select(
      `
      *,
      category:categories(*),
      tags:dua_tags(tag:tags(*)),
      fazilat(*)
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error exporting duas:", error)
    return { error: error.message }
  }

  return { data: duas }
}

export async function exportCategoriesToJSON() {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.from("categories").select("*").order("display_order", { ascending: true })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function exportTagsToJSON() {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.from("tags").select("*").order("name_bn", { ascending: true })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function importDuasFromJSON(jsonData: string) {
  const supabase = await getSupabaseServerClient()

  try {
    const duas = JSON.parse(jsonData)

    if (!Array.isArray(duas)) {
      return { error: "Invalid JSON format. Expected an array of duas." }
    }

    // Insert duas
    const { data, error } = await supabase.from("duas").insert(duas).select()

    if (error) {
      return { error: error.message }
    }

    return { success: true, count: data.length }
  } catch (err) {
    return { error: "Failed to parse JSON data" }
  }
}

export async function exportDuasToCSV() {
  const supabase = await getSupabaseServerClient()

  const { data: duas, error } = await supabase
    .from("duas")
    .select(
      `
      *,
      category:categories(name_bn)
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    return { error: error.message }
  }

  // Convert to CSV
  const headers = [
    "ID",
    "Title (Bangla)",
    "Title (Arabic)",
    "Arabic Text",
    "Transliteration",
    "Translation (Bangla)",
    "Reference",
    "Category",
    "Featured",
    "Active",
  ]

  const rows = duas.map((dua: any) => [
    dua.id,
    dua.title_bn,
    dua.title_ar || "",
    dua.arabic_text,
    dua.transliteration_bn || "",
    dua.translation_bn,
    dua.reference || "",
    dua.category?.name_bn || "",
    dua.is_featured ? "Yes" : "No",
    dua.is_active ? "Yes" : "No",
  ])

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

  return { data: csv }
}
