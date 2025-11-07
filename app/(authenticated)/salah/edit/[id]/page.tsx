'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Edit } from 'lucide-react'
import { getSalahAmolById, editSalahAmol } from '@/lib/actions/salah'
import { AmolFormData, SalahType, SALAH_TYPES } from '@/lib/types/salah'

export default function EditAmolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState<AmolFormData>({
    name_bn: '',
    name_en: '',
    description_bn: '',
    description_en: '',
    arabic_text: '',
    transliteration: '',
    translation_bn: '',
    translation_en: '',
    repetition_count: 1,
    salah_type: 'fajr',
    reward_points: 10,
    is_required: false
  })

  useEffect(() => {
    loadAmol()
  }, [id])

  const loadAmol = async () => {
    try {
      const amol = await getSalahAmolById(id)
      if (amol) {
        setFormData({
          name_bn: amol.name_bn,
          name_en: amol.name_en || '',
          description_bn: amol.description_bn || '',
          description_en: amol.description_en || '',
          arabic_text: amol.arabic_text || '',
          transliteration: amol.transliteration || '',
          translation_bn: amol.translation_bn || '',
          translation_en: amol.translation_en || '',
          repetition_count: amol.repetition_count || 1,
          salah_type: amol.salah_type as SalahType,
          reward_points: amol.reward_points || 1,
          is_required: amol.is_required || false
        })
      }
    } catch (error) {
      console.error('Error loading amol:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await editSalahAmol(id, formData)
      if (result.success) {
        router.push('/salah')
      }
    } catch (error) {
      console.error('Error updating amol:', error)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">আমল সম্পাদনা করুন</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            আমল আপডেট করুন
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="salah_type">সালাহ টাইপ</Label>
              <Select 
                value={formData.salah_type} 
                onValueChange={(value) => setFormData({...formData, salah_type: value as SalahType})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="সালাহ টাইপ নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SALAH_TYPES).map(([key, type]) => (
                    <SelectItem key={key} value={key}>
                      {type.icon} {type.name_bn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name_bn">নাম (বাংলা)</Label>
                <Input
                  id="name_bn"
                  value={formData.name_bn}
                  onChange={(e) => setFormData({...formData, name_bn: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="name_en">নাম (ইংরেজি)</Label>
                <Input
                  id="name_en"
                  value={formData.name_en || ''}
                  onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="description_bn">বিবরণ (বাংলা)</Label>
                <Textarea
                  id="description_bn"
                  value={formData.description_bn || ''}
                  onChange={(e) => setFormData({...formData, description_bn: e.target.value})}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="description_en">বিবরণ (ইংরেজি)</Label>
                <Textarea
                  id="description_en"
                  value={formData.description_en || ''}
                  onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                  rows={3}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="arabic_text">আরবি টেক্সট</Label>
              <Textarea
                id="arabic_text"
                value={formData.arabic_text || ''}
                onChange={(e) => setFormData({...formData, arabic_text: e.target.value})}
                rows={2}
                dir="rtl"
                className="text-xl"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="transliteration">উচ্চারণ</Label>
                <Input
                  id="transliteration"
                  value={formData.transliteration || ''}
                  onChange={(e) => setFormData({...formData, transliteration: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="translation_bn">অর্থ (বাংলা)</Label>
                <Input
                  id="translation_bn"
                  value={formData.translation_bn || ''}
                  onChange={(e) => setFormData({...formData, translation_bn: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="repetition_count">কতবার পড়তে হবে</Label>
                <Input
                  id="repetition_count"
                  type="number"
                  min="1"
                  value={formData.repetition_count}
                  onChange={(e) => setFormData({...formData, repetition_count: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="reward_points">পুরস্কার পয়েন্ট</Label>
                <Input
                  id="reward_points"
                  type="number"
                  min="1"
                  value={formData.reward_points}
                  onChange={(e) => setFormData({...formData, reward_points: parseInt(e.target.value)})}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_required"
                checked={formData.is_required}
                onChange={(e) => setFormData({...formData, is_required: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="is_required">আবশ্যক আমল</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'আপডেট করা হচ্ছে...' : 'আমল আপডেট করুন'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                বাতিল
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}