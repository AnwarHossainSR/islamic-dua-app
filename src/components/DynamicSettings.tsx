import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { settingsApi } from '@/api/settings.api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';

interface Setting {
  id: string;
  key: string;
  value: any;
  category: string;
  type: string;
  label: string;
  description?: string;
}

interface DynamicSettingsProps {
  category: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function DynamicSettings({ category, title, description, icon }: DynamicSettingsProps) {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [category]);

  const fetchSettings = async () => {
    try {
      const data = await settingsApi.getAll(category);
      setSettings(data);
      const initialValues: Record<string, any> = {};
      data.forEach((setting: Setting) => {
        try {
          initialValues[setting.key] = JSON.parse(setting.value);
        } catch {
          initialValues[setting.key] = setting.value;
        }
      });
      setValues(initialValues);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(values).map(([key, value]) => settingsApi.update(key, value))
      );
      toast.success('Settings saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (setting: Setting) => {
    const value = values[setting.key];

    switch (setting.type) {
      case 'boolean':
        return (
          <Switch
            checked={value}
            onCheckedChange={(checked) =>
              setValues((prev) => ({ ...prev, [setting.key]: checked }))
            }
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, [setting.key]: parseInt(e.target.value, 10) || 0 }))
            }
          />
        );
      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => setValues((prev) => ({ ...prev, [setting.key]: e.target.value }))}
          />
        );
    }
  };

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
    );
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
        {settings.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No settings found for this category. Please run the database seed script.
          </div>
        ) : (
          settings.map((setting) => (
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
          ))
        )}

        {settings.length > 0 && (
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
