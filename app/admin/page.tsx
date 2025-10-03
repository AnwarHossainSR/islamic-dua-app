import { getAdminStats, getRecentDuas } from "@/lib/actions/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, FolderTree, Tags, Heart, Upload } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminDashboard() {
  const stats = await getAdminStats()
  const recentDuas = await getRecentDuas()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-4xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your Islamic content and monitor activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Duas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDuas}</div>
            <p className="text-xs text-muted-foreground">Active supplications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FolderTree className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">Organized collections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tags</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTags}</div>
            <p className="text-xs text-muted-foreground">Classification tags</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookmarks</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookmarks}</div>
            <p className="text-xs text-muted-foreground">User favorites</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Duas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Duas</CardTitle>
              <CardDescription>Latest additions to the collection</CardDescription>
            </div>
            <Button asChild>
              <Link href="/admin/duas">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentDuas.map((dua: any) => (
              <div key={dua.id} className="flex items-start justify-between border-b border-border pb-4 last:border-0">
                <div className="flex-1">
                  <h3 className="font-medium">{dua.title_bn}</h3>
                  <p className="text-sm text-muted-foreground">{dua.category?.name_bn || "Uncategorized"}</p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/duas/${dua.id}`}>Edit</Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Button asChild className="h-auto flex-col gap-2 py-4">
              <Link href="/admin/duas/new">
                <BookOpen className="h-6 w-6" />
                <span>Add New Dua</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent">
              <Link href="/admin/categories">
                <FolderTree className="h-6 w-6" />
                <span>Manage Categories</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent">
              <Link href="/admin/import-export">
                <Upload className="h-6 w-6" />
                <span>Import/Export</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
