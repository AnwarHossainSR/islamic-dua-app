import { duasApi } from "@/api/duas.api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

interface DuaFormData {
  title_bn: string;
  title_ar: string;
  title_en: string;
  dua_text_ar: string;
  transliteration: string;
  translation_bn: string;
  translation_en: string;
  category: string;
  source: string;
  reference: string;
  benefits: string;
  tags: string[];
  is_important: boolean;
  audio_url: string;
}

export default function DuaEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<DuaFormData>({
    title_bn: "",
    title_ar: "",
    title_en: "",
    dua_text_ar: "",
    transliteration: "",
    translation_bn: "",
    translation_en: "",
    category: "",
    source: "",
    reference: "",
    benefits: "",
    tags: [],
    is_important: false,
    audio_url: "",
  });

  useEffect(() => {
    if (!id) return;

    const loadDua = async () => {
      try {
        const dua = await duasApi.getById(id);
        setFormData({
          title_bn: dua?.title_bn || "",
          title_ar: dua?.title_ar || "",
          title_en: dua?.title_en || "",
          dua_text_ar: dua?.dua_text_ar || "",
          transliteration: dua?.transliteration || "",
          translation_bn: dua?.translation_bn || "",
          translation_en: dua?.translation_en || "",
          category: dua?.category || "",
          source: dua?.source || "",
          reference: dua?.reference || "",
          benefits: dua?.benefits || "",
          tags: dua?.tags || [],
          is_important: dua?.is_important || false,
          audio_url: dua?.audio_url || "",
        });
      } catch (error) {
        toast.error("Failed to load dua");
        navigate("/duas");
      }
    };

    loadDua();
  }, [id, navigate]);

  const handleInputChange = (field: keyof DuaFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTagsChange = (value: string) => {
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    setFormData((prev) => ({ ...prev, tags }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await duasApi.update(id!, formData);
      toast.success("Dua updated successfully");
      navigate(`/duas/${id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update dua");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" asChild>
          <Link to={`/duas/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dua
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Dua</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Basic Information</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="title_bn">Title (Bengali)</Label>
                <Input
                  id="title_bn"
                  value={formData.title_bn}
                  onChange={(e) => handleInputChange("title_bn", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="title_ar">Title (Arabic)</Label>
                <Input
                  id="title_ar"
                  value={formData.title_ar}
                  onChange={(e) => handleInputChange("title_ar", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="title_en">Title (English)</Label>
                <Input
                  id="title_en"
                  value={formData.title_en}
                  onChange={(e) => handleInputChange("title_en", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dua_text_ar">Arabic Text</Label>
              <Textarea
                id="dua_text_ar"
                value={formData.dua_text_ar}
                onChange={(e) => handleInputChange("dua_text_ar", e.target.value)}
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="transliteration">Transliteration</Label>
              <Textarea
                id="transliteration"
                value={formData.transliteration}
                onChange={(e) => handleInputChange("transliteration", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold">Translations</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="translation_bn">Translation (Bengali)</Label>
              <Textarea
                id="translation_bn"
                value={formData.translation_bn}
                onChange={(e) => handleInputChange("translation_bn", e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="translation_en">Translation (English)</Label>
              <Textarea
                id="translation_en"
                value={formData.translation_en}
                onChange={(e) => handleInputChange("translation_en", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold">Additional Information</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={(e) => handleInputChange("source", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="reference">Reference</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => handleInputChange("reference", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="benefits">Benefits</Label>
              <Textarea
                id="benefits"
                value={formData.benefits}
                onChange={(e) => handleInputChange("benefits", e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags.join(", ")}
                onChange={(e) => handleTagsChange(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="audio_url">Audio URL</Label>
                <Input
                  id="audio_url"
                  value={formData.audio_url}
                  onChange={(e) => handleInputChange("audio_url", e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="is_important"
                  checked={formData.is_important}
                  onChange={(e) => handleInputChange("is_important", e.target.checked)}
                />
                <Label htmlFor="is_important">Important Dua</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Dua"}
          </Button>
        </div>
      </form>
    </div>
  );
}
