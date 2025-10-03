"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions/admin-mutations"
import type { Category } from "@/lib/types/database"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

export function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const isEditing = !!category

  async function handleDelete() {
    if (!category || !confirm("Are you sure you want to delete this category?")) return

    setIsDeleting(true)
    const result = await deleteCategory(category.id)
    if (result.success) {
      router.push("/admin/categories")
    }
  }

  return (
    <form action={isEditing ? updateCategory.bind(null, category.id) : createCategory}>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name_bn">Name (Bangla) *</Label>
              <Input id="name_bn" name="name_bn" defaultValue={category?.name_bn} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name_ar">Name (Arabic)</Label>
              <Input id="name_ar" name="name_ar" defaultValue={category?.name_ar || ""} dir="rtl" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name_en">Name (English)</Label>
            <Input id="name_en" name="name_en" defaultValue={category?.name_en || ""} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" name="slug" defaultValue={category?.slug} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Input id="icon" name="icon" defaultValue={category?.icon || ""} placeholder="e.g., 🌅" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_order">Display Order</Label>
            <Input id="display_order" name="display_order" type="number" defaultValue={category?.display_order || 0} />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="is_active" name="is_active" defaultChecked={category?.is_active ?? true} />
            <Label htmlFor="is_active" className="cursor-pointer">
              Active
            </Label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" size="lg">
              {isEditing ? "Update Category" : "Create Category"}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
              Cancel
            </Button>
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                size="lg"
                onClick={handleDelete}
                disabled={isDeleting}
                className="ml-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
