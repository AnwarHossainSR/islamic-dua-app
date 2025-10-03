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

export async function importDuasFromCSV(csvData: string) {
  const supabase = await getSupabaseServerClient()

  try {
    // Parse CSV
    const lines = csvData.trim().split("\n")
    if (lines.length < 2) {
      return { error: "CSV file is empty or invalid" }
    }

    // Get headers
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""))

    // Expected headers
    const requiredHeaders = ["title_bn", "arabic_text", "translation_bn", "category_slug"]
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))

    if (missingHeaders.length > 0) {
      return { error: `Missing required headers: ${missingHeaders.join(", ")}` }
    }

    // Parse rows
    const duas = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Parse CSV line (handle quoted values)
      const values: string[] = []
      let currentValue = ""
      let insideQuotes = false

      for (let j = 0; j < line.length; j++) {
        const char = line[j]

        if (char === '"') {
          insideQuotes = !insideQuotes
        } else if (char === "," && !insideQuotes) {
          values.push(currentValue.trim())
          currentValue = ""
        } else {
          currentValue += char
        }
      }
      values.push(currentValue.trim())

      // Create dua object
      const dua: any = {}
      headers.forEach((header, index) => {
        const value = values[index] || ""
        dua[header] = value
      })

      // Get category ID from slug
      if (dua.category_slug) {
        const { data: category } = await supabase.from("categories").select("id").eq("slug", dua.category_slug).single()

        if (category) {
          dua.category_id = category.id
        }
        delete dua.category_slug
      }

      // Convert boolean fields
      if (dua.is_featured) {
        dua.is_featured = dua.is_featured.toLowerCase() === "true" || dua.is_featured === "1"
      }
      if (dua.is_active !== undefined) {
        dua.is_active = dua.is_active.toLowerCase() === "true" || dua.is_active === "1"
      }

      duas.push(dua)
    }

    if (duas.length === 0) {
      return { error: "No valid duas found in CSV" }
    }

    // Insert duas
    const { data, error } = await supabase.from("duas").insert(duas).select()

    if (error) {
      return { error: error.message }
    }

    return { success: true, count: data.length }
  } catch (err) {
    console.error("[v0] CSV import error:", err)
    return { error: "Failed to parse CSV data" }
  }
}
