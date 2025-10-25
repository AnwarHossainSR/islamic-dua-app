'use client'

import { createContext, useContext, useEffect } from 'react'
import { useNotifications } from '@/hooks/use-notifications'
import { SmartReminders } from './smart-reminders'

const NotificationContext = createContext<ReturnType<typeof useNotifications> | null>(null)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const notifications = useNotifications()

  // Auto-setup notifications on app load if permission granted
  useEffect(() => {
    if (notifications.permission === 'granted') {
      const settings = localStorage.getItem('notificationSettings')
      if (settings) {
        const { duaReminders, challengeReminders } = JSON.parse(settings)
        
        if (duaReminders && notifications.scheduledNotifications.filter(n => n.type === 'dua').length === 0) {
          notifications.setupDuaReminders()
        }
        
        if (challengeReminders && notifications.scheduledNotifications.filter(n => n.type === 'challenge').length === 0) {
          notifications.setupChallengeReminders()
        }
      }
    }
  }, [notifications.permission])

  return (
    <NotificationContext.Provider value={notifications}>
      <SmartReminders />
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider')
  }
  return context
}