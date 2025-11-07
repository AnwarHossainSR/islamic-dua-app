'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Plus } from 'lucide-react'
import { addSalahAmol } from '@/lib/actions/salah'
import { AmolFormData, SalahType, SALAH_TYPES } from '@/lib/types/salah'

export default function AddAmolPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<AmolFormData>({
    name_bn: '',
    name_en: '',
    description_bn: '',
    description_en: '',
    salah_type: 'fajr',
    reward_points: 10,
    is_required: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await addSalahAmol(formData)
      if (result.success) {
        router.push('/salah')
      }
    } catch (error) {
      console.error('Error adding amol:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">নতুন আমল যোগ করুন</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            আমল তৈরি করুন
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
                {loading ? 'যোগ করা হচ্ছে...' : 'আমল যোগ করুন'}
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