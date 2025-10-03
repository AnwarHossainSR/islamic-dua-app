import { CategoryForm } from "@/components/admin/category-form"

export default function NewCategoryPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="mb-2 text-4xl font-bold">Add New Category</h1>
        <p className="text-muted-foreground">Create a new category for duas</p>
      </div>

      <CategoryForm />
    </div>
  )
}
