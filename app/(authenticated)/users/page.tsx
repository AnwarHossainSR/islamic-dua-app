import { SuperAdminOnly } from '@/components/auth/permission-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getSupabaseAdminServerClient, getSupabaseServerClient } from '@/lib/supabase/server'
import { Users, Shield, Edit } from 'lucide-react'
import { cookies } from 'next/headers'

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
  const userIds = adminUsers.map(u => u.user_id)
  const { data: authUsers } = await supabase.auth.admin.listUsers()
  
  // Combine data
  return adminUsers.map(adminUser => {
    const authUser = authUsers.users.find(u => u.id === adminUser.user_id)
    return {
      ...adminUser,
      email: authUser?.email || 'Unknown'
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

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
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
          <CardHeader>
            <CardTitle>Users & Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={
                        user.role === 'super_admin' ? 'destructive' : 
                        user.role === 'editor' ? 'default' : 'secondary'
                      }
                    >
                      {user.role === 'super_admin' ? 'Super Admin' : 
                       user.role === 'editor' ? 'Editor' : 'User'}
                    </Badge>
                    <Badge variant={user.is_active ? 'default' : 'outline'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {users.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No users found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </SuperAdminOnly>
  )
}