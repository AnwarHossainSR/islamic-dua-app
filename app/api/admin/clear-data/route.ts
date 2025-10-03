import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { table } = await request.json()
    const supabase = await getSupabaseServerClient()

    // Verify admin access
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: adminUser } = await supabase.from("admin_users").select("*").eq("user_id", user.id).single()

    if (!adminUser || !adminUser.is_active) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Clear specified table(s)
    if (table === "all") {
      // Clear all tables in order (respecting foreign key constraints)
      await supabase.from("user_favorites").delete().neq("id", "00000000-0000-0000-0000-000000000000")
      await supabase.from("dua_tags").delete().neq("dua_id", "00000000-0000-0000-0000-000000000000")
      await supabase.from("duas").delete().neq("id", "00000000-0000-0000-0000-000000000000")
      await supabase.from("tags").delete().neq("id", "00000000-0000-0000-0000-000000000000")
      await supabase.from("categories").delete().neq("id", "00000000-0000-0000-0000-000000000000")
      await supabase.from("dhikr_presets").delete().neq("id", "00000000-0000-0000-0000-000000000000")
    } else {
      // Clear specific table
      const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000")

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
