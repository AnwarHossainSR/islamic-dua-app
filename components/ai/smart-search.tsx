'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Sparkles } from 'lucide-react'
import { searchDuasWithAI } from '@/lib/actions/ai-recommendations'
import { Dua } from '@/lib/types/duas'

export function SmartSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Dua[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    try {
      const searchResults = await searchDuasWithAI(query)
      setResults(searchResults)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold">Smart Dua Search</h3>
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for duas naturally (e.g., 'dua for anxiety', 'morning prayers')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading || !query.trim()}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
          
          <div className="mt-2 text-xs text-muted-foreground">
            Try: "dua for peace", "before eating", "when traveling"
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Search Results ({results.length})</h4>
          {results.map((dua) => (
            <Card key={dua.id}>
              <CardContent className="p-4">
                <h5 className="font-medium mb-2">{dua.title_bn}</h5>
                {dua.title_en && (
                  <p className="text-sm text-muted-foreground mb-2">{dua.title_en}</p>
                )}
                <div className="text-right mb-2 font-arabic text-lg">
                  {dua.dua_text_ar}
                </div>
                {dua.translation_bn && (
                  <p className="text-sm">{dua.translation_bn}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    {dua.category}
                  </span>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}