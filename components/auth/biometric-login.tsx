'use client'

import { Button } from '@/components/ui/button'
import { authenticateCredential, isWebAuthnSupported } from '@/lib/webauthn/client'
import { Fingerprint } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface BiometricLoginProps {
  onError: (error: string) => void
  onSuccess: () => void
}

export function BiometricLogin({ onError, onSuccess }: BiometricLoginProps) {
  const [isSupported, setIsSupported] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsSupported(isWebAuthnSupported())
  }, [])

  const handleBiometricLogin = async () => {
    if (!isSupported) {
      onError('Biometric authentication is not supported in this browser')
      return
    }

    setIsLoading(true)

    try {
      // Get authentication options
      const optionsResponse = await fetch('/api/webauthn/authenticate/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!optionsResponse.ok) {
        throw new Error('Failed to get authentication options')
      }

      const options = await optionsResponse.json()
      console.log('options', options)

      // Authenticate with biometric
      const credential = await authenticateCredential(options)
      console.log('Obtained credential:', credential)

      // Send credential to server
      const authResponse = await fetch('/api/webauthn/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      })

      if (!authResponse.ok) {
        const error = await authResponse.json()
        throw new Error(error.error || 'Authentication failed')
      }
      
      const result = await authResponse.json()
      
      // Create session using the authenticated user
      const sessionResponse = await fetch('/api/auth/biometric-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: result.user.id, email: result.user.email })
      })
      
      if (!sessionResponse.ok) {
        throw new Error('Failed to create session')
      }

      onSuccess()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Biometric login error:', error)
      onError(error instanceof Error ? error.message : 'Biometric authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleBiometricLogin}
      disabled={isLoading}
    >
      <Fingerprint className="mr-2 h-4 w-4" />
      {isLoading ? 'Authenticating...' : 'Sign in with Fingerprint'}
    </Button>
  )
}
