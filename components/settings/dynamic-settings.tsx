'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { useState, useEffect } from 'react'
import { useSettings } from './settings-provider'

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
  const { settings, loading, updateSetting } = useSettings()
  const categorySettings = settings[category] || []
  const [values, setValues] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Update values when settings are loaded
  useEffect(() => {
    if (categorySettings.length > 0) {
      const initialValues: Record<string, any> = {}
      categorySettings.forEach((setting: Setting) => {
        initialValues[setting.key] = setting.value
      })
      setValues(initialValues)
    }
  }, [categorySettings])

  const handleSave = async () => {
    setSaving(true)
    try {
      const promises = Object.entries(values).map(([key, value]) => updateSetting(key, value))
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
        {categorySettings.map(setting => (
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

        {categorySettings.length > 0 && (
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
