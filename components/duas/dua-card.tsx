import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { DuaWithDetails } from "@/lib/types/database"
import Link from "next/link"

export function DuaCard({ dua }: { dua: DuaWithDetails }) {
  return (
    <Link href={`/duas/${dua.id}`}>
      <Card className="h-full transition-all hover:shadow-lg">
        <CardHeader>
          <div className="mb-2 flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 text-lg">{dua.title_bn}</CardTitle>
            {dua.is_featured && (
              <Badge variant="secondary" className="shrink-0">
                Featured
              </Badge>
            )}
          </div>
          {dua.category && <CardDescription>{dua.category.name_bn}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="arabic-text mb-4 line-clamp-3 text-right text-xl">{dua.arabic_text}</div>
          <p className="bangla-text line-clamp-2 text-sm text-muted-foreground">{dua.translation_bn}</p>
          {dua.reference && <p className="mt-2 text-xs text-muted-foreground">Reference: {dua.reference}</p>}
        </CardContent>
      </Card>
    </Link>
  )
}
