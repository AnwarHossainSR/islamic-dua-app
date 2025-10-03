import { getDuas } from "@/lib/actions/duas"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function AdminDuasPage() {
  const duas = await getDuas()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold">Manage Duas</h1>
          <p className="text-muted-foreground">View and edit all duas in the collection</p>
        </div>
        <Button asChild>
          <Link href="/admin/duas/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Dua
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {duas.map((dua) => (
          <Card key={dua.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="line-clamp-2 text-lg">{dua.title_bn}</CardTitle>
                <div className="flex shrink-0 gap-1">
                  {dua.is_featured && <Badge variant="secondary">Featured</Badge>}
                  {!dua.is_active && <Badge variant="destructive">Inactive</Badge>}
                </div>
              </div>
              {dua.category && <CardDescription>{dua.category.name_bn}</CardDescription>}
            </CardHeader>
            <CardContent>
              <div className="arabic-text mb-4 line-clamp-2 text-right text-lg">{dua.arabic_text}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                  <Link href={`/duas/${dua.id}`}>View</Link>
                </Button>
                <Button size="sm" asChild className="flex-1">
                  <Link href={`/admin/duas/${dua.id}`}>Edit</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
