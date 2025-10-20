'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { isWebAuthnSupported, registerCredential } from '@/lib/webauthn/client'
import { Fingerprint, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

export function BiometricSetup() {
  const [isSupported, setIsSupported] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setIsSupported(isWebAuthnSupported())
  }, [])

  const handleSetupBiometric = async () => {
    if (!isSupported) {
      setError('Biometric authentication is not supported in this browser')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')
    
    try {
      // Get registration options
      const optionsResponse = await fetch('/api/webauthn/register/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!optionsResponse.ok) {
        throw new Error('Failed to get registration options')
      }
      
      const options = await optionsResponse.json()
      
      // Register biometric credential
      const credential = await registerCredential(options)
      
      // Send credential to server
      const registerResponse = await fetch('/api/webauthn/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      })
      
      if (!registerResponse.ok) {
        const error = await registerResponse.json()
        throw new Error(error.error || 'Registration failed')
      }
      
      setIsRegistered(true)
      setSuccess('Biometric authentication has been set up successfully!')
    } catch (error) {
      console.error('Biometric setup error:', error)
      setError(error instanceof Error ? error.message : 'Failed to set up biometric authentication')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            Biometric Authentication
          </CardTitle>
          <CardDescription>
            Biometric authentication is not supported in this browser
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5" />
          Biometric Authentication
        </CardTitle>
        <CardDescription>
          Set up fingerprint or face recognition for quick and secure login
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        {!isRegistered && (
          <Button
            onClick={handleSetupBiometric}
            disabled={isLoading}
            className="w-full"
          >
            <Fingerprint className="mr-2 h-4 w-4" />
            {isLoading ? 'Setting up...' : 'Set up Biometric Login'}
          </Button>
        )}
        {isRegistered && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Biometric authentication is enabled</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}