'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function AIStatusWarning() {
  return (
    <Alert variant="warning" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>AI Features Unavailable</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">
          AI features require an OpenAI API key to function. Please configure your API key to enable:
        </p>
        <ul className="list-disc list-inside mb-3 space-y-1 text-sm">
          <li>Smart dua recommendations</li>
          <li>Natural language search</li>
          <li>Personalized insights</li>
        </ul>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4 mr-1" />
              Configure API Key
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
              Get OpenAI API Key
            </a>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}