import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Shield, Mail, Calendar } from "lucide-react"

async function getAdminUsers() {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("admin_users")
    .select(`
      *,
      user_email:user_id
    `)
    .order("created_at", { ascending: false })

  console.log("[v0] Admin users query result:", { data, error })

  if (error) {
    console.error("[v0] Error fetching admin users:", error)
    return []
  }

  const usersWithEmails = await Promise.all(
    (data || []).map(async (admin) => {
      const { data: userData } = await supabase.auth.admin.getUserById(admin.user_id)
      return {
        ...admin,
        user: userData?.user,
      }
    }),
  )

  return usersWithEmails
}

export default async function AdminUsersPage() {
  const adminUsers = await getAdminUsers()

  console.log("[v0] Rendering admin users page with:", adminUsers.length, "users")

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold">Admin Users</h1>
          <p className="text-muted-foreground">Manage users with admin access</p>
        </div>
        <Button asChild>
          <Link href="/admin/users/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Admin User
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers.length}</div>
            <p className="text-xs text-muted-foreground">Active admin accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers.filter((u: any) => u.role === "super_admin").length}</div>
            <p className="text-xs text-muted-foreground">Full access users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Editors</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers.filter((u: any) => u.role === "editor").length}</div>
            <p className="text-xs text-muted-foreground">Content editors</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
          <CardDescription>All users with administrative privileges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adminUsers.map((admin: any) => (
              <div
                key={admin.id}
                className="flex items-center justify-between gap-4 border-b border-border pb-4 last:border-0"
              >
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="font-medium">{admin.user?.email || admin.user_id}</h3>
                    <Badge variant={admin.role === "super_admin" ? "default" : "secondary"}>
                      {admin.role === "super_admin" ? "Super Admin" : "Editor"}
                    </Badge>
                    {!admin.is_active && <Badge variant="destructive">Inactive</Badge>}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Added {new Date(admin.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" asChild>
                  <Link href={`/admin/users/${admin.id}`}>Edit</Link>
                </Button>
              </div>
            ))}
            {adminUsers.length === 0 && (
              <div className="flex min-h-[200px] items-center justify-center">
                <div className="text-center">
                  <p className="mb-4 text-muted-foreground">No admin users found</p>
                  <Button asChild>
                    <Link href="/admin/users/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Admin User
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
