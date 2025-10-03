import { getCategories } from "@/lib/actions/duas"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function AdminCategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold">Manage Categories</h1>
          <p className="text-muted-foreground">Organize duas into meaningful categories</p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  {category.icon && <span className="text-2xl">{category.icon}</span>}
                  <div>
                    <CardTitle className="text-lg">{category.name_bn}</CardTitle>
                    {category.name_ar && <CardDescription>{category.name_ar}</CardDescription>}
                  </div>
                </div>
                {!category.is_active && <Badge variant="destructive">Inactive</Badge>}
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                  <Link href={`/duas?category=${category.id}`}>View Duas</Link>
                </Button>
                <Button size="sm" asChild className="flex-1">
                  <Link href={`/admin/categories/${category.id}`}>Edit</Link>
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
