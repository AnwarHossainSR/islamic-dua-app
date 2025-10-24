import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { checkAdminStatus } from '@/lib/actions/auth'
import { getDuaById } from '@/lib/actions/duas'
import { ArrowLeft, Edit, Star, Volume2 } from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

export default async function ViewDuaPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await checkAdminStatus()
  if (!admin) {
    redirect('/login')
  }

  const { id } = await params

  try {
    const dua = await getDuaById(id)

    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" asChild>
            <Link href="/duas">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Duas
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/duas/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Dua
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">{dua.title_bn}</CardTitle>
                  {dua.is_important && (
                    <Badge variant="secondary">
                      <Star className="mr-1 h-3 w-3" />
                      Important
                    </Badge>
                  )}
                </div>
                {dua.title_en && <p className="text-lg text-muted-foreground">{dua.title_en}</p>}
                {dua.title_ar && <p className="text-right arabic-text text-xl">{dua.title_ar}</p>}
              </div>
              {dua.audio_url && (
                <Button variant="outline" size="sm">
                  <Volume2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-6 rounded-lg">
              <p className="text-right arabic-text text-2xl leading-relaxed">{dua.dua_text_ar}</p>
            </div>

            {dua.transliteration && (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Transliteration</h3>
                <p className="text-muted-foreground italic">{dua.transliteration}</p>
              </div>
            )}

            {dua.translation_bn && (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">বাংলা অনুবাদ</h3>
                <p className="leading-relaxed">{dua.translation_bn}</p>
              </div>
            )}

            {dua.translation_en && (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">English Translation</h3>
                <p className="leading-relaxed">{dua.translation_en}</p>
              </div>
            )}

            {dua.benefits && (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Benefits</h3>
                <p className="leading-relaxed">{dua.benefits}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <h4 className="font-medium mb-2">Category</h4>
                <Badge variant="outline">{dua.category}</Badge>
              </div>
              {dua.source && (
                <div>
                  <h4 className="font-medium mb-2">Source</h4>
                  <p className="text-sm text-muted-foreground">{dua.source}</p>
                </div>
              )}
              {dua.reference && (
                <div>
                  <h4 className="font-medium mb-2">Reference</h4>
                  <p className="text-sm text-muted-foreground">{dua.reference}</p>
                </div>
              )}
              {dua.tags && dua.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {dua.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
