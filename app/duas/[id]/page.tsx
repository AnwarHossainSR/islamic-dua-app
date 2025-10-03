import { getDuaById } from "@/lib/actions/duas"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookmarkButton } from "@/components/duas/bookmark-button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DuaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dua = await getDuaById(id)

  if (!dua) {
    notFound()
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/duas">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Duas
        </Link>
      </Button>

      <div className="mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="mb-2 text-2xl">{dua.title_bn}</CardTitle>
                {dua.title_ar && <CardDescription className="text-lg">{dua.title_ar}</CardDescription>}
                {dua.category && (
                  <div className="mt-3">
                    <Badge variant="secondary">{dua.category.name_bn}</Badge>
                  </div>
                )}
              </div>
              <BookmarkButton duaId={dua.id} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Arabic Text */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Arabic Text</h3>
              <div className="arabic-text rounded-lg bg-accent/50 p-6 text-2xl leading-loose">{dua.arabic_text}</div>
            </div>

            {/* Transliteration */}
            {dua.transliteration_bn && (
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Transliteration
                </h3>
                <p className="bangla-text rounded-lg bg-muted/50 p-4 text-lg">{dua.transliteration_bn}</p>
              </div>
            )}

            {/* Translation */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Translation (Bangla)
              </h3>
              <p className="bangla-text rounded-lg bg-muted/50 p-4 text-lg leading-relaxed">{dua.translation_bn}</p>
            </div>

            {dua.translation_en && (
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Translation (English)
                </h3>
                <p className="rounded-lg bg-muted/50 p-4 leading-relaxed">{dua.translation_en}</p>
              </div>
            )}

            {/* Reference */}
            {dua.reference && (
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Reference</h3>
                <p className="text-muted-foreground">{dua.reference}</p>
              </div>
            )}

            {/* Fazilat (Virtues) */}
            {dua.fazilat && dua.fazilat.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="mb-4 text-xl font-semibold">Fazilat (Virtues)</h3>
                  <div className="space-y-4">
                    {dua.fazilat
                      .sort((a, b) => a.display_order - b.display_order)
                      .map((fazilat) => (
                        <Card key={fazilat.id} className="bg-primary/5">
                          <CardContent className="pt-6">
                            <p className="bangla-text mb-2 leading-relaxed">{fazilat.text_bn}</p>
                            {fazilat.reference && (
                              <p className="text-sm text-muted-foreground">Reference: {fazilat.reference}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              </>
            )}

            {/* Tags */}
            {dua.tags && dua.tags.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {dua.tags.map((item: any) => (
                    <Badge key={item.tag.id} variant="outline">
                      {item.tag.name_bn}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
