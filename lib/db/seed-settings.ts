import { db } from './index'
import { appSettings } from './schema'
import { eq } from 'drizzle-orm'

const defaultSettings = [
  // General Settings
  {
    key: 'app_name',
    value: JSON.stringify('Islamic Dua App'),
    category: 'general',
    type: 'string',
    label: 'App Name',
    description: 'The name of the application',
    is_public: true,
  },
  {
    key: 'app_version',
    value: JSON.stringify('1.0.0'),
    category: 'general',
    type: 'string',
    label: 'App Version',
    description: 'Current version of the application',
    is_public: true,
  },
  {
    key: 'maintenance_mode',
    value: JSON.stringify(false),
    category: 'general',
    type: 'boolean',
    label: 'Maintenance Mode',
    description: 'Enable maintenance mode to restrict access',
    is_public: false,
  },

  // Localization Settings
  {
    key: 'default_language',
    value: JSON.stringify('bn'),
    category: 'localization',
    type: 'string',
    label: 'Default Language',
    description: 'Default language for the application',
    is_public: true,
  },
  {
    key: 'supported_languages',
    value: JSON.stringify(['bn', 'ar', 'en']),
    category: 'localization',
    type: 'array',
    label: 'Supported Languages',
    description: 'List of supported languages',
    is_public: true,
  },

  // Security Settings
  {
    key: 'session_timeout',
    value: JSON.stringify(3600),
    category: 'security',
    type: 'number',
    label: 'Session Timeout (seconds)',
    description: 'Session timeout in seconds',
    is_public: false,
  },
  {
    key: 'max_login_attempts',
    value: JSON.stringify(5),
    category: 'security',
    type: 'number',
    label: 'Max Login Attempts',
    description: 'Maximum login attempts before lockout',
    is_public: false,
  },

  // Appearance Settings
  {
    key: 'default_theme',
    value: JSON.stringify('light'),
    category: 'appearance',
    type: 'string',
    label: 'Default Theme',
    description: 'Default theme for new users',
    is_public: true,
  },
  {
    key: 'primary_color',
    value: JSON.stringify('#10b981'),
    category: 'appearance',
    type: 'string',
    label: 'Primary Color',
    description: 'Primary color for the application',
    is_public: true,
  },
]

export async function seedDefaultSettings() {
  try {
    for (const setting of defaultSettings) {
      // Check if setting already exists
      const existing = await db
        .select()
        .from(appSettings)
        .where(eq(appSettings.key, setting.key))
        .limit(1)

      if (existing.length === 0) {
        await db.insert(appSettings).values(setting)
        console.log(`Seeded setting: ${setting.key}`)
      }
    }
    console.log('Default settings seeded successfully')
  } catch (error) {
    console.error('Error seeding default settings:', error)
    throw error
  }
}