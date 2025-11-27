import { duasApi } from "@/api/duas.api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { Dua } from "@/lib/types/duas";
import { ArrowLeft, Edit, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function DuaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [dua, setDua] = useState<Dua | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadDua = async () => {
      try {
        const data = await duasApi.getById(id);
        setDua(data);
      } catch (error) {
        console.error("Error loading dua:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDua();
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!dua) {
    return <div className="flex items-center justify-center min-h-screen">Dua not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link to="/duas">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Duas
          </Link>
        </Button>
        <Button asChild>
          <Link to={`/duas/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{dua.title_bn}</h1>
                {dua.is_important && (
                  <Badge variant="secondary">
                    <Star className="h-4 w-4" />
                  </Badge>
                )}
              </div>
              {dua.title_en && <p className="text-lg text-muted-foreground">{dua.title_en}</p>}
              {dua.title_ar && (
                <p className="text-lg text-muted-foreground arabic-text">{dua.title_ar}</p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-6 rounded-lg border">
            <p className="text-right arabic-text text-2xl leading-loose">{dua.dua_text_ar}</p>
          </div>

          {dua.transliteration && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">Transliteration</h3>
              <p className="text-lg italic">{dua.transliteration}</p>
            </div>
          )}

          {dua.translation_bn && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">বাংলা অনুবাদ</h3>
              <p className="text-lg">{dua.translation_bn}</p>
            </div>
          )}

          {dua.translation_en && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">English Translation</h3>
              <p className="text-lg">{dua.translation_en}</p>
            </div>
          )}

          {dua.benefits && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">Benefits</h3>
              <p className="text-base">{dua.benefits}</p>
            </div>
          )}

          {dua.source && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">Source</h3>
              <p className="text-base">{dua.source}</p>
            </div>
          )}

          {dua.reference && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">Reference</h3>
              <p className="text-base">{dua.reference}</p>
            </div>
          )}

          <div className="flex items-center gap-2 pt-4 border-t">
            <Badge variant="outline">{dua.category}</Badge>
            {dua.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
