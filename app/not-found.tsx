'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Home, Target } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center space-y-6 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Target className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Challenge Not Found</h1>
            <p className="text-sm text-muted-foreground">
              The challenge you're looking for doesn't exist or has been removed.
            </p>
          </div>
          <Button asChild className="w-full">
            <Link href="/admin/challenges">
              <Home className="mr-2 h-4 w-4" />
              Back to Challenges
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
