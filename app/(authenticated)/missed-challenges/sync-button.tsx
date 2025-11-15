'use client'

import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SyncButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSync = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/cron/missed-challenges')
      const result = await response.json()

      if (response.ok) {
        toast({
          title: 'Sync completed',
          description: 'Missed challenges have been updated',
        })
        router.refresh()
      } else {
        throw new Error(result.error || 'Sync failed')
      }
    } catch (error) {
      toast({
        title: 'Sync failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleSync} disabled={isLoading} variant="outline">
      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Syncing...' : 'Sync'}
    </Button>
  )
}