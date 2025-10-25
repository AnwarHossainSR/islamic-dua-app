import { NextRequest, NextResponse } from 'next/server'
import { getUserRole, getUserPermissions } from '@/lib/permissions'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
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
    console.error('Error fetching permissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    )
  }
}