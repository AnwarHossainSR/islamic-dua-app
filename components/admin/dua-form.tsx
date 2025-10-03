"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createDua, updateDua, deleteDua } from "@/lib/actions/admin-mutations"
import type { Category, DuaWithDetails } from "@/lib/types/database"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

export function DuaForm({ dua, categories }: { dua?: DuaWithDetails; categories: Category[] }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const isEditing = !!dua

  async function handleDelete() {
    if (!dua || !confirm("Are you sure you want to delete this dua?")) return

    setIsDeleting(true)
    const result = await deleteDua(dua.id)
    if (result.success) {
      router.push("/admin/duas")
    }
  }

  return (
    <form action={isEditing ? updateDua.bind(null, dua.id) : createDua}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select name="category_id" defaultValue={dua?.category_id || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name_bn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title_bn">Title (Bangla) *</Label>
                <Input id="title_bn" name="title_bn" defaultValue={dua?.title_bn} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title_ar">Title (Arabic)</Label>
                <Input id="title_ar" name="title_ar" defaultValue={dua?.title_ar || ""} dir="rtl" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title_en">Title (English)</Label>
              <Input id="title_en" name="title_en" defaultValue={dua?.title_en || ""} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dua Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="arabic_text">Arabic Text *</Label>
              <Textarea
                id="arabic_text"
                name="arabic_text"
                defaultValue={dua?.arabic_text}
                rows={4}
                dir="rtl"
                className="arabic-text"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transliteration_bn">Transliteration (Bangla)</Label>
              <Textarea
                id="transliteration_bn"
                name="transliteration_bn"
                defaultValue={dua?.transliteration_bn || ""}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="translation_bn">Translation (Bangla) *</Label>
              <Textarea
                id="translation_bn"
                name="translation_bn"
                defaultValue={dua?.translation_bn}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="translation_en">Translation (English)</Label>
              <Textarea id="translation_en" name="translation_en" defaultValue={dua?.translation_en || ""} rows={4} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input id="reference" name="reference" defaultValue={dua?.reference || ""} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="is_featured" name="is_featured" defaultChecked={dua?.is_featured} />
              <Label htmlFor="is_featured" className="cursor-pointer">
                Featured Dua
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="is_active" name="is_active" defaultChecked={dua?.is_active ?? true} />
              <Label htmlFor="is_active" className="cursor-pointer">
                Active
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" size="lg">
            {isEditing ? "Update Dua" : "Create Dua"}
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
      </div>
    </form>
  )
}
