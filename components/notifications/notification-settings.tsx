'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useNotifications } from '@/hooks/use-notifications'
import { Bell, BellOff, Clock, Target, BookOpen } from 'lucide-react'

export function NotificationSettings() {
  const { 
    permission, 
    requestPermission, 
    setupDuaReminders, 
    setupChallengeReminders,
    scheduledNotifications 
  } = useNotifications()
  
  const [settings, setSettings] = useState({
    duaReminders: true,
    challengeReminders: true,
    prayerReminders: false,
    reminderFrequency: 'normal' // low, normal, high
  })

  useEffect(() => {
    const stored = localStorage.getItem('notificationSettings')
    if (stored) {
      setSettings(JSON.parse(stored))
    }
  }, [])

  const updateSettings = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings))
  }

  const handleEnableNotifications = async () => {
    const granted = await requestPermission()
    if (granted) {
      if (settings.duaReminders) {
        await setupDuaReminders()
      }
      if (settings.challengeReminders) {
        await setupChallengeReminders()
      }
    }
  }

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { icon: Bell, text: 'Notifications Enabled', color: 'text-green-600' }
      case 'denied':
        return { icon: BellOff, text: 'Notifications Blocked', color: 'text-red-600' }
      default:
        return { icon: BellOff, text: 'Notifications Disabled', color: 'text-gray-600' }
    }
  }

  const status = getPermissionStatus()
  const StatusIcon = status.icon

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StatusIcon className={`h-5 w-5 ${status.color}`} />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {permission !== 'granted' && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 mb-3">
                Enable notifications to receive reminders for duas, challenges, and prayers.
              </p>
              <Button onClick={handleEnableNotifications} size="sm">
                Enable Notifications
              </Button>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <div>
                  <Label htmlFor="dua-reminders">Dua Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Morning, midday, evening, and night dua reminders
                  </p>
                </div>
              </div>
              <Switch
                id="dua-reminders"
                checked={settings.duaReminders}
                onCheckedChange={(checked) => updateSettings('duaReminders', checked)}
                disabled={permission !== 'granted'}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="h-4 w-4 text-green-600" />
                <div>
                  <Label htmlFor="challenge-reminders">Challenge Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Daily reminders to complete your Islamic challenges
                  </p>
                </div>
              </div>
              <Switch
                id="challenge-reminders"
                checked={settings.challengeReminders}
                onCheckedChange={(checked) => updateSettings('challengeReminders', checked)}
                disabled={permission !== 'granted'}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-purple-600" />
                <div>
                  <Label htmlFor="reminder-frequency">Reminder Frequency</Label>
                  <p className="text-sm text-muted-foreground">
                    How often you want to receive reminders
                  </p>
                </div>
              </div>
              <Select
                value={settings.reminderFrequency}
                onValueChange={(value) => updateSettings('reminderFrequency', value)}
                disabled={permission !== 'granted'}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {permission === 'granted' && (
            <div className="pt-4 border-t">
              <Button 
                onClick={handleEnableNotifications}
                variant="outline"
                size="sm"
              >
                Update Reminders
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {scheduledNotifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scheduledNotifications.slice(0, 5).map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {notification.scheduledTime.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      notification.type === 'dua' ? 'bg-blue-100 text-blue-800' :
                      notification.type === 'challenge' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {notification.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}