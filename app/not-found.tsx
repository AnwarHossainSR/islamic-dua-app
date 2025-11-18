'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Home, ArrowLeft, FileQuestion } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Route } from 'next'

export default function NotFound() {
  const router = useRouter()
  const pathname = usePathname()

  const getSuggestions = () => {
    const path = pathname.toLowerCase()
    const suggestions = []

    if (path.includes('challenge')) {
      suggestions.push({ href: '/challenges', label: 'View Challenges', icon: '🎯' })
    }
    if (path.includes('dua')) {
      suggestions.push({ href: '/duas', label: 'Browse Duas', icon: '🤲' })
    }
    if (path.includes('setting')) {
      suggestions.push({ href: '/settings', label: 'Settings', icon: '⚙️' })
    }
    if (path.includes('log')) {
      suggestions.push({ href: '/logs', label: 'View Logs', icon: '📋' })
    }

    // Default suggestions
    if (suggestions.length === 0) {
      suggestions.push(
        { href: '/', label: 'Dashboard', icon: '🏠' },
        { href: '/challenges', label: 'Challenges', icon: '🎯' }
      )
    }

    return suggestions
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center space-y-6 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
            <p className="text-sm text-muted-foreground">
              The page <code className="bg-muted px-1 py-0.5 rounded text-xs">{pathname}</code> doesn't exist.
            </p>
          </div>
          
          <div className="w-full space-y-3">
            <p className="text-sm font-medium">Try these instead:</p>
            <div className="space-y-2">
              {getSuggestions().map((suggestion, index) => (
                <Button key={index} variant="outline" asChild className="w-full justify-start">
                  <Link href={suggestion.href as Route}>
                    <span className="mr-2">{suggestion.icon}</span>
                    {suggestion.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex w-full gap-2">
            <Button onClick={() => router.back()} variant="outline" className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button asChild className="flex-1">
              <Link href={"/" as Route}>
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
