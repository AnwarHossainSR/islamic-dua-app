import { DuaCard } from '@/components/duas/dua-card'
import { DuaCardSkeleton } from '@/components/duas/dua-card-skeleton'
import { DuaFilters } from '@/components/duas/dua-filters'
import { getCategories, getDuas } from '@/lib/actions/duas'
import { Suspense } from 'react'

export default async function DuasPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>
}) {
  const params = await searchParams
  const categories = await getCategories()

  return (
    <div className=" py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Duas Collection</h1>
        <p className="text-muted-foreground">
          Browse our comprehensive collection of Islamic supplications
        </p>
      </div>

      <DuaFilters categories={categories} />

      <Suspense
        fallback={
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <DuaCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <DuasList categoryId={params.category} search={params.search} />
      </Suspense>
    </div>
  )
}

async function DuasList({ categoryId, search }: { categoryId?: string; search?: string }) {
  const duas = await getDuas({ categoryId, search })

  if (duas.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-muted-foreground">No duas found. Try adjusting your filters.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {duas.map(dua => (
        <DuaCard key={dua.id} dua={dua} />
      ))}
    </div>
  )
}
