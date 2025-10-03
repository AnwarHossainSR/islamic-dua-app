"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Dua Management
export async function createDua(formData: FormData) {
  const supabase = await getSupabaseServerClient()

  const duaData = {
    category_id: formData.get("category_id") as string,
    title_bn: formData.get("title_bn") as string,
    title_ar: formData.get("title_ar") as string,
    title_en: formData.get("title_en") as string,
    arabic_text: formData.get("arabic_text") as string,
    transliteration_bn: formData.get("transliteration_bn") as string,
    translation_bn: formData.get("translation_bn") as string,
    translation_en: formData.get("translation_en") as string,
    reference: formData.get("reference") as string,
    is_featured: formData.get("is_featured") === "on",
    is_active: formData.get("is_active") === "on",
  }

  const { data, error } = await supabase.from("duas").insert(duaData).select().single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/duas")
  redirect("/admin/duas")
}

export async function updateDua(id: string, formData: FormData) {
  const supabase = await getSupabaseServerClient()

  const duaData = {
    category_id: formData.get("category_id") as string,
    title_bn: formData.get("title_bn") as string,
    title_ar: formData.get("title_ar") as string,
    title_en: formData.get("title_en") as string,
    arabic_text: formData.get("arabic_text") as string,
    transliteration_bn: formData.get("transliteration_bn") as string,
    translation_bn: formData.get("translation_bn") as string,
    translation_en: formData.get("translation_en") as string,
    reference: formData.get("reference") as string,
    is_featured: formData.get("is_featured") === "on",
    is_active: formData.get("is_active") === "on",
  }

  const { error } = await supabase.from("duas").update(duaData).eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/duas")
  revalidatePath(`/duas/${id}`)
  redirect("/admin/duas")
}

export async function deleteDua(id: string) {
  const supabase = await getSupabaseServerClient()
  const { error } = await supabase.from("duas").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/duas")
  return { success: true }
}

// Category Management
export async function createCategory(formData: FormData) {
  const supabase = await getSupabaseServerClient()

  const categoryData = {
    name_bn: formData.get("name_bn") as string,
    name_ar: formData.get("name_ar") as string,
    name_en: formData.get("name_en") as string,
    slug: formData.get("slug") as string,
    icon: formData.get("icon") as string,
    display_order: Number.parseInt(formData.get("display_order") as string) || 0,
    is_active: formData.get("is_active") === "on",
  }

  const { error } = await supabase.from("categories").insert(categoryData)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/categories")
  redirect("/admin/categories")
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await getSupabaseServerClient()

  const categoryData = {
    name_bn: formData.get("name_bn") as string,
    name_ar: formData.get("name_ar") as string,
    name_en: formData.get("name_en") as string,
    slug: formData.get("slug") as string,
    icon: formData.get("icon") as string,
    display_order: Number.parseInt(formData.get("display_order") as string) || 0,
    is_active: formData.get("is_active") === "on",
  }

  const { error } = await supabase.from("categories").update(categoryData).eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/categories")
  redirect("/admin/categories")
}

export async function deleteCategory(id: string) {
  const supabase = await getSupabaseServerClient()
  const { error } = await supabase.from("categories").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/categories")
  return { success: true }
}

// Tag Management
export async function createTag(formData: FormData) {
  const supabase = await getSupabaseServerClient()

  const tagData = {
    name_bn: formData.get("name_bn") as string,
    name_ar: formData.get("name_ar") as string,
    name_en: formData.get("name_en") as string,
    slug: formData.get("slug") as string,
  }

  const { error } = await supabase.from("tags").insert(tagData)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/tags")
  redirect("/admin/tags")
}

export async function updateTag(id: string, formData: FormData) {
  const supabase = await getSupabaseServerClient()

  const tagData = {
    name_bn: formData.get("name_bn") as string,
    name_ar: formData.get("name_ar") as string,
    name_en: formData.get("name_en") as string,
    slug: formData.get("slug") as string,
  }

  const { error } = await supabase.from("tags").update(tagData).eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/tags")
  redirect("/admin/tags")
}

export async function deleteTag(id: string) {
  const supabase = await getSupabaseServerClient()
  const { error } = await supabase.from("tags").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/tags")
  return { success: true }
}

// Dhikr Preset Management
export async function createDhikrPreset(formData: FormData) {
  const supabase = await getSupabaseServerClient()

  const presetData = {
    name_bn: formData.get("name_bn") as string,
    name_ar: formData.get("name_ar") as string,
    name_en: formData.get("name_en") as string,
    arabic_text: formData.get("arabic_text") as string,
    transliteration_bn: formData.get("transliteration_bn") as string,
    translation_bn: formData.get("translation_bn") as string,
    target_count: Number.parseInt(formData.get("target_count") as string) || 33,
    is_default: formData.get("is_default") === "on",
    display_order: Number.parseInt(formData.get("display_order") as string) || 0,
  }

  const { error } = await supabase.from("dhikr_presets").insert(presetData)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/dhikr-presets")
  redirect("/admin/dhikr-presets")
}

export async function updateDhikrPreset(id: string, formData: FormData) {
  const supabase = await getSupabaseServerClient()

  const presetData = {
    name_bn: formData.get("name_bn") as string,
    name_ar: formData.get("name_ar") as string,
    name_en: formData.get("name_en") as string,
    arabic_text: formData.get("arabic_text") as string,
    transliteration_bn: formData.get("transliteration_bn") as string,
    translation_bn: formData.get("translation_bn") as string,
    target_count: Number.parseInt(formData.get("target_count") as string) || 33,
    is_default: formData.get("is_default") === "on",
    display_order: Number.parseInt(formData.get("display_order") as string) || 0,
  }

  const { error } = await supabase.from("dhikr_presets").update(presetData).eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/dhikr-presets")
  redirect("/admin/dhikr-presets")
}

export async function deleteDhikrPreset(id: string) {
  const supabase = await getSupabaseServerClient()
  const { error } = await supabase.from("dhikr_presets").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/dhikr-presets")
  return { success: true }
}
