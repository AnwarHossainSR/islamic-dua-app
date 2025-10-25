'use client'

import { BiometricManager } from '@/components/auth/biometric-manager'
import { DynamicSettings } from '@/components/settings/dynamic-settings'
import { SettingsProvider } from '@/components/settings/settings-provider'
import { NotificationSettings } from '@/components/notifications/notification-settings'
import { Confirm } from '@/components/ui/confirm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Bell, Database, Globe, Palette, Settings, Shield, Trash2 } from 'lucide-react'
import { useState } from 'react'

export default function AdminSettingsPage() {
  const [clearing, setClearing] = useState(false)
  const { toast } = useToast()

  async function handleClearTable(table: string) {
    setClearing(true)
    try {
      const response = await fetch('/api/admin/clear-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table }),
      })

      const result = await response.json()

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: `${table === 'all' ? 'All tables' : table} cleared successfully`,
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear data',
        variant: 'destructive',
      })
    } finally {
      setClearing(false)
    }
  }

  return (
    <SettingsProvider>
      <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-4xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your app settings and preferences</p>
      </div>

      {/* General Settings */}
      <DynamicSettings
        category="general"
        title="General Settings"
        description="Basic app configuration"
        icon={<Settings className="h-5 w-5 text-primary" />}
      />

      {/* Localization */}
      <DynamicSettings
        category="localization"
        title="Localization"
        description="Language and regional settings"
        icon={<Globe className="h-5 w-5 text-primary" />}
      />

      {/* Notifications */}
      <NotificationSettings />

      {/* Security */}
      <DynamicSettings
        category="security"
        title="Security"
        description="Security and privacy settings"
        icon={<Shield className="h-5 w-5 text-primary" />}
      />

      {/* Biometric Authentication */}
      <BiometricManager />

      {/* Database Management */}
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Database Management</CardTitle>
          </div>
          <CardDescription>Clear database tables (use with caution)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="table_select">Select Table to Clear</Label>
            <Select defaultValue="duas">
              <SelectTrigger id="table_select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tables</SelectItem>
                <SelectItem value="duas">Duas</SelectItem>
                <SelectItem value="categories">Categories</SelectItem>
                <SelectItem value="tags">Tags</SelectItem>
                <SelectItem value="dhikr_presets">Dhikr Presets</SelectItem>
                <SelectItem value="user_favorites">User Favorites</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Confirm
              title="Are you absolutely sure?"
              description="This action cannot be undone. This will permanently delete all data from the selected table."
              confirmText="Yes, Clear Data"
              confirmVariant="destructive"
              variant="destructive"
              disabled={clearing}
              onConfirm={async () => {
                const select = document.getElementById('table_select') as HTMLSelectElement
                await handleClearTable(select?.value || 'duas')
              }}
              successMessage="Table cleared successfully"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Selected Table
            </Confirm>

            <Confirm
              title="Clear ALL Database Tables?"
              description="This will permanently delete ALL data from ALL tables. This action cannot be undone. Are you absolutely sure?"
              confirmText="Yes, Clear Everything"
              confirmVariant="destructive"
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
              onConfirm={async () => await handleClearTable('all')}
              successMessage="All tables cleared successfully"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Tables
            </Confirm>
          </div>

          <div className="rounded-lg bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              <strong>Warning:</strong> Clearing tables will permanently delete all data. Make sure
              to export your data before clearing if you want to keep a backup.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <DynamicSettings
        category="appearance"
        title="Appearance"
        description="Customize the look and feel"
        icon={<Palette className="h-5 w-5 text-primary" />}
      />

      {/* Data Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Data Management</CardTitle>
          </div>
          <CardDescription>Export and backup your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Button variant="outline" onClick={() => {
              // Export challenges data
              fetch('/api/challenges').then(res => res.json()).then(data => {
                const jsonString = JSON.stringify(data, null, 2)
                const blob = new Blob([jsonString], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `challenges-backup-${new Date().toISOString().split('T')[0]}.json`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
              })
            }}>
              Export Challenges
            </Button>
            <Button variant="outline" onClick={() => {
              // Export duas data
              fetch('/api/duas').then(res => res.json()).then(data => {
                const jsonString = JSON.stringify(data, null, 2)
                const blob = new Blob([jsonString], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `duas-backup-${new Date().toISOString().split('T')[0]}.json`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
              })
            }}>
              Export Duas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-4">
        <Button size="lg">Save All Settings</Button>
        <Button variant="outline" size="lg">
          Reset to Defaults
        </Button>
      </div>
      </div>
    </SettingsProvider>
  )
}
