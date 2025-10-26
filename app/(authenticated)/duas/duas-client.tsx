'use client'

import { ActionButton } from '@/components/ui/action-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { deleteDua } from '@/lib/actions/duas'
import { BarChart3, BookOpen, Edit, Eye, Plus, Search, Star, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

interface Dua {
  id: string
  title_bn: string
  title_ar?: string
  title_en?: string
  dua_text_ar: string
  translation_bn?: string
  translation_en?: string
  category: string
  is_important: boolean
  tags?: string[]
  created_at: string
}

interface DuaCategory {
  id: string
  name_bn: string
  name_en?: string
  icon?: string
  color: string
}

interface DuaStats {
  total: number
  important: number
  byCategory: Record<string, number>
}

interface DuasClientProps {
  initialDuas: Dua[]
  categories: DuaCategory[]
  stats: DuaStats
  currentPage: number
  searchParams: {
    category?: string
    search?: string
    important?: string
  }
}

export default function DuasClient({
  initialDuas,
  categories,
  stats,
  currentPage,
  searchParams,
}: DuasClientProps) {
  const [searchQuery, setSearchQuery] = useState(searchParams.search || '')
  const [categoryFilter, setCategoryFilter] = useState(searchParams.category || 'all')
  const [importantFilter, setImportantFilter] = useState(searchParams.important === 'true')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (categoryFilter !== 'all') params.set('category', categoryFilter)
    if (importantFilter) params.set('important', 'true')

    startTransition(() => {
      router.push(`/duas?${params.toString()}`)
    })
  }

  const handleFilterChange = (key: string, value: string | boolean) => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)

    if (key === 'category') {
      setCategoryFilter(value as string)
      if (value !== 'all') params.set('category', value as string)
    } else if (key === 'important') {
      setImportantFilter(value as boolean)
      if (value) params.set('important', 'true')
    }

    if (categoryFilter !== 'all' && key !== 'category') params.set('category', categoryFilter)
    if (importantFilter && key !== 'important') params.set('important', 'true')

    startTransition(() => {
      router.push(`/duas?${params.toString()}`)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Duas Management</h1>
          <p className="text-muted-foreground">Manage Islamic duas and supplications</p>
        </div>
        <Button asChild>
          <Link href="/duas/add">
            <Plus className="mr-2 h-4 w-4" />
            Add New Dua
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Duas</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Important Duas</p>
                <p className="text-2xl font-bold">{stats.important}</p>
              </div>
              <Star className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{Object.keys(stats.byCategory).length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger className="cursor-pointer" value="all">
            All Duas
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="categories">
            Categories
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="stats">
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search duas..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Select
                  value={categoryFilter}
                  onValueChange={value => handleFilterChange('category', value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name_bn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant={importantFilter ? 'default' : 'outline'}
                  onClick={() => handleFilterChange('important', !importantFilter)}
                >
                  <Star className="mr-2 h-4 w-4" />
                  Important Only
                </Button>
                <Button onClick={handleSearch} disabled={isPending}>
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Duas Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {initialDuas.map(dua => (
              <Card key={dua.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg line-clamp-1">{dua.title_bn}</h3>
                        {dua.is_important && (
                          <Badge variant="secondary" className="shrink-0">
                            <Star className="h-3 w-3" />
                          </Badge>
                        )}
                      </div>
                      {dua.title_en && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{dua.title_en}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-4 rounded-lg border">
                    <p className="text-right arabic-text text-lg leading-relaxed line-clamp-3">
                      {dua.dua_text_ar}
                    </p>
                  </div>

                  {dua.translation_bn && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">বাংলা অনুবাদ</p>
                      <p className="text-sm line-clamp-2">{dua.translation_bn}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {dua.category}
                      </Badge>
                      {dua.tags && dua.tags.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          +{dua.tags.length} tags
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/duas/${dua.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/duas/${dua.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <ActionButton
                        action={deleteDua}
                        actionParams={[dua.id]}
                        title="Delete Dua"
                        description="Are you sure you want to delete this dua?"
                        confirmText="Delete"
                        confirmVariant="destructive"
                        size="sm"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4" />
                      </ActionButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {initialDuas.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <BookOpen className="mb-4 h-16 w-16 text-muted-foreground" />
                <p className="mb-2 text-lg font-semibold">No duas found</p>
                <p className="mb-4 text-sm text-muted-foreground">
                  Try adjusting your filters or add a new dua
                </p>
                <Button asChild>
                  <Link href="/duas/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Dua
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map(category => (
              <Card key={category.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      {category.icon || '📿'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{category.name_bn}</h3>
                      {category.name_en && (
                        <p className="text-sm text-muted-foreground">{category.name_en}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {stats.byCategory[category.id] || 0} duas
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.byCategory).map(([categoryId, count]) => {
                    const category = categories.find(c => c.id === categoryId)
                    const percentage = Math.round((count / stats.total) * 100)
                    return (
                      <div key={categoryId} className="flex items-center gap-3">
                        <span className="text-lg">{category?.icon || '📿'}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm">
                            <span>{category?.name_bn || categoryId}</span>
                            <span>
                              {count} ({percentage}%)
                            </span>
                          </div>
                          <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: category?.color || '#10b981',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
