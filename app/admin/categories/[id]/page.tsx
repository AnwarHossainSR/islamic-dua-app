import { getSupabaseServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { CategoryForm } from "@/components/admin/category-form"

async function getCategory(id: string) {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase.from("categories").select("*").eq("id", id).single()
  return data
}

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const category = await getCategory(id)

  if (!category) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="mb-2 text-4xl font-bold">Edit Category</h1>
        <p className="text-muted-foreground">Update category information</p>
      </div>

      <CategoryForm category={category} />
    </div>
  )
}
