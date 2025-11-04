'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { addPermissionToRole, removePermissionFromRole } from '@/lib/actions/role-permissions'
import { Crown, Edit, Shield, Users } from 'lucide-react'
import { useState } from 'react'

interface Permission {
  id: string
  name: string
  description: string | null
  resource?: string
  action?: string
  created_at?: Date | null | string
}

interface Role {
  role: string
  permissions: Permission[]
}

interface RolesManagementClientProps {
  rolesWithPermissions: Role[]
  allPermissions: Permission[]
}

const roleIcons = {
  user: Users,
  editor: Edit,
  admin: Shield,
  super_admin: Crown
}

const roleColors = {
  user: 'text-gray-500',
  editor: 'text-green-500',
  admin: 'text-blue-500',
  super_admin: 'text-red-500'
}

const roleLabels = {
  user: 'User',
  editor: 'Editor',
  admin: 'Admin',
  super_admin: 'Super Admin'
}

export function RolesManagementClient({ rolesWithPermissions, allPermissions }: RolesManagementClientProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Group permissions by resource
  const permissionsByResource = allPermissions.reduce((acc, permission) => {
    const resource = permission.resource || 'general'
    if (!acc[resource]) {
      acc[resource] = []
    }
    acc[resource].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  const handlePermissionToggle = async (role: string, permission: Permission, isChecked: boolean) => {
    setLoading(true)
    try {
      if (isChecked) {
        const result:any = await addPermissionToRole(role, permission.id)
        if (result.error) {
          toast({
            title: 'Error adding permission',
            description: result.error,
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Permission added',
            description: `${permission.name} added to ${roleLabels[role as keyof typeof roleLabels]} role`,
          })
        }
      } else {
        const result:any = await removePermissionFromRole(role, permission.id)
        if (result.error) {
          toast({
            title: 'Error removing permission',
            description: result.error,
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Permission removed',
            description: `${permission.name} removed from ${roleLabels[role as keyof typeof roleLabels]} role`,
          })
        }
      }
    } catch (error) {
      toast({
        title: 'Error updating permission',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {rolesWithPermissions.map((roleData) => {
        const Icon = roleIcons[roleData.role as keyof typeof roleIcons] || Shield
        const rolePermissionIds = new Set(roleData.permissions.map(p => p.id))
        
        return (
          <Card key={roleData.role}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${roleColors[roleData.role as keyof typeof roleColors]}`} />
                {roleLabels[roleData.role as keyof typeof roleLabels]}
                <Badge variant="secondary" className="ml-2">
                  {roleData.permissions.length} permissions
                </Badge>
              </CardTitle>
              <CardDescription>
                Manage permissions for {roleLabels[roleData.role as keyof typeof roleLabels]} role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(permissionsByResource).map(([resource, permissions]) => (
                  <div key={resource} className="space-y-3">
                    <h4 className="font-medium capitalize text-sm text-muted-foreground">
                      {resource} ({permissions.filter(p => rolePermissionIds.has(p.id)).length}/{permissions.length})
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {permissions.map((permission) => {
                        const isChecked = rolePermissionIds.has(permission.id)
                        return (
                          <div key={permission.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                            <Checkbox
                              id={`${roleData.role}-${permission.id}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => 
                                handlePermissionToggle(roleData.role, permission, checked as boolean)
                              }
                              disabled={loading}
                            />
                            <div className="grid gap-1.5 leading-none flex-1">
                              <label
                                htmlFor={`${roleData.role}-${permission.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {permission.action || permission.name}
                              </label>
                              <p className="text-xs text-muted-foreground">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}