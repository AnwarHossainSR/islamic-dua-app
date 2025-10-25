'use client'

import { useState, useCallback, useTransition } from 'react'
import { useDebounce } from './use-debounce'

interface UseSearchFilterOptions<T> {
  initialData: T[]
  searchFn: (query: string, filters: Record<string, any>) => Promise<T[]>
  debounceMs?: number
}

export function useSearchFilter<T>({ 
  initialData, 
  searchFn, 
  debounceMs = 500 
}: UseSearchFilterOptions<T>) {
  const [data, setData] = useState<T[]>(initialData)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [isPending, startTransition] = useTransition()

  const performSearch = useCallback(async (query: string, currentFilters: Record<string, any>) => {
    startTransition(async () => {
      try {
        const results = await searchFn(query, currentFilters)
        setData(results)
      } catch (error) {
        console.error('Search failed:', error)
        setData(initialData)
      }
    })
  }, [searchFn, initialData])

  const { debouncedCallback: debouncedSearch } = useDebounce(
    (query: string, currentFilters: Record<string, any>) => {
      performSearch(query, currentFilters)
    },
    debounceMs,
    []
  )

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    debouncedSearch(value, filters)
  }, [debouncedSearch, filters])

  const handleFilterChange = useCallback((key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    performSearch(searchQuery, newFilters)
  }, [filters, searchQuery, performSearch])

  const resetFilters = useCallback(() => {
    setSearchQuery('')
    setFilters({})
    setData(initialData)
  }, [initialData])

  return {
    data,
    searchQuery,
    filters,
    isPending,
    handleSearchChange,
    handleFilterChange,
    resetFilters
  }
}