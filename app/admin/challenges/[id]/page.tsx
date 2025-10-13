import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  createChallengeTemplate,
  getChallengeById,
  updateChallengeTemplate,
} from '@/lib/actions/challenges'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

interface Props {
  params: {
    id: string
  }
}

export default async function ChallengeFormPage({ params }: Props) {
  console.log('params', params)
  const isEdit = params.id && params.id !== 'new'
  const challenge = isEdit ? await getChallengeById(params.id) : null

  // If editing but challenge not found, show 404
  if (isEdit && !challenge) {
    notFound()
  }

  async function handleSubmit(formData: FormData) {
    'use server'

    if (isEdit && challenge) {
      await updateChallengeTemplate(challenge?.id, formData)
    } else {
      await createChallengeTemplate(formData)
    }

    redirect('/admin/challenges')
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/challenges">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-4xl font-bold">
            {isEdit ? 'Edit Challenge' : 'Create New Challenge'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update challenge details' : 'Add a new daily dhikr challenge'}
          </p>
        </div>
      </div>

      <form action={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title_bn">Title (Bangla) *</Label>
                  <Input
                    id="title_bn"
                    name="title_bn"
                    defaultValue={challenge?.title_bn}
                    required
                    placeholder="চ্যালেঞ্জের নাম"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title_ar">Title (Arabic)</Label>
                  <Input
                    id="title_ar"
                    name="title_ar"
                    defaultValue={challenge?.title_ar || ''}
                    placeholder="اسم التحدي"
                    className="arabic-text"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title_en">Title (English)</Label>
                <Input
                  id="title_en"
                  name="title_en"
                  defaultValue={challenge?.title_en || ''}
                  placeholder="Challenge Title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_bn">Description (Bangla) *</Label>
                <Textarea
                  id="description_bn"
                  name="description_bn"
                  defaultValue={challenge?.description_bn}
                  required
                  rows={3}
                  placeholder="চ্যালেঞ্জের বিস্তারিত বর্ণনা"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon (Emoji)</Label>
                  <Input
                    id="icon"
                    name="icon"
                    defaultValue={challenge?.icon || ''}
                    placeholder="📿"
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color (Hex)</Label>
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    defaultValue={challenge?.color || '#10b981'}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Arabic Text & Translations */}
          <Card>
            <CardHeader>
              <CardTitle>Dhikr Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="arabic_text">Arabic Text *</Label>
                <Textarea
                  id="arabic_text"
                  name="arabic_text"
                  defaultValue={challenge?.arabic_text}
                  required
                  rows={3}
                  className="arabic-text text-xl"
                  placeholder="النص العربي"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transliteration_bn">Transliteration (Bangla)</Label>
                <Textarea
                  id="transliteration_bn"
                  name="transliteration_bn"
                  defaultValue={challenge?.transliteration_bn || ''}
                  rows={2}
                  placeholder="বাংলা উচ্চারণ"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="translation_bn">Translation (Bangla) *</Label>
                <Textarea
                  id="translation_bn"
                  name="translation_bn"
                  defaultValue={challenge?.translation_bn}
                  required
                  rows={3}
                  placeholder="বাংলা অনুবাদ"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="translation_en">Translation (English)</Label>
                <Textarea
                  id="translation_en"
                  name="translation_en"
                  defaultValue={challenge?.translation_en || ''}
                  rows={3}
                  placeholder="English translation"
                />
              </div>
            </CardContent>
          </Card>

          {/* Challenge Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Challenge Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="daily_target_count">Daily Target Count *</Label>
                  <Input
                    id="daily_target_count"
                    name="daily_target_count"
                    type="number"
                    min="1"
                    defaultValue={challenge?.daily_target_count || 21}
                    required
                  />
                  <p className="text-xs text-muted-foreground">How many times per day</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total_days">Total Days *</Label>
                  <Input
                    id="total_days"
                    name="total_days"
                    type="number"
                    min="1"
                    max="365"
                    defaultValue={challenge?.total_days || 21}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Challenge duration</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="recommended_time">Recommended Time</Label>
                  <Select
                    name="recommended_time"
                    defaultValue={challenge?.recommended_time || 'anytime'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anytime">Anytime</SelectItem>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                      <SelectItem value="after_fajr">After Fajr</SelectItem>
                      <SelectItem value="after_maghrib">After Maghrib</SelectItem>
                      <SelectItem value="after_isha">After Isha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recommended_prayer">Recommended Prayer</Label>
                  <Select
                    name="recommended_prayer"
                    defaultValue={challenge?.recommended_prayer || ''}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select prayer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">None</SelectItem>
                      <SelectItem value="fajr">Fajr</SelectItem>
                      <SelectItem value="dhuhr">Dhuhr</SelectItem>
                      <SelectItem value="asr">Asr</SelectItem>
                      <SelectItem value="maghrib">Maghrib</SelectItem>
                      <SelectItem value="isha">Isha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty_level">Difficulty Level</Label>
                <Select
                  name="difficulty_level"
                  defaultValue={challenge?.difficulty_level || 'medium'}
                >
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

          {/* Fazilat (Benefits) */}
          <Card>
            <CardHeader>
              <CardTitle>Fazilat (Benefits/Virtues)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fazilat_bn">Fazilat (Bangla)</Label>
                <Textarea
                  id="fazilat_bn"
                  name="fazilat_bn"
                  defaultValue={challenge?.fazilat_bn || ''}
                  rows={4}
                  placeholder="এই দোয়া পড়ার ফজিলত ও উপকারিতা"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Reference</Label>
                <Input
                  id="reference"
                  name="reference"
                  defaultValue={challenge?.reference || ''}
                  placeholder="হাদীস বা কুরআনের রেফারেন্স"
                />
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  name="display_order"
                  type="number"
                  defaultValue={challenge?.display_order || 0}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_featured"
                  name="is_featured"
                  defaultChecked={challenge?.is_featured}
                />
                <Label htmlFor="is_featured" className="font-normal">
                  Featured Challenge
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  name="is_active"
                  defaultChecked={challenge?.is_active ?? true}
                />
                <Label htmlFor="is_active" className="font-normal">
                  Active
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button type="submit" size="lg" className="flex-1">
              {isEdit ? 'Update Challenge' : 'Create Challenge'}
            </Button>
            <Button type="button" variant="outline" size="lg" asChild>
              <Link href="/admin/challenges">Cancel</Link>
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
