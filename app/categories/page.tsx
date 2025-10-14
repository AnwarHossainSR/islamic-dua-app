import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCategories } from '@/lib/actions/duas'
import Link from 'next/link'

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className=" py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Categories</h1>
        <p className="text-muted-foreground">Browse duas by category</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map(category => (
          <Link key={category.id} href={`/duas?category=${category.id}`}>
            <Card className="h-full transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex items-center gap-3">
                  {category.icon && <span className="text-3xl">{category.icon}</span>}
                  <CardTitle className="text-xl">{category.name_bn}</CardTitle>
                </div>
                {category.name_ar && (
                  <CardDescription className="text-base">{category.name_ar}</CardDescription>
                )}
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
