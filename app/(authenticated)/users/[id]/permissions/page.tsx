import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getSupabaseAdminServerClient } from '@/lib/supabase/server'
import { ArrowLeft, Settings, Shield } from 'lucide-react'
import Link from 'next/link'
import { PermissionsClient } from './permissions-client'
import { UserOnlineStatus } from './user-online-status'

async function getUserWithPermissions(userId: string) {
  const supabase = getSupabaseAdminServerClient()

  // Get user info
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!adminUser) return null

  // Get auth user for email
  const { data: authUsers } = await supabase.auth.admin.listUsers()
  const authUser = authUsers.users.find(u => u.id === userId)

  // Get role permissions
  const { data: rolePermissions } = await supabase
    .from('role_permissions')
    .select(
      `
      permission:permissions(*)
    `
    )
    .eq('role', adminUser.role)

  // Get all available permissions
  const { data: allPermissions } = await supabase
    .from('permissions')
    .select('*')
    .order('resource', { ascending: true })

  const permissions = rolePermissions?.map(rp => rp.permission).filter(Boolean) || []

  return {
    ...adminUser,
    email: authUser?.email || 'Unknown',
    permissions,
    allPermissions: allPermissions || [],
  }
}

export default async function UserPermissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getUserWithPermissions(id)

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">User not found</p>
        <Button asChild className="mt-4">
          <Link href="/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/users">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">User Permissions</h1>
          </div>
          <p className="text-muted-foreground">Manage permissions for {user.email}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">User Role</p>
                <p className="text-2xl font-bold capitalize">{user.role}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Permissions</p>
                <p className="text-2xl font-bold">{user.permissions.length}</p>
              </div>
              <Settings className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex gap-2">
                  <Badge variant={user.is_active ? 'default' : 'outline'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <UserOnlineStatus />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role-Based Permissions</CardTitle>
          <CardDescription>
            Permissions are managed through roles. User has <strong>{user.role}</strong> role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PermissionsClient
            user={user}
            userPermissions={user.permissions}
            allPermissions={user.allPermissions}
          />
        </CardContent>
      </Card>
    </div>
  )
}
