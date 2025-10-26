import { getDuaCategories, getDuas, getDuaStats } from '@/lib/actions/duas'
import DuasClient from './duas-client'

export const dynamic = 'force-dynamic'

export default async function DuasPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string
    search?: string
    important?: string
    page?: string
  }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const limit = 20
  const offset = (page - 1) * limit

  const [duas, categories, stats] = await Promise.all([
    getDuas({
      category: params.category,
      search: params.search,
      isImportant: params.important === 'true',
      limit,
      offset,
    }),
    getDuaCategories(),
    getDuaStats(),
  ])

  return (
    <DuasClient
      initialDuas={duas}
      categories={categories}
      stats={stats}
      currentPage={page}
      searchParams={params}
    />
  )
}
