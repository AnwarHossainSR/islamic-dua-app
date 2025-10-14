import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getDhikrPresets } from '@/lib/actions/dhikr'
import Link from 'next/link'

export default async function DhikrPage() {
  const presets = await getDhikrPresets()

  return (
    <div className=" py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Dhikr Counter</h1>
        <p className="text-muted-foreground">Select a dhikr to begin your remembrance of Allah</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {presets.map(preset => (
          <Link key={preset.id} href={`/dhikr/${preset.id}`}>
            <Card className="h-full transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <CardTitle className="text-xl">{preset.name_bn}</CardTitle>
                  {preset.is_default && (
                    <Badge variant="secondary" className="shrink-0">
                      Popular
                    </Badge>
                  )}
                </div>
                {preset.name_ar && (
                  <CardDescription className="text-lg">{preset.name_ar}</CardDescription>
                )}
                <div className="arabic-text mt-4 text-2xl">{preset.arabic_text}</div>
                <p className="bangla-text mt-3 text-sm text-muted-foreground">
                  {preset.translation_bn}
                </p>
                <p className="mt-2 text-sm font-medium text-primary">
                  Target: {preset.target_count}x
                </p>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
