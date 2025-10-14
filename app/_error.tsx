'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center space-y-6 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-destructive">Something Went Wrong</h1>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. Please try again.
            </p>
            <p className="text-xs text-destructive/80">{error.message}</p>
          </div>
          <div className="flex w-full gap-2">
            <Button onClick={reset} variant="outline" className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button asChild className="flex-1">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
