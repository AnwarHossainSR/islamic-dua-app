import { challengesApi } from "@/api/challenges.api";
import JsonImportClient from "@/components/JsonImportClient";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function ChallengeFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id && id !== "new";
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    
    const loadChallenge = async () => {
      try {
        const data = await challengesApi.getById(id!);
        setChallenge(data);
      } catch (error) {
        console.error("Error loading challenge:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChallenge();
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      title_bn: formData.get("title_bn") as string,
      title_ar: formData.get("title_ar") as string,
      title_en: formData.get("title_en") as string,
      description_bn: formData.get("description_bn") as string,
      description_ar: formData.get("description_ar") as string,
      description_en: formData.get("description_en") as string,
      icon: formData.get("icon") as string,
      color: formData.get("color") as string,
      arabic_text: formData.get("arabic_text") as string,
      transliteration_bn: formData.get("transliteration_bn") as string,
      translation_bn: formData.get("translation_bn") as string,
      translation_en: formData.get("translation_en") as string,
      daily_target_count: parseInt(formData.get("daily_target_count") as string),
      total_days: parseInt(formData.get("total_days") as string),
      recommended_time: formData.get("recommended_time") as string,
      recommended_prayer: formData.get("recommended_prayer") as string,
      difficulty_level: formData.get("difficulty_level") as string,
      fazilat_bn: formData.get("fazilat_bn") as string,
      fazilat_ar: formData.get("fazilat_ar") as string,
      fazilat_en: formData.get("fazilat_en") as string,
      reference: formData.get("reference") as string,
      display_order: parseInt(formData.get("display_order") as string) || 0,
      is_featured: formData.get("is_featured") === "on",
      is_active: formData.get("is_active") === "on",
    };

    try {
      if (isEdit) {
        await challengesApi.update(id!, data);
        toast.success("Challenge updated successfully!");
      } else {
        await challengesApi.create(data);
        toast.success("Challenge created successfully!");
      }
      navigate("/challenges");
    } catch (error) {
      console.error("Error saving challenge:", error);
      toast.error("Failed to save challenge");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/challenges">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-4xl font-bold">
            {isEdit ? "Edit Challenge" : "Create New Challenge"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? "Update challenge details" : "Add a new daily dhikr challenge"}
          </p>
        </div>
      </div>

      <JsonImportClient />

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Basic Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title_bn">Title (Bangla) *</Label>
                  <Input id="title_bn" name="title_bn" defaultValue={challenge?.title_bn || ""} required placeholder="চ্যালেঞ্জের নাম" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title_ar">Title (Arabic)</Label>
                  <Input id="title_ar" name="title_ar" defaultValue={challenge?.title_ar || ""} placeholder="اسم التحدي" className="arabic-text" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title_en">Title (English)</Label>
                <Input id="title_en" name="title_en" defaultValue={challenge?.title_en || ""} placeholder="Challenge Title" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_bn">Description (Bangla) *</Label>
                <Textarea id="description_bn" name="description_bn" defaultValue={challenge?.description_bn || ""} required rows={3} placeholder="চ্যালেঞ্জের বিস্তারিত বর্ণনা" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_ar">Description (Arabic)</Label>
                <Textarea id="description_ar" name="description_ar" defaultValue={challenge?.description_ar || ""} rows={3} placeholder="وصف التحدي" className="arabic-text" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_en">Description (English)</Label>
                <Textarea id="description_en" name="description_en" defaultValue={challenge?.description_en || ""} rows={3} placeholder="Challenge description" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon (Emoji)</Label>
                  <Input id="icon" name="icon" defaultValue={challenge?.icon || ""} placeholder="📿" maxLength={4} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color (Hex)</Label>
                  <Input id="color" name="color" type="color" defaultValue={challenge?.color || "#10b981"} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Dhikr Content</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="arabic_text">Arabic Text *</Label>
                <Textarea id="arabic_text" name="arabic_text" defaultValue={challenge?.arabic_text || ""} required rows={3} className="arabic-text text-xl" placeholder="النص العربي" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transliteration_bn">Transliteration (Bangla)</Label>
                <Textarea id="transliteration_bn" name="transliteration_bn" defaultValue={challenge?.transliteration_bn || ""} rows={2} placeholder="বাংলা উচ্চারণ" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="translation_bn">Translation (Bangla) *</Label>
                <Textarea id="translation_bn" name="translation_bn" defaultValue={challenge?.translation_bn || ""} required rows={3} placeholder="বাংলা অনুবাদ" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="translation_en">Translation (English)</Label>
                <Textarea id="translation_en" name="translation_en" defaultValue={challenge?.translation_en || ""} rows={3} placeholder="English translation" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Challenge Settings</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="daily_target_count">Daily Target Count *</Label>
                  <Input id="daily_target_count" name="daily_target_count" type="number" min="1" defaultValue={challenge?.daily_target_count || 21} required />
                  <p className="text-xs text-muted-foreground">How many times per day</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total_days">Total Days *</Label>
                  <Input id="total_days" name="total_days" type="number" min="1" max="365" defaultValue={challenge?.total_days || 21} required />
                  <p className="text-xs text-muted-foreground">Challenge duration</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="recommended_time">Recommended Time</Label>
                  <Select name="recommended_time" defaultValue={challenge?.recommended_time || "anytime"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anytime">Anytime</SelectItem>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                      <SelectItem value="before_fajr">Before Fajr</SelectItem>
                      <SelectItem value="after_fajr">After Fajr</SelectItem>
                      <SelectItem value="after_maghrib">After Maghrib</SelectItem>
                      <SelectItem value="after_isha">After Isha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recommended_prayer">Recommended Prayer</Label>
                  <Select name="recommended_prayer" defaultValue={challenge?.recommended_prayer || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select prayer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="fajr">Fajr</SelectItem>
                      <SelectItem value="dhuhr">Dhuhr</SelectItem>
                      <SelectItem value="asr">Asr</SelectItem>
                      <SelectItem value="maghrib">Maghrib</SelectItem>
                      <SelectItem value="isha">Isha</SelectItem>
                      <SelectItem value="tahajjut">Tahajjut</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty_level">Difficulty Level</Label>
                <Select name="difficulty_level" defaultValue={challenge?.difficulty_level || "medium"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Fazilat (Benefits/Virtues)</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fazilat_bn">Fazilat (Bangla)</Label>
                <Textarea id="fazilat_bn" name="fazilat_bn" defaultValue={challenge?.fazilat_bn || ""} rows={4} placeholder="এই দোয়া পড়ার ফজিলত ও উপকারিতা" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fazilat_ar">Fazilat (Arabic)</Label>
                <Textarea id="fazilat_ar" name="fazilat_ar" defaultValue={challenge?.fazilat_ar || ""} rows={4} placeholder="فضائل هذا الذكر" className="arabic-text" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fazilat_en">Fazilat (English)</Label>
                <Textarea id="fazilat_en" name="fazilat_en" defaultValue={challenge?.fazilat_en || ""} rows={4} placeholder="Benefits of this dhikr" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Reference</Label>
                <Input id="reference" name="reference" defaultValue={challenge?.reference || ""} placeholder="হাদীস বা কুরআনের রেফারেন্স" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Display Settings</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input id="display_order" name="display_order" type="number" defaultValue={challenge?.display_order || 0} />
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="is_featured" name="is_featured" defaultChecked={challenge?.is_featured || false} />
                <Label htmlFor="is_featured" className="font-normal">Featured Challenge</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="is_active" name="is_active" defaultChecked={challenge?.is_active ?? true} />
                <Label htmlFor="is_active" className="font-normal">Active</Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" size="lg" className="flex-1">
              {isEdit ? "Update Challenge" : "Create Challenge"}
            </Button>
            <Button type="button" variant="outline" size="lg" asChild>
              <Link to="/challenges">Cancel</Link>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
