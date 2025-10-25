import { NextRequest, NextResponse } from 'next/server'
import { getUserRole, getUserPermissions } from '@/lib/permissions'
import { getSupabaseServerClient, getSupabaseAdminServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Try server client first, fallback to admin for prerendering
    let supabase
    let user = null
    
    try {
      supabase = await getSupabaseServerClient()
      const { data } = await supabase.auth.getUser()
      user = data.user
    } catch (prerenderError) {
      // During prerendering, return default values
      return NextResponse.json({ 
        role: 'user', 
        permissions: [] 
      })
    }
    
    if (!user) {
      return NextResponse.json({ 
        role: 'user', 
        permissions: [] 
      })
    }

    const [role, permissions] = await Promise.all([
      getUserRole(user.id),
      getUserPermissions(user.id)
    ])

    return NextResponse.json({
      role,
      permissions
    })
  } catch (error) {
    // Handle prerendering errors gracefully
    if (error instanceof Error && error.message.includes('prerender')) {
      return NextResponse.json({ 
        role: 'user', 
        permissions: [] 
      })
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    )
  }
}