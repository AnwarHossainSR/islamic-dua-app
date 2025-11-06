'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Plus } from 'lucide-react'
import { addAmol, getSalahPrayers } from '@/lib/actions/salah'
import { AmolFormData } from '@/lib/types/salah'

export default function AddAmolPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [prayers, setPrayers] = useState<any[]>([])
  const [formData, setFormData] = useState<AmolFormData>({
    salah_prayer_id: '',
    name_en: '',
    name_bn: '',
    description_en: '',
    description_bn: '',
    reward_points: 1,
    is_required: false
  })

  useEffect(() => {
    const loadPrayers = async () => {
      const prayerList = await getSalahPrayers()
      setPrayers(prayerList)
    }
    loadPrayers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await addAmol(formData)
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
        <h1 className="text-2xl font-bold">Add New Amol</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Amol
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="prayer">Prayer</Label>
              <Select 
                value={formData.salah_prayer_id} 
                onValueChange={(value) => setFormData({...formData, salah_prayer_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select prayer" />
                </SelectTrigger>
                <SelectContent>
                  {prayers.map((prayer) => (
                    <SelectItem key={prayer.id} value={prayer.id}>
                      {prayer.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name_en">Name (English)</Label>
                <Input
                  id="name_en"
                  value={formData.name_en}
                  onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="name_bn">Name (Bengali)</Label>
                <Input
                  id="name_bn"
                  value={formData.name_bn || ''}
                  onChange={(e) => setFormData({...formData, name_bn: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="description_en">Description (English)</Label>
                <Textarea
                  id="description_en"
                  value={formData.description_en || ''}
                  onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="description_bn">Description (Bengali)</Label>
                <Textarea
                  id="description_bn"
                  value={formData.description_bn || ''}
                  onChange={(e) => setFormData({...formData, description_bn: e.target.value})}
                  rows={3}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="reward_points">Reward Points</Label>
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
              <Label htmlFor="is_required">Required Amol</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Amol'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}