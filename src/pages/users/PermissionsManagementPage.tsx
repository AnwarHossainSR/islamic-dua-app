import { Crown, Edit, Plus, Settings, Shield, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { permissionsApi } from '@/api/permissions.api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { useConfirm } from '@/components/ui/Confirm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Textarea } from '@/components/ui/Textarea';
import { apiLogger } from '@/lib/logger';

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

interface Role {
  role: string;
  permissions: Permission[];
}

const resources = ['challenges', 'duas', 'users', 'settings', 'logs', 'activities', 'dashboard'];
const actions = ['create', 'read', 'update', 'delete', 'manage'];

const roleIcons = {
  user: Users,
  editor: Edit,
  admin: Shield,
  super_admin: Crown,
};

const roleColors = {
  user: 'text-gray-500',
  editor: 'text-green-500',
  admin: 'text-blue-500',
  super_admin: 'text-red-500',
};

const roleLabels = {
  user: 'User',
  editor: 'Editor',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

export default function PermissionsManagementPage() {
  const { confirm, ConfirmDialog } = useConfirm();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolesWithPermissions, setRolesWithPermissions] = useState<Role[]>([]);
  const [, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [resource, setResource] = useState('');
  const [action, setAction] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [perms, roles] = await Promise.all([
        permissionsApi.getAll(),
        permissionsApi.getAllRolesWithPermissions(),
      ]);
      setPermissions(perms);
      setRolesWithPermissions(roles);
    } catch (error) {
      toast.error('Failed to load permissions');
      apiLogger.error('Load Permissions Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setResource('');
    setAction('');
  };

  const handleAddPermission = async () => {
    if (!name.trim() || !resource || !action) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await permissionsApi.create({
        name: name.trim(),
        description: description.trim(),
        resource,
        action,
      });
      toast.success(`${name} permission has been created`);
      setIsAddDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create permission');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePermission = async () => {
    if (!selectedPermission || !name.trim() || !resource || !action) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await permissionsApi.update(selectedPermission.id, {
        name: name.trim(),
        description: description.trim(),
        resource,
        action,
      });
      toast.success(`${name} permission has been updated`);
      setIsEditDialogOpen(false);
      setSelectedPermission(null);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update permission');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePermission = async (permissionId: string, permissionName: string) => {
    const confirmed = await confirm({
      title: 'Delete Permission',
      description: `Are you sure you want to delete "${permissionName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      confirmVariant: 'destructive',
      icon: 'warning',
    });
    if (confirmed) {
      await permissionsApi.delete(permissionId);
      toast.success(`${permissionName} has been deleted`);
      loadData();
    }
  };

  const openEditDialog = (permission: Permission) => {
    setSelectedPermission(permission);
    setName(permission.name);
    setDescription(permission?.description || '');
    setResource(permission?.resource || '');
    setAction(permission?.action || '');
    setIsEditDialogOpen(true);
  };

  const handlePermissionToggle = async (
    role: string,
    permission: Permission,
    isChecked: boolean
  ) => {
    try {
      if (isChecked) {
        await permissionsApi.addPermissionToRole(role, permission.id);
        toast.success(
          `${permission.name} added to ${roleLabels[role as keyof typeof roleLabels]} role`
        );
      } else {
        await permissionsApi.removePermissionFromRole(role, permission.id);
        toast.success(
          `${permission.name} removed from ${roleLabels[role as keyof typeof roleLabels]} role`
        );
      }
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update permission');
    }
  };

  const permissionsByResource = permissions.reduce(
    (acc, permission) => {
      const res = permission.resource || 'general';
      if (!acc[res]) {
        acc[res] = [];
      }
      acc[res].push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  const resourceCount = [...new Set(permissions.map((p) => p.resource || 'unknown'))].length;
  const actionCount = [...new Set(permissions.map((p) => p.action || 'unknown'))].length;

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
              <div className="space-y-6">
                {rolesWithPermissions.map((roleData) => {
                  const Icon = roleIcons[roleData.role as keyof typeof roleIcons] || Shield;
                  const rolePermissionIds = new Set(roleData.permissions.map((p) => p.id));

                  return (
                    <Card key={roleData.role}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Icon
                            className={`h-5 w-5 ${
                              roleColors[roleData.role as keyof typeof roleColors]
                            }`}
                          />
                          {roleLabels[roleData.role as keyof typeof roleLabels]}
                          <Badge variant="secondary" className="ml-2">
                            {roleData.permissions.length} permissions
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Manage permissions for{' '}
                          {roleLabels[roleData.role as keyof typeof roleLabels]} role
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {Object.entries(permissionsByResource).map(([res, perms]) => (
                            <div key={res} className="space-y-3">
                              <h4 className="font-medium capitalize text-sm text-muted-foreground">
                                {res} ({perms.filter((p) => rolePermissionIds.has(p.id)).length}/
                                {perms.length})
                              </h4>
                              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {perms.map((permission) => {
                                  const isChecked = rolePermissionIds.has(permission.id);
                                  return (
                                    <div
                                      key={permission.id}
                                      className="flex items-start space-x-3 p-3 border rounded-lg"
                                    >
                                      <Checkbox
                                        id={`${roleData.role}-${permission.id}`}
                                        checked={isChecked}
                                        onCheckedChange={(checked) =>
                                          handlePermissionToggle(
                                            roleData.role,
                                            permission,
                                            checked as boolean
                                          )
                                        }
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
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
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
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">
                      System Permissions ({permissions.length})
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Create and manage system permissions
                    </p>
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
                        <DialogDescription>Add a new permission to the system</DialogDescription>
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
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsAddDialogOpen(false);
                            resetForm();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleAddPermission} disabled={submitting}>
                          {submitting ? 'Creating...' : 'Create Permission'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-6">
                  {Object.entries(permissionsByResource).map(
                    ([resourceName, resourcePermissions]) => (
                      <Card key={resourceName}>
                        <CardHeader>
                          <CardTitle className="capitalize flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            {resourceName}
                            <Badge variant="secondary">
                              {resourcePermissions.length} permissions
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            Permissions for {resourceName} management
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4">
                            {resourcePermissions.map((permission) => (
                              <div
                                key={permission.id}
                                className="flex items-center justify-between p-4 border rounded-lg"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{permission.name}</p>
                                    <Badge variant="outline" className="text-xs">
                                      {permission.action || 'general'}
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
                                    onClick={() =>
                                      handleDeletePermission(permission.id, permission.name)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Permission</DialogTitle>
            <DialogDescription>Update permission details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Permission Name *</Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
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
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedPermission(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdatePermission} disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Permission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog />
    </div>
  );
}
