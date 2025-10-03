import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Settings, Globe, Bell, Shield, Database, Palette } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-4xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your app settings and preferences</p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <CardTitle>General Settings</CardTitle>
          </div>
          <CardDescription>Basic app configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="app_name">App Name</Label>
            <Input id="app_name" defaultValue="Heaven Rose Islamic" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="app_description">App Description</Label>
            <Textarea id="app_description" defaultValue="Your companion for Islamic duas and dhikr" rows={3} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">Temporarily disable public access</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Localization */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle>Localization</CardTitle>
          </div>
          <CardDescription>Language and regional settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Bangla</Label>
              <p className="text-sm text-muted-foreground">Show Bangla translations</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable English</Label>
              <p className="text-sm text-muted-foreground">Show English translations</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Arabic</Label>
              <p className="text-sm text-muted-foreground">Show Arabic text</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>Configure notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Daily Dua Reminders</Label>
              <p className="text-sm text-muted-foreground">Send daily dua notifications</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Prayer Time Notifications</Label>
              <p className="text-sm text-muted-foreground">Notify users of prayer times</p>
            </div>
            <Switch />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notification_time">Default Notification Time</Label>
            <Input id="notification_time" type="time" defaultValue="08:00" />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>Security and privacy settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Email Verification</Label>
              <p className="text-sm text-muted-foreground">Users must verify email to access content</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Add extra security for admin accounts</p>
            </div>
            <Switch />
          </div>
          <div className="space-y-2">
            <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
            <Input id="session_timeout" type="number" defaultValue="60" />
          </div>
        </CardContent>
      </Card>

      {/* Database */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Database</CardTitle>
          </div>
          <CardDescription>Database maintenance and backup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Backup</Label>
              <p className="text-sm text-muted-foreground">Automatically backup database daily</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Backup Now</Button>
            <Button variant="outline">Restore Backup</Button>
            <Button variant="outline">Optimize Database</Button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle>Appearance</CardTitle>
          </div>
          <CardDescription>Customize the look and feel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primary_color">Primary Color</Label>
            <div className="flex gap-2">
              <Input id="primary_color" type="color" defaultValue="#10b981" className="h-10 w-20" />
              <Input defaultValue="#10b981" className="flex-1" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dark Mode by Default</Label>
              <p className="text-sm text-muted-foreground">Use dark theme as default</p>
            </div>
            <Switch />
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
  )
}
