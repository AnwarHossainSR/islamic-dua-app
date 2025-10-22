'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { useEffect, useState } from 'react'

interface Setting {
  id: string
  key: string
  value: any
  category: string
  type: string
  label: string
  description?: string
}

interface DynamicSettingsProps {
  category: string
  title: string
  description: string
  icon: React.ReactNode
}

export function DynamicSettings({ category, title, description, icon }: DynamicSettingsProps) {
  const [settings, setSettings] = useState<Setting[]>([])
  const [values, setValues] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [category])

  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/settings?category=${category}`)
      const data = await response.json()

      if (data.settings) {
        setSettings(data.settings)
        const initialValues: Record<string, any> = {}
        data.settings.forEach((setting: Setting) => {
          initialValues[setting.key] = setting.value
        })
        setValues(initialValues)
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load settings', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const promises = Object.entries(values).map(([key, value]) =>
        fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value }),
        })
      )

      await Promise.all(promises)
      toast({ title: 'Success', description: 'Settings saved successfully' })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const renderInput = (setting: Setting) => {
    const value = values[setting.key]

    switch (setting.type) {
      case 'boolean':
        return (
          <Switch
            checked={value}
            onCheckedChange={checked => setValues(prev => ({ ...prev, [setting.key]: checked }))}
          />
        )
      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={e =>
              setValues(prev => ({ ...prev, [setting.key]: parseInt(e.target.value) || 0 }))
            }
          />
        )
      default:
        return (
          <Input
            value={value || ''}
            onChange={e => setValues(prev => ({ ...prev, [setting.key]: e.target.value }))}
          />
        )
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle>{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading settings...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {settings.map(setting => (
          <div key={setting.id} className="space-y-2">
            {setting.type === 'boolean' ? (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{setting.label}</Label>
                  {setting.description && (
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  )}
                </div>
                {renderInput(setting)}
              </div>
            ) : (
              <>
                <Label htmlFor={setting.key}>{setting.label}</Label>
                {setting.description && (
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                )}
                {renderInput(setting)}
              </>
            )}
          </div>
        ))}

        {settings.length > 0 && (
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
