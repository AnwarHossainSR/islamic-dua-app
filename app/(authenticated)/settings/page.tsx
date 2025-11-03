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
  Upload
} from 'lucide-react'
import { useEffect, useState } from 'react'

export default function AdminSettingsPage() {
  const [dbStats, setDbStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchDbStats()
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

  async function handleBackupDatabase() {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/database/backup', { method: 'POST' })
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
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to backup database', variant: 'destructive' })
    } finally {
      setLoading(false)
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger className='cursor-pointer' value="general">General</TabsTrigger>
            <TabsTrigger className='cursor-pointer' value="localization">Language</TabsTrigger>
            <TabsTrigger className='cursor-pointer' value="security">Security</TabsTrigger>
            <TabsTrigger className='cursor-pointer' value="appearance">Appearance</TabsTrigger>
            <TabsTrigger className='cursor-pointer' value="notifications">Notifications</TabsTrigger>
            <TabsTrigger className='cursor-pointer' value="database">Database</TabsTrigger>
          </TabsList>

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
                  <div className="grid gap-4 md:grid-cols-2">
                    <Button 
                      onClick={handleBackupDatabase} 
                      disabled={loading}
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {loading ? 'Creating Backup...' : 'Backup Database'}
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
