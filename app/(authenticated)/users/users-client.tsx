'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { addAdminUser, removeAdminUser, updateAdminUser } from '@/lib/actions/admin-users'
import { Edit, Shield, Trash2, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface User {
  id: string
  user_id: string
  email: string
  role: string
  is_active: boolean
  created_at: string
}

interface UsersClientProps {
  users: User[]
}

export function UsersClient({ users }: UsersClientProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('editor')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const { toast } = useToast()

  const handleAddAdmin = async () => {
    if (!email.trim()) {
      toast({
        title: 'Email is required',
        description: 'Please enter an email address',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const result = await addAdminUser(email, role, password || undefined)
      if (result.error) {
        toast({
          title: 'Error adding admin',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        if (result.generatedPassword) {
          setGeneratedPassword(result.generatedPassword)
          toast({
            title: 'Admin user created!',
            description: `Password: ${result.generatedPassword}`,
          })
        } else {
          toast({
            title: 'Admin added successfully',
            description: `Admin user ${email} has been added as ${role}`,
          })
          setIsAddDialogOpen(false)
          setEmail('')
          setPassword('')
          setRole('editor')
        }
      }
    } catch (error) {
      toast({
        title: 'Error adding admin',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    setLoading(true)
    try {
      const result = await updateAdminUser(selectedUser.id, { role, is_active: isActive })
      if (result.error) {
        toast({
          title: 'Error updating user',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'User updated successfully',
          description: `User ${selectedUser.email} has been updated`,
        })
        setIsEditDialogOpen(false)
        setSelectedUser(null)
      }
    } catch (error) {
      toast({
        title: 'Error updating user',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to remove ${userEmail} as admin?`)) return

    setLoading(true)
    try {
      const result = await removeAdminUser(userId)
      if (result.error) {
        toast({
          title: 'Error removing admin',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Admin removed successfully',
          description: `Admin user ${userEmail} has been removed`,
        })
      }
    } catch (error) {
      toast({
        title: 'Error removing admin',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setRole(user.role)
    setIsActive(user.is_active)
    setIsEditDialogOpen(true)
  }

  return (
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
              <DialogDescription>Add a new user with administrative privileges</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password">Password (optional)</Label>
                <Input
                  id="password"
                  type="text"
                  placeholder="Leave empty to auto-generate"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
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
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <Label className="text-green-800 font-medium">Generated Password:</Label>
                  <div className="mt-1 p-2 bg-white border rounded font-mono text-sm">
                    {generatedPassword}
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Please save this password - it won't be shown again!
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsAddDialogOpen(false)
                setEmail('')
                setPassword('')
                setRole('editor')
                setGeneratedPassword('')
              }}>
                {generatedPassword ? 'Close' : 'Cancel'}
              </Button>
              {!generatedPassword && (
                <Button onClick={handleAddAdmin} disabled={loading}>
                  {loading ? 'Adding...' : 'Add Admin'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {users.map(user => (
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
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/users/${user.user_id}/permissions`}>
                    <Shield className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveUser(user.id, user.email)}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">No admin users found</div>
        )}
      </div>

      {/* Edit Dialog */}
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
                  onValueChange={value => setIsActive(value === 'active')}
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
            <Button onClick={handleUpdateUser} disabled={loading}>
              {loading ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
