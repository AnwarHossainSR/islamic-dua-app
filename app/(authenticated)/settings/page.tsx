"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Settings, Globe, Bell, Shield, Database, Palette, Trash2 } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { BiometricManager } from "@/components/auth/biometric-manager"
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
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminSettingsPage() {
  const [clearing, setClearing] = useState(false)
  const { toast } = useToast()

  async function handleClearTable(table: string) {
    setClearing(true)
    try {
      const response = await fetch("/api/admin/clear-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table }),
      })

      const result = await response.json()

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: `${table === "all" ? "All tables" : table} cleared successfully`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear data",
        variant: "destructive",
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
                    This action cannot be undone. This will permanently delete all data from the selected table.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      const select = document.getElementById("table_select") as HTMLSelectElement
                      handleClearTable(select?.value || "duas")
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
                    This will permanently delete ALL data from ALL tables. This action cannot be undone. Are you
                    absolutely sure?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleClearTable("all")}
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
              <strong>Warning:</strong> Clearing tables will permanently delete all data. Make sure to export your data
              before clearing if you want to keep a backup.
            </p>
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
