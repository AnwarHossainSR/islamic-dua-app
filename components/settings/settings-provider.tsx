'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface Setting {
  id: string
  key: string
  value: any
  category: string
  type: string
  label: string
  description?: string
}

interface SettingsContextType {
  settings: Record<string, Setting[]>
  loading: boolean
  updateSetting: (key: string, value: any) => Promise<void>
  refreshSettings: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Record<string, Setting[]>>({})
  const [loading, setLoading] = useState(true)

  const fetchAllSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      
      if (data.settings) {
        const grouped = data.settings.reduce((acc: Record<string, Setting[]>, setting: Setting) => {
          if (!acc[setting.category]) {
            acc[setting.category] = []
          }
          acc[setting.category].push(setting)
          return acc
        }, {})
        setSettings(grouped)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key: string, value: any) => {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update setting')
    }
    
    // Update local state
    setSettings(prev => {
      const updated = { ...prev }
      Object.keys(updated).forEach(category => {
        updated[category] = updated[category].map(setting =>
          setting.key === key ? { ...setting, value } : setting
        )
      })
      return updated
    })
  }

  useEffect(() => {
    fetchAllSettings()
  }, [])

  return (
    <SettingsContext.Provider value={{
      settings,
      loading,
      updateSetting,
      refreshSettings: fetchAllSettings
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}