import { ArrowLeft, Settings, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { permissionsApi } from '@/api/permissions.api';
import { Loader } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { apiLogger } from '@/lib/logger';

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

interface User {
  id: string;
  user_id: string;
  email: string;
  role: string;
  is_active: boolean;
  permissions: Permission[];
  allPermissions: Permission[];
}

export default function UserPermissionsPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    if (!id) return;
    try {
      const data = await permissionsApi.getUserPermissions(id);
      setUser(data);
    } catch (error: any) {
      toast.error('Failed to load user permissions');
      apiLogger.error('Error loading user permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = async (permission: Permission, isChecked: boolean) => {
    if (!user) return;

    try {
      if (isChecked) {
        await permissionsApi.addPermissionToRole(user.role, permission.id);
        toast.success(`${permission.name} added to ${user.role} role`);
      } else {
        await permissionsApi.removePermissionFromRole(user.role, permission.id);
        toast.success(`${permission.name} removed from ${user.role} role`);
      }
      loadUser();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update permission');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">User not found</p>
        <Button asChild className="mt-4">
          <Link to="/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
      </div>
    );
  }

  const permissionsByResource = user.allPermissions.reduce(
    (acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = [];
      }
      acc[permission.resource].push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  const userPermissionNames = new Set(user.permissions.map((p) => p.name));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/users">
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
          <div className="space-y-6">
            <div className="grid gap-4">
              <h3 className="text-lg font-medium">
                Current Permissions ({user.permissions.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.permissions.map((permission) => (
                  <Badge key={permission.name} variant="secondary">
                    {permission.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Manage Role Permissions</h3>
              <p className="text-sm text-muted-foreground">
                Changes will affect all users with the <strong>{user.role}</strong> role.
              </p>

              {Object.entries(permissionsByResource).map(([resource, permissions]) => (
                <Card key={resource}>
                  <CardHeader>
                    <CardTitle className="capitalize">{resource}</CardTitle>
                    <CardDescription>Permissions for {resource} management</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {permissions.map((permission) => {
                        const isChecked = userPermissionNames.has(permission.name);
                        return (
                          <div key={permission.id} className="flex items-start space-x-3">
                            <Checkbox
                              id={permission.id}
                              checked={isChecked}
                              onCheckedChange={(checked) =>
                                handlePermissionToggle(permission, checked as boolean)
                              }
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
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
