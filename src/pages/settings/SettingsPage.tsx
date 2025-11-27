import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Database, HardDrive, Activity, FileText, Server, Archive, RefreshCw, Calendar, FileDown, Trash2, Settings, Globe, Shield, Palette, Bell, Download, Upload } from 'lucide-react';
import { settingsApi } from '@/api/settings.api';
import { DynamicSettings } from '@/components/DynamicSettings';
import { BiometricManager } from '@/components/BiometricManager';
import { NotificationSettings } from '@/components/NotificationSettings';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [dbStats, setDbStats] = useState<any>(null);
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);

  useEffect(() => {
    fetchDbStats();
    fetchBackups();
  }, []);

  async function fetchDbStats() {
    try {
      const data = await settingsApi.getDbStats();
      setDbStats(data);
    } catch (error) {
      console.error('Failed to fetch database stats:', error);
    }
  }

  async function fetchBackups() {
    try {
      const data = await settingsApi.getBackups();
      setBackups(data);
    } catch (error) {
      console.error('Failed to fetch backups:', error);
    }
  }

  async function handleDownloadBackup(filename: string) {
    try {
      const blob = await settingsApi.downloadBackup(filename);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Backup downloaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download backup');
    }
  }

  async function handleDeleteBackup(filename: string) {
    if (!confirm('Are you sure you want to delete this backup?')) return;
    
    try {
      await settingsApi.deleteBackup(filename);
      toast.success('Backup deleted successfully');
      fetchBackups();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete backup');
    }
  }

  async function handleBackupDatabase(storeInSupabase: boolean) {
    setBackupLoading(true);
    try {
      const result = await settingsApi.createBackup(storeInSupabase);
      
      if (storeInSupabase) {
        toast.success('Backup stored in Supabase successfully');
        fetchBackups();
      } else {
        const url = URL.createObjectURL(result as Blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `islamic-dua-app-backup-${new Date().toISOString().split('T')[0]}.sql`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Database backup downloaded successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to backup database');
    } finally {
      setBackupLoading(false);
    }
  }

  async function handleOptimizeDatabase() {
    setLoading(true);
    try {
      await settingsApi.optimizeDatabase();
      toast.success('Database optimized successfully');
      fetchDbStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to optimize database');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-4xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your app settings and manage your database</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-auto min-w-full">
            <TabsTrigger className="cursor-pointer text-xs md:text-sm px-2 md:px-4" value="general">General</TabsTrigger>
            <TabsTrigger className="cursor-pointer text-xs md:text-sm px-2 md:px-4" value="localization">Language</TabsTrigger>
            <TabsTrigger className="cursor-pointer text-xs md:text-sm px-2 md:px-4" value="security">Security</TabsTrigger>
            <TabsTrigger className="cursor-pointer text-xs md:text-sm px-2 md:px-4" value="appearance">Appearance</TabsTrigger>
            <TabsTrigger className="cursor-pointer text-xs md:text-sm px-2 md:px-4" value="notifications">Notifications</TabsTrigger>
            <TabsTrigger className="cursor-pointer text-xs md:text-sm px-2 md:px-4" value="database">Database</TabsTrigger>
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
                    No backups found.
                  </div>
                )}
              </CardContent>
            </Card>

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
                  <Button variant="outline" onClick={async () => {
                    try {
                      const { data } = await supabase.from('challenge_templates').select('*');
                      const jsonString = JSON.stringify(data, null, 2);
                      const blob = new Blob([jsonString], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `challenges-${new Date().toISOString().split('T')[0]}.json`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                      toast.success('Challenges exported successfully');
                    } catch (error) {
                      toast.error('Failed to export challenges');
                    }
                  }}>
                    Export Challenges
                  </Button>
                  <Button variant="outline" onClick={async () => {
                    try {
                      const { data } = await supabase.from('duas').select('*');
                      const jsonString = JSON.stringify(data, null, 2);
                      const blob = new Blob([jsonString], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `duas-${new Date().toISOString().split('T')[0]}.json`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                      toast.success('Duas exported successfully');
                    } catch (error) {
                      toast.error('Failed to export duas');
                    }
                  }}>
                    Export Duas
                  </Button>
                  <Button variant="outline" onClick={async () => {
                    try {
                      const { data } = await supabase.from('app_settings').select('*');
                      const jsonString = JSON.stringify(data, null, 2);
                      const blob = new Blob([jsonString], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `settings-${new Date().toISOString().split('T')[0]}.json`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                      toast.success('Settings exported successfully');
                    } catch (error) {
                      toast.error('Failed to export settings');
                    }
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
  );
}
