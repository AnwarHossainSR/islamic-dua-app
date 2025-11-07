'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Search, Filter, CheckCircle2, Edit, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import { SalahAmol, SalahType, SALAH_TYPES } from '@/lib/types/salah'
import { getAllSalahAmols, getUserSalahProgress, toggleAmolCompletion, deleteSalahAmol } from '@/lib/actions/salah'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function SalahPage() {
  const [amols, setAmols] = useState<SalahAmol[]>([])
  const [filteredAmols, setFilteredAmols] = useState<SalahAmol[]>([])
  const [userProgress, setUserProgress] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<SalahType | 'all'>('all')
  const [showCompleted, setShowCompleted] = useState(true)
  const [showPending, setShowPending] = useState(true)
  const [selectedAmol, setSelectedAmol] = useState<SalahAmol | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterAmols()
  }, [amols, searchTerm, selectedType, showCompleted, showPending, userProgress])

  const loadData = async () => {
    setLoading(true)
    try {
      const [amolsData, progressData] = await Promise.all([
        getAllSalahAmols(),
        getUserSalahProgress()
      ])
      setAmols(amolsData.map(amol => ({
        ...amol,
        name_en: amol.name_en || undefined,
        description_bn: amol.description_bn || undefined,
        description_en: amol.description_en || undefined,
        arabic_text: amol.arabic_text || undefined,
        transliteration: amol.transliteration || undefined,
        translation_bn: amol.translation_bn || undefined,
        translation_en: amol.translation_en || undefined,
        repetition_count: amol.repetition_count || 1,
        reward_points: amol.reward_points || 1,
        is_required: amol.is_required || false,
        sort_order: amol.sort_order || 0,
        is_active: amol.is_active || true,
        salah_type: amol.salah_type as SalahType,
        created_at: typeof amol.created_at === 'string' ? amol.created_at : amol.created_at?.toISOString() || new Date().toISOString(),
        updated_at: typeof amol.updated_at === 'string' ? amol.updated_at : amol.updated_at?.toISOString() || new Date().toISOString()
      })))
      setUserProgress(progressData.map(p => p.amol_id || ''))
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAmols = () => {
    let filtered = amols

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(amol => 
        amol.name_bn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        amol.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        amol.description_bn?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(amol => amol.salah_type === selectedType)
    }

    // Completion filter
    filtered = filtered.filter(amol => {
      const isCompleted = userProgress.includes(amol.id)
      return (showCompleted && isCompleted) || (showPending && !isCompleted)
    })

    setFilteredAmols(filtered)
  }

  const handleToggleCompletion = async (amolId: string) => {
    try {
      await toggleAmolCompletion(amolId)
      await loadData()
    } catch (error) {
      console.error('Error toggling completion:', error)
    }
  }

  const handleDelete = async (amolId: string) => {
    if (confirm('আপনি কি এই আমলটি মুছে ফেলতে চান?')) {
      try {
        await deleteSalahAmol(amolId)
        await loadData()
      } catch (error) {
        console.error('Error deleting amol:', error)
      }
    }
  }

  const getTypeStats = () => {
    const stats: Record<SalahType | 'all', { total: number; completed: number }> = {
      all: { total: 0, completed: 0 },
      fajr: { total: 0, completed: 0 },
      dhuhr: { total: 0, completed: 0 },
      asr: { total: 0, completed: 0 },
      maghrib: { total: 0, completed: 0 },
      isha: { total: 0, completed: 0 },
      tahajjud: { total: 0, completed: 0 },
      chasht: { total: 0, completed: 0 },
      ishraq: { total: 0, completed: 0 },
      nafal: { total: 0, completed: 0 }
    }

    amols.forEach(amol => {
      const isCompleted = userProgress.includes(amol.id)
      stats[amol.salah_type].total++
      stats.all.total++
      if (isCompleted) {
        stats[amol.salah_type].completed++
        stats.all.completed++
      }
    })

    return stats
  }

  const stats = getTypeStats()

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">সালাহ আমল</h1>
          <p className="text-muted-foreground">
            সকল সালাতের পর করণীয় আমল সমূহ
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/salah/add">
            <Plus className="mr-2 h-4 w-4" />
            নতুন আমল যোগ করুন
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.all.completed}</p>
              <p className="text-sm text-muted-foreground">আজ সম্পূর্ণ</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.all.total}</p>
              <p className="text-sm text-muted-foreground">মোট আমল</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{Math.round((stats.all.completed / stats.all.total) * 100) || 0}%</p>
              <p className="text-sm text-muted-foreground">সম্পূর্ণতা</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.all.total - stats.all.completed}</p>
              <p className="text-sm text-muted-foreground">বাকি আছে</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            ফিল্টার ও অনুসন্ধান
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="আমল খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as SalahType | 'all')}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="সালাহ টাইপ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব ধরনের</SelectItem>
                {Object.entries(SALAH_TYPES).map(([key, type]) => (
                  <SelectItem key={key} value={key}>
                    {type.icon} {type.name_bn} ({stats[key as SalahType].completed}/{stats[key as SalahType].total})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="completed"
                checked={showCompleted}
                onCheckedChange={(checked) => setShowCompleted(checked === true)}
              />
              <label htmlFor="completed" className="text-sm">সম্পূর্ণ</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pending"
                checked={showPending}
                onCheckedChange={(checked) => setShowPending(checked === true)}
              />
              <label htmlFor="pending" className="text-sm">বাকি</label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amols List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAmols.map((amol) => {
          const isCompleted = userProgress.includes(amol.id)
          const typeInfo = SALAH_TYPES[amol.salah_type]

          return (
            <Card
              key={amol.id}
              className={`transition-all ${
                isCompleted
                  ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800'
                  : ''
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                      style={{ backgroundColor: typeInfo.color + '20' }}
                    >
                      {typeInfo.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{amol.name_bn}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">
                        {typeInfo.name_bn}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedAmol(amol)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <span style={{ color: typeInfo.color }}>{typeInfo.icon}</span>
                            {amol.name_bn}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {amol.description_bn && (
                            <div>
                              <h4 className="font-semibold mb-2">বিবরণ:</h4>
                              <p className="text-muted-foreground">{amol.description_bn}</p>
                            </div>
                          )}
                          
                          {amol.arabic_text && (
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                              <h4 className="font-semibold mb-2">আরবি টেক্সট:</h4>
                              <p className="text-2xl text-emerald-700 dark:text-emerald-300 mb-2 text-right" dir="rtl">
                                {amol.arabic_text}
                              </p>
                              {amol.transliteration && (
                                <p className="text-sm text-muted-foreground italic mb-1">
                                  <strong>উচ্চারণ:</strong> {amol.transliteration}
                                </p>
                              )}
                              {amol.translation_bn && (
                                <p className="text-sm">
                                  <strong>অর্থ:</strong> {amol.translation_bn}
                                </p>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm">
                            <Badge variant="outline">{amol.repetition_count} বার</Badge>
                            <Badge variant="secondary">{amol.reward_points} পয়েন্ট</Badge>
                            {amol.is_required && <Badge variant="destructive">আবশ্যক</Badge>}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/salah/edit/${amol.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(amol.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {amol.description_bn && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {amol.description_bn}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{amol.repetition_count} বার</Badge>
                    <Badge variant="secondary">{amol.reward_points} পয়েন্ট</Badge>
                    {amol.is_required && <Badge variant="destructive">আবশ্যক</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={() => handleToggleCompletion(amol.id)}
                    />
                    {isCompleted && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredAmols.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="mb-4 h-16 w-16 text-muted-foreground" />
            <p className="mb-2 text-lg font-semibold">কোনো আমল পাওয়া যায়নি</p>
            <p className="mb-4 text-sm text-muted-foreground">
              অনুসন্ধান বা ফিল্টার পরিবর্তন করে দেখুন
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}