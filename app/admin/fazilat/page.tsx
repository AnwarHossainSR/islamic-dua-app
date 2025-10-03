import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus } from "lucide-react"

async function getFazilat() {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase
    .from("fazilat")
    .select("*, dua:duas(title_bn)")
    .order("created_at", { ascending: false })
  return data || []
}

export default async function AdminFazilatPage() {
  const fazilat = await getFazilat()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold">Manage Fazilat</h1>
          <p className="text-muted-foreground">Add virtues and benefits of duas</p>
        </div>
        <Button asChild>
          <Link href="/admin/fazilat/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Fazilat
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {fazilat.map((item: any) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="line-clamp-2 text-lg">{item.title_bn}</CardTitle>
                  {item.dua && <CardDescription className="mt-1">{item.dua.title_bn}</CardDescription>}
                </div>
                {item.is_featured && <Badge variant="secondary">Featured</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">{item.description_bn}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                  <Link href={`/fazilat/${item.id}`}>View</Link>
                </Button>
                <Button size="sm" asChild className="flex-1">
                  <Link href={`/admin/fazilat/${item.id}`}>Edit</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {fazilat.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex min-h-[200px] items-center justify-center">
              <div className="text-center">
                <p className="mb-4 text-muted-foreground">No fazilat entries yet</p>
                <Button asChild>
                  <Link href="/admin/fazilat/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Fazilat
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
