import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus } from "lucide-react"

async function getTags() {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase.from("tags").select("*").order("name_bn", { ascending: true })
  return data || []
}

export default async function AdminTagsPage() {
  const tags = await getTags()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold">Manage Tags</h1>
          <p className="text-muted-foreground">Create and organize tags for duas</p>
        </div>
        <Button asChild>
          <Link href="/admin/tags/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Tag
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {tags.map((tag) => (
          <Card key={tag.id}>
            <CardHeader>
              <CardTitle className="text-lg">{tag.name_bn}</CardTitle>
              {tag.name_ar && <CardDescription>{tag.name_ar}</CardDescription>}
              <Button size="sm" asChild className="mt-4">
                <Link href={`/admin/tags/${tag.id}`}>Edit</Link>
              </Button>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
