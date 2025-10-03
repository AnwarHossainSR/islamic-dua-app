import { getDuaById, getCategories } from "@/lib/actions/duas"
import { notFound } from "next/navigation"
import { DuaForm } from "@/components/admin/dua-form"

export default async function EditDuaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [dua, categories] = await Promise.all([getDuaById(id), getCategories()])

  if (!dua) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="mb-2 text-4xl font-bold">Edit Dua</h1>
        <p className="text-muted-foreground">Update dua information</p>
      </div>

      <DuaForm dua={dua} categories={categories} />
    </div>
  )
}
