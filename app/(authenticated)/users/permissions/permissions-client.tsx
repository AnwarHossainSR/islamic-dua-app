'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createPermission, updatePermission, deletePermission } from '@/lib/actions/role-permissions'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, Shield } from 'lucide-react'
import { useState } from 'react'

interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
  created_at: string
}

interface PermissionsManagementClientProps {
  permissions: Permission[]
}

const resources = ['challenges', 'duas', 'users', 'settings', 'logs', 'activities', 'dashboard']
const actions = ['create', 'read', 'update', 'delete', 'manage']

export function PermissionsManagementClient({ permissions }: PermissionsManagementClientProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [resource, setResource] = useState('')
  const [action, setAction] = useState('')

  // Group permissions by resource
  const permissionsByResource = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = []
    }
    acc[permission.resource].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  const resetForm = () => {
    setName('')
    setDescription('')
    setResource('')
    setAction('')
  }

  const handleAddPermission = async () => {
    if (!name.trim() || !resource || !action) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const result = await createPermission({
        name: name.trim(),
        description: description.trim(),
        resource,
        action
      })

      if (result.error) {
        toast({
          title: 'Error creating permission',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Permission created',
          description: `${name} permission has been created`,
        })
        setIsAddDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      toast({
        title: 'Error creating permission',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePermission = async () => {
    if (!selectedPermission || !name.trim() || !resource || !action) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const result = await updatePermission(selectedPermission.id, {
        name: name.trim(),
        description: description.trim(),
        resource,
        action
      })

      if (result.error) {
        toast({
          title: 'Error updating permission',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Permission updated',
          description: `${name} permission has been updated`,
        })
        setIsEditDialogOpen(false)
        setSelectedPermission(null)
        resetForm()
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

  const handleDeletePermission = async (permission: Permission) => {
    if (!confirm(`Are you sure you want to delete "${permission.name}"? This action cannot be undone.`)) {
      return
    }

    setLoading(true)
    try {
      const result = await deletePermission(permission.id)

      if (result.error) {
        toast({
          title: 'Error deleting permission',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Permission deleted',
          description: `${permission.name} has been deleted`,
        })
      }
    } catch (error) {
      toast({
        title: 'Error deleting permission',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (permission: Permission) => {
    setSelectedPermission(permission)
    setName(permission.name)
    setDescription(permission.description)
    setResource(permission.resource)
    setAction(permission.action)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">System Permissions ({permissions.length})</h3>
          <p className="text-sm text-muted-foreground">Create and manage system permissions</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Permission
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Permission</DialogTitle>
              <DialogDescription>
                Add a new permission to the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Permission Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., challenges.create"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of what this permission allows"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="resource">Resource *</Label>
                  <Select value={resource} onValueChange={setResource}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select resource" />
                    </SelectTrigger>
                    <SelectContent>
                      {resources.map((res) => (
                        <SelectItem key={res} value={res}>
                          {res}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="action">Action *</Label>
                  <Select value={action} onValueChange={setAction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      {actions.map((act) => (
                        <SelectItem key={act} value={act}>
                          {act}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsAddDialogOpen(false)
                resetForm()
              }}>
                Cancel
              </Button>
              <Button onClick={handleAddPermission} disabled={loading}>
                {loading ? 'Creating...' : 'Create Permission'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {Object.entries(permissionsByResource).map(([resourceName, resourcePermissions]) => (
          <Card key={resourceName}>
            <CardHeader>
              <CardTitle className="capitalize flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {resourceName}
                <Badge variant="secondary">{resourcePermissions.length} permissions</Badge>
              </CardTitle>
              <CardDescription>
                Permissions for {resourceName} management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {resourcePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{permission.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {permission.action}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {permission.description || 'No description'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(permission)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePermission(permission)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Permission</DialogTitle>
            <DialogDescription>
              Update permission details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Permission Name *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-resource">Resource *</Label>
                <Select value={resource} onValueChange={setResource}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {resources.map((res) => (
                      <SelectItem key={res} value={res}>
                        {res}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-action">Action *</Label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {actions.map((act) => (
                      <SelectItem key={act} value={act}>
                        {act}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false)
              setSelectedPermission(null)
              resetForm()
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePermission} disabled={loading}>
              {loading ? 'Updating...' : 'Update Permission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}