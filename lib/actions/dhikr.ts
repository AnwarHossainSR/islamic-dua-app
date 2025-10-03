"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function getDhikrPresets() {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.from("dhikr_presets").select("*").order("display_order", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching dhikr presets:", error)
    return []
  }

  return data
}

export async function getDhikrPresetById(id: string) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.from("dhikr_presets").select("*").eq("id", id).single()

  if (error) {
    console.error("[v0] Error fetching dhikr preset:", error)
    return null
  }

  return data
}
