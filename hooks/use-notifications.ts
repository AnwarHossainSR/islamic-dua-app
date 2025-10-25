'use client'

import { useState, useEffect } from 'react'

interface NotificationOptions {
  title: string
  body: string
  icon?: string
  tag?: string
  requireInteraction?: boolean
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    setSupported('Notification' in window)
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!supported) return false
    
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return false
    }
  }

  const showNotification = (options: NotificationOptions) => {
    if (!supported || permission !== 'granted') return null

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icon-192.jpg',
        tag: options.tag,
        requireInteraction: options.requireInteraction,
      })

      return notification
    } catch (error) {
      console.error('Failed to show notification:', error)
      return null
    }
  }

  const scheduleReminder = (options: NotificationOptions, delayMs: number) => {
    if (!supported || permission !== 'granted') return

    setTimeout(() => {
      showNotification(options)
    }, delayMs)
  }

  return {
    supported,
    permission,
    requestPermission,
    showNotification,
    scheduleReminder,
    canNotify: supported && permission === 'granted'
  }
}