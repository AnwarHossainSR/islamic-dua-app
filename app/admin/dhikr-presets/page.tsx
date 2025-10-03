import { getDhikrPresets } from "@/lib/actions/dhikr"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function AdminDhikrPresetsPage() {
  const presets = await getDhikrPresets()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold">Manage Dhikr Presets</h1>
          <p className="text-muted-foreground">Configure dhikr counter presets</p>
        </div>
        <Button asChild>
          <Link href="/admin/dhikr-presets/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Preset
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {presets.map((preset) => (
          <Card key={preset.id}>
            <CardHeader>
              <div className="mb-2 flex items-start justify-between gap-2">
                <CardTitle className="text-lg">{preset.name_bn}</CardTitle>
                {preset.is_default && <Badge variant="secondary">Default</Badge>}
              </div>
              {preset.name_ar && <CardDescription>{preset.name_ar}</CardDescription>}
              <div className="arabic-text pt-4 text-xl">{preset.arabic_text}</div>
              <p className="text-sm text-muted-foreground">Target: {preset.target_count}x</p>
              <Button size="sm" asChild className="mt-4">
                <Link href={`/admin/dhikr-presets/${preset.id}`}>Edit</Link>
              </Button>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
