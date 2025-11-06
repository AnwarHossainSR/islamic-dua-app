'use client'

import { BiometricManager } from '@/components/auth/biometric-manager'
import { NotificationSettings } from '@/components/notifications/notification-settings'
import { DynamicSettings } from '@/components/settings/dynamic-settings'
import { SettingsProvider } from '@/components/settings/settings-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  Activity,
  Archive,
  Database,
  Download,
  FileText,
  Globe,
  HardDrive,
  Palette,
  RefreshCw,
  Server,
  Settings,
  Shield,
  Upload,
  Trash2,
  Calendar,
  FileDown
} from 'lucide-react'
import { useEffect, useState } from 'react'

export default function AdminSettingsPage() {
  const [dbStats, setDbStats] = useState<any>(null)
  const [backups, setBackups] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [backupLoading, setBackupLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchDbStats()
    fetchBackups()
  }, [])

  async function fetchDbStats() {
    try {
      const response = await fetch('/api/admin/database/stats')
      const data = await response.json()
      setDbStats(data)
    } catch (error) {
      console.error('Failed to fetch database stats:', error)
    }
  }

  async function fetchBackups() {
    try {
      const response = await fetch('/api/admin/database/backups')
      const data = await response.json()
      setBackups(data.backups || [])
    } catch (error) {
      console.error('Failed to fetch backups:', error)
    }
  }

  async function handleBackupDatabase(storeInSupabase = false) {
    setBackupLoading(true)
    try {
      const response = await fetch('/api/admin/database/backup', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeInSupabase })
      })
      
      if (storeInSupabase) {
        const result = await response.json()
        if (result.success) {
          toast({ title: 'Success', description: 'Backup stored in Supabase successfully' })
          fetchBackups()
        } else {
          throw new Error(result.error)
        }
      } else {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `islamic-dua-app-backup-${new Date().toISOString().split('T')[0]}.sql`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast({ title: 'Success', description: 'Database backup downloaded successfully' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to backup database', variant: 'destructive' })
    } finally {
      setBackupLoading(false)
    }
  }

  async function handleDownloadBackup(filename: string) {
    try {
      const response = await fetch('/api/admin/database/backups/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      })
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast({ title: 'Success', description: 'Backup downloaded successfully' })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to download backup', variant: 'destructive' })
    }
  }

  async function handleDeleteBackup(filename: string) {
    if (!confirm('Are you sure you want to delete this backup?')) return
    
    try {
      const response = await fetch('/api/admin/database/backups', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      })
      
      const result = await response.json()
      if (result.success) {
        toast({ title: 'Success', description: 'Backup deleted successfully' })
        fetchBackups()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete backup', variant: 'destructive' })
    }
  }

  async function handleOptimizeDatabase() {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/database/optimize', { method: 'POST' })
      const result = await response.json()
      if (result.success) {
        toast({ title: 'Success', description: 'Database optimized successfully' })
        fetchDbStats()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to optimize database', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <SettingsProvider>
      <div className="space-y-8">
        <div>
          <h1 className="mb-2 text-4xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your app settings and manage your database</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex w-auto min-w-full">
              <TabsTrigger className='cursor-pointer text-xs md:text-sm px-2 md:px-4' value="general">General</TabsTrigger>
              <TabsTrigger className='cursor-pointer text-xs md:text-sm px-2 md:px-4' value="localization">Language</TabsTrigger>
              <TabsTrigger className='cursor-pointer text-xs md:text-sm px-2 md:px-4' value="security">Security</TabsTrigger>
              <TabsTrigger className='cursor-pointer text-xs md:text-sm px-2 md:px-4' value="appearance">Appearance</TabsTrigger>
              <TabsTrigger className='cursor-pointer text-xs md:text-sm px-2 md:px-4' value="notifications">Notifications</TabsTrigger>
              <TabsTrigger className='cursor-pointer text-xs md:text-sm px-2 md:px-4' value="database">Database</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="general">
            <DynamicSettings
              category="general"
              title="General Settings"
              description="Basic app configuration"
              icon={<Settings className="h-5 w-5 text-primary" />}
            />
          </TabsContent>

          <TabsContent value="localization">
            <DynamicSettings
              category="localization"
              title="Localization"
              description="Language and regional settings"
              icon={<Globe className="h-5 w-5 text-primary" />}
            />
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              <DynamicSettings
                category="security"
                title="Security"
                description="Security and privacy settings"
                icon={<Shield className="h-5 w-5 text-primary" />}
              />
              <BiometricManager />
            </div>
          </TabsContent>

          <TabsContent value="appearance">
            <DynamicSettings
              category="appearance"
              title="Appearance"
              description="Customize the look and feel"
              icon={<Palette className="h-5 w-5 text-primary" />}
            />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="database">
            <div className="space-y-6">
              {/* Database Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    <CardTitle>Database Overview</CardTitle>
                  </div>
                  <CardDescription>Monitor your database health and statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  {dbStats ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <HardDrive className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Total Records</span>
                        </div>
                        <div className="text-2xl font-bold">{dbStats.totalRecords || 0}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Active Users</span>
                        </div>
                        <div className="text-2xl font-bold">{dbStats.activeUsers || 0}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Duas Count</span>
                        </div>
                        <div className="text-2xl font-bold">{dbStats.duasCount || 0}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">DB Size</span>
                        </div>
                        <div className="text-2xl font-bold">{dbStats.dbSize || 'N/A'}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">Loading database statistics...</div>
                  )}
                </CardContent>
              </Card>

              {/* Database Management */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Archive className="h-5 w-5 text-primary" />
                    <CardTitle>Database Management</CardTitle>
                  </div>
                  <CardDescription>Backup, restore, and optimize your database</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Button 
                      onClick={() => handleBackupDatabase(false)} 
                      disabled={backupLoading}
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {backupLoading ? 'Creating...' : 'Download Backup'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleBackupDatabase(true)} 
                      disabled={backupLoading}
                      className="w-full"
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      {backupLoading ? 'Storing...' : 'Store in Cloud'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleOptimizeDatabase}
                      disabled={loading}
                      className="w-full"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {loading ? 'Optimizing...' : 'Optimize Database'}
                    </Button>
                  </div>
                  
                  <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="font-medium mb-2">Database Health</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Performance</span>
                        <Badge variant="secondary">Good</Badge>
                      </div>
                      <Progress value={85} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Database is running optimally. Last optimization: 2 days ago
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Backup History */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <CardTitle>Backup History</CardTitle>
                  </div>
                  <CardDescription>Manage your stored database backups</CardDescription>
                </CardHeader>
                <CardContent>
                  {backups.length > 0 ? (
                    <div className="space-y-2">
                      {backups.map((backup) => (
                        <div key={backup.name} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{backup.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(backup.created_at).toLocaleString()} • {Math.round(backup.size / 1024)} KB
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadBackup(backup.name)}
                            >
                              <FileDown className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteBackup(backup.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No backups found. Create your first backup above.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Data Export */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    <CardTitle>Data Export</CardTitle>
                  </div>
                  <CardDescription>Export your data for backup or migration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Button variant="outline" onClick={() => {
                      fetch('/api/challenges').then(res => res.json()).then(data => {
                        const jsonString = JSON.stringify(data, null, 2)
                        const blob = new Blob([jsonString], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const link = document.createElement('a')
                        link.href = url
                        link.download = `challenges-${new Date().toISOString().split('T')[0]}.json`
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                        URL.revokeObjectURL(url)
                      })
                    }}>
                      Export Challenges
                    </Button>
                    <Button variant="outline" onClick={() => {
                      fetch('/api/duas').then(res => res.json()).then(data => {
                        const jsonString = JSON.stringify(data, null, 2)
                        const blob = new Blob([jsonString], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const link = document.createElement('a')
                        link.href = url
                        link.download = `duas-${new Date().toISOString().split('T')[0]}.json`
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                        URL.revokeObjectURL(url)
                      })
                    }}>
                      Export Duas
                    </Button>
                    <Button variant="outline" onClick={() => {
                      fetch('/api/settings').then(res => res.json()).then(data => {
                        const jsonString = JSON.stringify(data, null, 2)
                        const blob = new Blob([jsonString], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const link = document.createElement('a')
                        link.href = url
                        link.download = `settings-${new Date().toISOString().split('T')[0]}.json`
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                        URL.revokeObjectURL(url)
                      })
                    }}>
                      Export Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SettingsProvider>
  )
}
