'use client'

import { useState, useEffect, useCallback } from 'react'

interface NotificationOptions {
  title: string
  body: string
  icon?: string
  tag?: string
  requireInteraction?: boolean
}

interface ScheduledNotification {
  id: string
  type: 'dua' | 'challenge' | 'prayer'
  title: string
  body: string
  scheduledTime: Date
  recurring?: 'daily' | 'weekly' | 'custom'
  enabled: boolean
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([])

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    }
    return false
  }, [])

  const showNotification = useCallback((options: NotificationOptions) => {
    if (permission === 'granted' && 'Notification' in window) {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icon-192x192.png',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      return notification
    }
  }, [permission])

  const scheduleNotification = useCallback((notification: Omit<ScheduledNotification, 'id'>) => {
    const id = crypto.randomUUID()
    const newNotification = { ...notification, id }
    
    setScheduledNotifications(prev => [...prev, newNotification])
    
    // Store in localStorage
    const stored = localStorage.getItem('scheduledNotifications')
    const existing = stored ? JSON.parse(stored) : []
    localStorage.setItem('scheduledNotifications', JSON.stringify([...existing, newNotification]))
    
    return id
  }, [])

  const cancelNotification = useCallback((id: string) => {
    setScheduledNotifications(prev => prev.filter(n => n.id !== id))
    
    // Update localStorage
    const stored = localStorage.getItem('scheduledNotifications')
    if (stored) {
      const existing = JSON.parse(stored)
      const updated = existing.filter((n: ScheduledNotification) => n.id !== id)
      localStorage.setItem('scheduledNotifications', JSON.stringify(updated))
    }
  }, [])

  const setupDuaReminders = useCallback(async () => {
    if (permission !== 'granted') return

    // Show immediate test notification
    showNotification({
      title: 'Dua Reminders Enabled!',
      body: 'You will receive daily dua reminders. This is a test notification.',
      tag: 'test'
    })

    const duaReminders = [
      { time: '06:00', title: 'Morning Dua', body: 'Start your day with morning duas' },
      { time: '12:00', title: 'Midday Reminder', body: 'Take a moment for dhikr and dua' },
      { time: '18:00', title: 'Evening Dua', body: 'Recite evening duas and seek forgiveness' },
      { time: '21:00', title: 'Night Dua', body: 'End your day with gratitude and night duas' }
    ]

    duaReminders.forEach(reminder => {
      const [hours, minutes] = reminder.time.split(':').map(Number)
      const scheduledTime = new Date()
      scheduledTime.setHours(hours, minutes, 0, 0)
      
      if (scheduledTime < new Date()) {
        scheduledTime.setDate(scheduledTime.getDate() + 1)
      }

      scheduleNotification({
        type: 'dua',
        title: reminder.title,
        body: reminder.body,
        scheduledTime,
        recurring: 'daily',
        enabled: true
      })
    })
  }, [permission, scheduleNotification, showNotification])

  const setupChallengeReminders = useCallback(async () => {
    if (permission !== 'granted') return

    // Show immediate test notification
    showNotification({
      title: 'Challenge Reminders Enabled!',
      body: 'You will receive daily challenge reminders. This is a test notification.',
      tag: 'test'
    })

    const challengeReminders = [
      { time: '09:00', title: 'Daily Challenge', body: 'Complete your daily Islamic challenge' },
      { time: '15:00', title: 'Challenge Check', body: 'How are you doing with today\'s challenge?' },
      { time: '20:00', title: 'Challenge Reflection', body: 'Reflect on today\'s spiritual progress' }
    ]

    challengeReminders.forEach(reminder => {
      const [hours, minutes] = reminder.time.split(':').map(Number)
      const scheduledTime = new Date()
      scheduledTime.setHours(hours, minutes, 0, 0)
      
      if (scheduledTime < new Date()) {
        scheduledTime.setDate(scheduledTime.getDate() + 1)
      }

      scheduleNotification({
        type: 'challenge',
        title: reminder.title,
        body: reminder.body,
        scheduledTime,
        recurring: 'daily',
        enabled: true
      })
    })
  }, [permission, scheduleNotification, showNotification])

  // Load scheduled notifications from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('scheduledNotifications')
    if (stored) {
      const notifications = JSON.parse(stored).map((n: any) => ({
        ...n,
        scheduledTime: new Date(n.scheduledTime)
      }))
      setScheduledNotifications(notifications)
    }
  }, [])

  // Check and trigger notifications
  useEffect(() => {
    if (scheduledNotifications.length === 0) return

    const interval = setInterval(() => {
      const now = new Date()
      
      scheduledNotifications.forEach(notification => {
        if (notification.enabled && notification.scheduledTime <= now) {
          console.log('Triggering notification:', notification.title)
          
          showNotification({
            title: notification.title,
            body: notification.body,
            tag: notification.type
          })

          // Reschedule if recurring
          if (notification.recurring === 'daily') {
            const nextTime = new Date(notification.scheduledTime)
            nextTime.setDate(nextTime.getDate() + 1)
            
            const updatedNotifications = scheduledNotifications.map(n => 
              n.id === notification.id 
                ? { ...n, scheduledTime: nextTime }
                : n
            )
            
            setScheduledNotifications(updatedNotifications)
            localStorage.setItem('scheduledNotifications', JSON.stringify(updatedNotifications))
          } else {
            // Remove one-time notifications
            cancelNotification(notification.id)
          }
        }
      })
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [scheduledNotifications, showNotification, cancelNotification])

  return {
    permission,
    requestPermission,
    showNotification,
    scheduleNotification,
    cancelNotification,
    setupDuaReminders,
    setupChallengeReminders,
    scheduledNotifications
  }
}