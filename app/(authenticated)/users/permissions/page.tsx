import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getAllPermissions, getAllRolesWithPermissions } from '@/lib/actions/role-permissions'
import { Plus, Settings, Shield, Users } from 'lucide-react'
import { PermissionsManagementClient } from './permissions-client'
import { RolesManagementClient } from './roles-client'

export default async function PermissionsManagementPage() {
  const [permissions, rolesWithPermissions] = await Promise.all([
    getAllPermissions(),
    getAllRolesWithPermissions(),
  ])

  const resourceCount = [...new Set(permissions.map((p: any) => p.resource || 'unknown'))].length
  const actionCount = [...new Set(permissions.map((p: any) => p.action || 'unknown'))].length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Permissions & Roles</h1>
        <p className="text-muted-foreground">Manage system permissions and role assignments</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Permissions</p>
                <p className="text-2xl font-bold">{permissions.length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Roles</p>
                <p className="text-2xl font-bold">{rolesWithPermissions.length}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resources</p>
                <p className="text-2xl font-bold">{resourceCount}</p>
              </div>
              <Settings className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Actions</p>
                <p className="text-2xl font-bold">{actionCount}</p>
              </div>
              <Plus className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="permissions">Permission Management</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role-Based Access Control</CardTitle>
              <CardDescription>
                Manage permissions for each role. Changes affect all users with that role.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RolesManagementClient
                rolesWithPermissions={rolesWithPermissions}
                allPermissions={permissions}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Permissions</CardTitle>
              <CardDescription>Create, edit, and manage system permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <PermissionsManagementClient permissions={permissions} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
