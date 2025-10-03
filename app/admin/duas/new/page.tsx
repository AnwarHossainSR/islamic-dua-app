import { getCategories } from "@/lib/actions/duas"
import { DuaForm } from "@/components/admin/dua-form"

export default async function NewDuaPage() {
  const categories = await getCategories()

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="mb-2 text-4xl font-bold">Add New Dua</h1>
        <p className="text-muted-foreground">Create a new dua entry</p>
      </div>

      <DuaForm categories={categories} />
    </div>
  )
}
