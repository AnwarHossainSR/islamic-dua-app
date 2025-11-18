import { SuperAdminOnly } from '@/components/auth/permission-guard'
import { Card, CardContent } from '@/components/ui/card'
import { getSupabaseAdminServerClient } from '@/lib/supabase/server'
import { Edit, Shield, Users } from 'lucide-react'
import { cookies } from 'next/headers'
import { UsersClient } from './users-client'

async function getUsers() {
  // Access cookies to make this dynamic
  await cookies()

  const supabase = getSupabaseAdminServerClient()

  // Get admin users
  const { data: adminUsers } = await supabase
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: false })

  if (!adminUsers) return []

  // Get user emails from auth.users
  const { data: authUsers } = await supabase.auth.admin.listUsers()

  // Combine data
  return adminUsers.map(adminUser => {
    const authUser = authUsers.users.find(u => u.id === adminUser.user_id)
    return {
      ...adminUser,
      email: authUser?.email || 'Unknown',
    }
  })
}

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <SuperAdminOnly>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage user roles and permissions</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Admins</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Super Admins</p>
                  <p className="text-2xl font-bold">
                    {users.filter(u => u.role === 'super_admin').length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Admins</p>
                  <p className="text-2xl font-bold">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Editors</p>
                  <p className="text-2xl font-bold">
                    {users.filter(u => u.role === 'editor').length}
                  </p>
                </div>
                <Edit className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent>
            <UsersClient users={users} />
          </CardContent>
        </Card>
      </div>
    </SuperAdminOnly>
  )
}
