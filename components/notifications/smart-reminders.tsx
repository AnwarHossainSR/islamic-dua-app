'use client'

import { useEffect } from 'react'
import { useNotificationContext } from './notification-provider'

// Smart reminder logic based on user activity
export function SmartReminders() {
  const { showNotification, permission } = useNotificationContext()

  useEffect(() => {
    if (permission !== 'granted') return

    // Track user activity and send contextual reminders
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const lastActivity = localStorage.getItem('lastActivity')
        const now = Date.now()
        
        if (lastActivity) {
          const timeDiff = now - parseInt(lastActivity)
          const hoursDiff = timeDiff / (1000 * 60 * 60)
          
          // If user returns after 4+ hours, show welcome back reminder
          if (hoursDiff >= 4) {
            setTimeout(() => {
              showNotification({
                title: 'Welcome back!',
                body: 'Continue your spiritual journey with duas and challenges',
                tag: 'welcome-back'
              })
            }, 2000)
          }
        }
        
        localStorage.setItem('lastActivity', now.toString())
      }
    }

    // Random motivational reminders
    const scheduleRandomReminder = () => {
      const reminders = [
        { title: 'Dhikr Reminder', body: 'SubhanAllah, Alhamdulillah, Allahu Akbar' },
        { title: 'Dua Reminder', body: 'Make dua for yourself and your loved ones' },
        { title: 'Gratitude Reminder', body: 'Count your blessings and thank Allah' },
        { title: 'Istighfar Reminder', body: 'Seek forgiveness: Astaghfirullah' },
        { title: 'Salawat Reminder', body: 'Send blessings upon Prophet Muhammad (PBUH)' }
      ]
      
      const randomReminder = reminders[Math.floor(Math.random() * reminders.length)]
      const randomDelay = Math.random() * (4 * 60 * 60 * 1000) + (2 * 60 * 60 * 1000) // 2-6 hours
      
      setTimeout(() => {
        showNotification({
          title: randomReminder.title,
          body: randomReminder.body,
          tag: 'random-reminder'
        })
        
        // Schedule next random reminder
        scheduleRandomReminder()
      }, randomDelay)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Start random reminders
    const settings = localStorage.getItem('notificationSettings')
    if (settings) {
      const { reminderFrequency } = JSON.parse(settings)
      if (reminderFrequency === 'high') {
        scheduleRandomReminder()
      }
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [permission, showNotification])

  return null // This component doesn't render anything
}