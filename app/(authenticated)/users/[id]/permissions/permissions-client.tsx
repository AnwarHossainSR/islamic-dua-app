'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { addPermissionToRole, removePermissionFromRole } from '@/lib/actions/role-permissions'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'

interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
}

interface UserPermission {
  user_id: string
  role: string
  permission_name: string
  resource: string
  action: string
  description: string
}

interface User {
  id: string
  user_id: string
  email: string
  role: string
  is_active: boolean
}

interface PermissionsClientProps {
  user: User
  userPermissions: UserPermission[]
  allPermissions: Permission[]
}

export function PermissionsClient({ user, userPermissions, allPermissions }: PermissionsClientProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Group permissions by resource
  const permissionsByResource = allPermissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = []
    }
    acc[permission.resource].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  // Get user's current permission names
  const userPermissionNames = new Set(userPermissions.map(p => p.permission_name))

  const handlePermissionToggle = async (permission: Permission, isChecked: boolean) => {
    setLoading(true)
    try {
      if (isChecked) {
        const result = await addPermissionToRole(user.role, permission.id)
        if (result.error) {
          toast({
            title: 'Error adding permission',
            description: result.error,
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Permission added',
            description: `${permission.name} added to ${user.role} role`,
          })
        }
      } else {
        const result = await removePermissionFromRole(user.role, permission.id)
        if (result.error) {
          toast({
            title: 'Error removing permission',
            description: result.error,
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Permission removed',
            description: `${permission.name} removed from ${user.role} role`,
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
      {/* Current Permissions Summary */}
      <div className="grid gap-4">
        <h3 className="text-lg font-medium">Current Permissions ({userPermissions.length})</h3>
        <div className="flex flex-wrap gap-2">
          {userPermissions.map((permission) => (
            <Badge key={permission.permission_name} variant="secondary">
              {permission.permission_name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Permissions by Resource */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Manage Role Permissions</h3>
        <p className="text-sm text-muted-foreground">
          Changes will affect all users with the <strong>{user.role}</strong> role.
        </p>
        
        {Object.entries(permissionsByResource).map(([resource, permissions]) => (
          <Card key={resource}>
            <CardHeader>
              <CardTitle className="capitalize">{resource}</CardTitle>
              <CardDescription>
                Permissions for {resource} management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {permissions.map((permission) => {
                  const isChecked = userPermissionNames.has(permission.name)
                  return (
                    <div key={permission.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={permission.id}
                        checked={isChecked}
                        onCheckedChange={(checked) => 
                          handlePermissionToggle(permission, checked as boolean)
                        }
                        disabled={loading}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor={permission.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {permission.name}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}