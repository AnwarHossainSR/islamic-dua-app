import { BookmarkButton } from '@/components/duas/bookmark-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getDuaById } from '@/lib/actions/duas'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function DuaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dua = await getDuaById(id)

  if (!dua) {
    notFound()
  }

  return (
    <div className=" px-4 py-6 sm:px-6 sm:py-8">
      <Button variant="ghost" asChild className="mb-4 sm:mb-6">
        <Link href="/duas">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Duas
        </Link>
      </Button>

      <div className="mx-auto max-w-4xl">
        <Card>
          <CardHeader className="space-y-3 sm:space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="flex-1 space-y-2">
                <CardTitle className="text-xl leading-tight sm:text-2xl">{dua.title_bn}</CardTitle>
                {dua.title_ar && (
                  <CardDescription className="text-base sm:text-lg">{dua.title_ar}</CardDescription>
                )}
                {dua.category && (
                  <div className="mt-2 sm:mt-3">
                    <Badge variant="secondary">{dua.category.name_bn}</Badge>
                  </div>
                )}
              </div>
              <BookmarkButton duaId={dua.id} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Arabic Text */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:mb-3 sm:text-sm">
                Arabic Text
              </h3>
              <div className="arabic-text break-words rounded-lg bg-accent/50 p-4 text-xl leading-loose sm:p-6 sm:text-2xl">
                {dua.arabic_text}
              </div>
            </div>

            {/* Transliteration */}
            {dua.transliteration_bn && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:mb-3 sm:text-sm">
                  Transliteration
                </h3>
                <p className="bangla-text break-words rounded-lg bg-muted/50 p-3 text-base leading-relaxed sm:p-4 sm:text-lg">
                  {dua.transliteration_bn}
                </p>
              </div>
            )}

            {/* Translation */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:mb-3 sm:text-sm">
                Translation (Bangla)
              </h3>
              <p className="bangla-text break-words rounded-lg bg-muted/50 p-3 text-base leading-relaxed sm:p-4 sm:text-lg">
                {dua.translation_bn}
              </p>
            </div>

            {dua.translation_en && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:mb-3 sm:text-sm">
                  Translation (English)
                </h3>
                <p className="break-words rounded-lg bg-muted/50 p-3 leading-relaxed sm:p-4">
                  {dua.translation_en}
                </p>
              </div>
            )}

            {/* Reference */}
            {dua.reference && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:mb-3 sm:text-sm">
                  Reference
                </h3>
                <p className="break-words text-sm text-muted-foreground sm:text-base">
                  {dua.reference}
                </p>
              </div>
            )}

            {/* Fazilat (Virtues) */}
            {dua.fazilat && dua.fazilat.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="mb-3 text-lg font-semibold sm:mb-4 sm:text-xl">
                    Fazilat (Virtues)
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {dua.fazilat
                      .sort((a, b) => a.display_order - b.display_order)
                      .map(fazilat => (
                        <Card key={fazilat.id} className="bg-primary/5">
                          <CardContent className="pt-4 sm:pt-6">
                            <p className="bangla-text mb-2 break-words text-sm leading-relaxed sm:text-base">
                              {fazilat.text_bn}
                            </p>
                            {fazilat.reference && (
                              <p className="break-words text-xs text-muted-foreground sm:text-sm">
                                Reference: {fazilat.reference}
                              </p>
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
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:mb-3 sm:text-sm">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dua.tags.map((item: any) => (
                    <Badge key={item.tag.id} variant="outline" className="text-xs sm:text-sm">
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
