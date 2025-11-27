import { usersApi } from '@/api/users.api'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { Edit, Shield, Trash2, UserPlus, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useConfirm } from '@/components/ui/Confirm'

interface User {
  id: string
  user_id: string
  email: string
  role: string
  is_active: boolean
  created_at: string
}

export default function UsersPage() {
  const { confirm, ConfirmDialog } = useConfirm()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('editor')
  const [isActive, setIsActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState('')

  useEffect(() => {
    loadUsers()
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await import('@/lib/supabase/client').then(m => m.supabase.auth.getUser())
      if (user) setCurrentUserId(user.id)
    } catch (error) {
      console.error('Failed to get current user:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const data = await usersApi.getAll()
      setUsers(data)
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleAddAdmin = async () => {
    if (!email.trim()) {
      toast.error('Email is required')
      return
    }

    setSubmitting(true)
    try {
      const result = await usersApi.addAdmin(email, role, password || undefined)
      if (result.generatedPassword) {
        setGeneratedPassword(result.generatedPassword)
        toast.success(`Admin created! Password: ${result.generatedPassword}`)
      } else {
        toast.success(`Admin user ${email} has been added as ${role}`)
        setIsAddDialogOpen(false)
        setEmail('')
        setPassword('')
        setRole('editor')
        loadUsers()
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add admin')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    setSubmitting(true)
    try {
      await usersApi.update(selectedUser.id, { role, is_active: isActive })
      toast.success(`User ${selectedUser.email} has been updated`)
      setIsEditDialogOpen(false)
      setSelectedUser(null)
      loadUsers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveUser = async (userId: string, userEmail: string, userUserId: string) => {
    if (userUserId === currentUserId) {
      toast.error('You cannot delete your own account')
      return
    }

    const confirmed = await confirm({
      title: 'Remove Admin User',
      description: `Are you sure you want to remove ${userEmail} as admin? This action cannot be undone.`,
      confirmText: 'Remove',
      confirmVariant: 'destructive',
      icon: 'warning'
    });
    if (confirmed) {
      await usersApi.remove(userId);
      toast.success(`Admin user ${userEmail} has been removed`);
      loadUsers();
    }
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setRole(user.role)
    setIsActive(user.is_active)
    setIsEditDialogOpen(true)
  }

  return (
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
                  {users.filter((u) => u.role === 'super_admin').length}
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
                  {users.filter((u) => u.role === 'admin').length}
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
                  {users.filter((u) => u.role === 'editor').length}
                </p>
              </div>
              <Edit className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-end items-center">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Admin
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Admin User</DialogTitle>
                    <DialogDescription>
                      Add a new user with administrative privileges
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password (optional)</Label>
                      <Input
                        id="password"
                        type="text"
                        placeholder="Leave empty to auto-generate"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {generatedPassword && (
                      <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                        <Label className="text-green-800 dark:text-green-200 font-medium">Generated Password:</Label>
                        <div className="mt-2 p-2 bg-white dark:bg-background border rounded font-mono text-sm">
                          {generatedPassword}
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                          Please save this password - it won't be shown again!
                        </p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddDialogOpen(false)
                        setEmail('')
                        setPassword('')
                        setRole('editor')
                        setGeneratedPassword('')
                      }}
                    >
                      {generatedPassword ? 'Close' : 'Cancel'}
                    </Button>
                    {!generatedPassword && (
                      <Button onClick={handleAddAdmin} disabled={submitting}>
                        {submitting ? 'Adding...' : 'Add Admin'}
                      </Button>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex flex-wrap gap-2">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-12" />
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </div>
                    </div>
                  ))
                : users.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="font-medium truncate">{user.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant={
                              user.role === 'super_admin'
                                ? 'destructive'
                                : user.role === 'admin'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {user.role === 'super_admin'
                              ? 'Super Admin'
                              : user.role === 'admin'
                              ? 'Admin'
                              : user.role === 'editor'
                              ? 'Editor'
                              : 'User'}
                          </Badge>
                          <Badge variant={user.is_active ? 'default' : 'outline'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/users/${user.user_id}/permissions`}>
                              <Shield className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveUser(user.id, user.email, user.user_id)}
                            disabled={user.user_id === currentUserId}
                            title={user.user_id === currentUserId ? 'Cannot delete your own account' : 'Delete user'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

              {!loading && users.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No admin users found</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user role and status</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input value={selectedUser.email} disabled />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={isActive ? 'active' : 'inactive'}
                  onValueChange={(value) => setIsActive(value === 'active')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={submitting}>
              {submitting ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog />
    </div>
  )
}
