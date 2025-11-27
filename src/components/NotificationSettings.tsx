import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Bell, BellOff, BookOpen, Clock, Target } from 'lucide-react';
import { toast } from 'sonner';

export function NotificationSettings() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState({
    duaReminders: true,
    challengeReminders: true,
    prayerReminders: false,
    reminderFrequency: 'normal',
  });

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
    const stored = localStorage.getItem('notificationSettings');
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, []);

  const updateSettings = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  };

  const handleEnableNotifications = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        toast.success('Notifications enabled successfully');
      }
    }
  };

  const handleTestNotification = () => {
    if (permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification to verify everything is working!',
        icon: '/icon.png',
      });
    }
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { icon: Bell, text: 'Notifications Enabled', color: 'text-green-600' };
      case 'denied':
        return { icon: BellOff, text: 'Notifications Blocked', color: 'text-red-600' };
      default:
        return { icon: BellOff, text: 'Notifications Disabled', color: 'text-gray-600' };
    }
  };

  const status = getPermissionStatus();
  const StatusIcon = status.icon;

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
                onCheckedChange={checked => updateSettings('duaReminders', checked)}
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
                onCheckedChange={checked => updateSettings('challengeReminders', checked)}
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
                onValueChange={value => updateSettings('reminderFrequency', value)}
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
            <div className="pt-4 border-t space-y-2">
              <div className="flex gap-2">
                <Button onClick={handleEnableNotifications} variant="outline" size="sm">
                  Update Reminders
                </Button>
                <Button onClick={handleTestNotification} variant="secondary" size="sm">
                  Test Notification
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
