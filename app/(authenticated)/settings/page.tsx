'use client'

import { BiometricManager } from '@/components/auth/biometric-manager'
import { DynamicSettings } from '@/components/settings/dynamic-settings'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
      <DynamicSettings
        category="notifications"
        title="Notifications"
        description="Configure notification preferences"
        icon={<Bell className="h-5 w-5 text-primary" />}
      />

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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={clearing}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Selected Table
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all data from the
                    selected table.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      const select = document.getElementById('table_select') as HTMLSelectElement
                      handleClearTable(select?.value || 'duas')
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, Clear Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All Tables
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear ALL Database Tables?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete ALL data from ALL tables. This action cannot be
                    undone. Are you absolutely sure?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleClearTable('all')}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, Clear Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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

      {/* Save Button */}
      <div className="flex gap-4">
        <Button size="lg">Save All Settings</Button>
        <Button variant="outline" size="lg">
          Reset to Defaults
        </Button>
      </div>
    </div>
  )
}
