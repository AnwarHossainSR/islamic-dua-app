"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Category } from "@/lib/types/database"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { useState, useTransition } from "react"

export function DuaFilters({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(searchParams.get("search") || "")

  function handleCategoryChange(value: string) {
    const params = new URLSearchParams(searchParams)
    if (value === "all") {
      params.delete("category")
    } else {
      params.set("category", value)
    }
    startTransition(() => {
      router.push(`/duas?${params.toString()}`)
    })
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set("search", value)
    } else {
      params.delete("search")
    }
    startTransition(() => {
      router.push(`/duas?${params.toString()}`)
    })
  }

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search duas..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
          disabled={isPending}
        />
      </div>
      <Select defaultValue={searchParams.get("category") || "all"} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name_bn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
