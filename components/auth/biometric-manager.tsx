'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDateTime } from '@/lib/utils'
import { isWebAuthnSupported, registerCredential } from '@/lib/webauthn/client'
import { Fingerprint, Monitor, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Credential {
  id: string
  credential_id: string
  device_name: string
  created_at: string
  last_used_at: string
}

export function BiometricManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [deviceName, setDeviceName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setIsSupported(isWebAuthnSupported())
    fetchCredentials()
  }, [])

  const fetchCredentials = async () => {
    try {
      const response = await fetch('/api/webauthn/credentials')
      const data = await response.json()
      if (data.credentials) {
        setCredentials(data.credentials)
      }
    } catch (error) {
      console.error('Failed to fetch credentials:', error)
    }
  }

  const handleAddCredential = async () => {
    if (!deviceName.trim()) {
      setError('Please enter a device name')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Get registration options
      const optionsResponse = await fetch('/api/webauthn/register/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!optionsResponse.ok) {
        throw new Error('Failed to get registration options')
      }

      const options = await optionsResponse.json()

      // Register biometric credential
      const credential = await registerCredential(options)

      // Send credential to server with device name
      const registerResponse = await fetch('/api/webauthn/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, deviceName }),
      })

      if (!registerResponse.ok) {
        const error = await registerResponse.json()
        throw new Error(error.error || 'Registration failed')
      }

      setSuccess(`${deviceName} added successfully!`)
      setDeviceName('')
      setIsAdding(false)
      fetchCredentials()
    } catch (error) {
      console.error('Biometric setup error:', error)
      setError(error instanceof Error ? error.message : 'Failed to add device')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCredential = async (credentialId: string) => {
    try {
      const response = await fetch('/api/webauthn/credentials', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentialId }),
      })

      if (response.ok) {
        setSuccess('Device removed successfully')
        fetchCredentials()
      } else {
        setError('Failed to remove device')
      }
    } catch (error) {
      setError('Failed to remove device')
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
          Biometric Devices ({credentials.length})
        </CardTitle>
        <CardDescription>
          Manage your registered fingerprint and face recognition devices
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
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Add new device */}
        {isAdding ? (
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="deviceName">Device Name</Label>
              <Input
                id="deviceName"
                placeholder="e.g., iPhone, MacBook, Windows PC"
                value={deviceName}
                onChange={e => setDeviceName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddCredential} disabled={isLoading}>
                <Fingerprint className="mr-2 h-4 w-4" />
                {isLoading ? 'Adding...' : 'Add Device'}
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setIsAdding(true)} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add New Device
          </Button>
        )}

        {/* Existing devices */}
        {credentials.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Registered Devices</h4>
            {credentials.map(credential => (
              <div
                key={credential.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{credential.device_name}</div>
                    <div className="text-sm text-muted-foreground">
                      Added {formatDateTime(credential.created_at, 'date')}
                      {credential.last_used_at && (
                        <span>
                          {' '}
                          • Last used{' '}
                          {formatDateTime(credential.last_used_at, 'full')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCredential(credential.credential_id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
