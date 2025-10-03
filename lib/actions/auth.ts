"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function signUp(email: string, password: string) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { data, message: "Check your email to confirm your account" }
}

export async function signIn(email: string, password: string) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error.message.includes("Email not confirmed") || error.message.includes("email_not_confirmed")) {
      return {
        error: "Please confirm your email address before signing in. Check your inbox for the confirmation link.",
        code: "email_not_confirmed",
      }
    }
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/duas")
}

export async function resendConfirmationEmail(email: string) {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: "Confirmation email sent! Please check your inbox." }
}

export async function signOut() {
  const supabase = await getSupabaseServerClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}

export async function getUser() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function checkAdminStatus() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single()

  return adminUser
}
