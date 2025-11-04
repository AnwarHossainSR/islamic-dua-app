'use server'

import { getUser } from '@/lib/actions/auth'
import { revalidatePath } from 'next/cache'
import { getNotifications as getNotificationsQuery, getUnreadCount as getUnreadCountQuery, markAsRead as markAsReadQuery, markAllAsRead as markAllAsReadQuery, deleteNotification as deleteNotificationQuery, createNotification as createNotificationQuery } from '../db/queries/notifications'
import { apiLogger } from '@/lib/logger'

export interface Notification {
  id: string
  type: 'dua_reminder' | 'challenge_reminder' | 'achievement' | 'system' | 'prayer_time'
  title: string
  message: string
  icon: string
  action_url?: string | null
  is_read: boolean
  created_at: string
  expires_at?: string
}

export async function getNotifications(limit = 20) {
  const user = await getUser()
  if (!user) return []
  
  try {
    const data = await getNotificationsQuery(user.id, limit)
    return data.map(n => ({
      id: n.id,
      type: n.type as Notification['type'],
      title: n.title,
      message: n.message,
      icon: n.icon || '🔔',
      action_url: n.action_url,
      is_read: n.is_read || false,
      created_at: n.created_at?.toISOString() || '',
      expires_at: n.expires_at?.toISOString(),
    }))
  } catch (error) {
    apiLogger.error('Error fetching notifications with Drizzle', { error, userId: user.id })
    return []
  }
}

export async function getUnreadCount() {
  const user = await getUser()
  if (!user) return 0
  
  try {
    return await getUnreadCountQuery(user.id)
  } catch (error) {
    apiLogger.error('Error fetching unread count with Drizzle', { error, userId: user.id })
    return 0
  }
}

export async function markAsRead(notificationId: string) {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')
  
  try {
    await markAsReadQuery(notificationId, user.id)
    revalidatePath('/')
  } catch (error) {
    apiLogger.error('Error marking notification as read with Drizzle', { error, notificationId, userId: user.id })
    throw error
  }
}

export async function markAllAsRead() {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')
  
  try {
    const result = await markAllAsReadQuery(user.id)
    revalidatePath('/')
    return result
  } catch (error) {
    apiLogger.error('Error marking all notifications as read with Drizzle', { error, userId: user.id })
    throw error
  }
}

export async function deleteNotification(notificationId: string) {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')
  
  try {
    await deleteNotificationQuery(notificationId, user.id)
    revalidatePath('/')
  } catch (error) {
    apiLogger.error('Error deleting notification with Drizzle', { error, notificationId, userId: user.id })
    throw error
  }
}

export async function createNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  options?: {
    icon?: string
    actionUrl?: string
    expiresAt?: Date
    metadata?: Record<string, any>
  }
) {
  try {
    const result = await createNotificationQuery({
      userId,
      type,
      title,
      message,
      icon: options?.icon,
      actionUrl: options?.actionUrl,
      expiresAt: options?.expiresAt,
      metadata: options?.metadata,
    })
    return result[0]
  } catch (error) {
    apiLogger.error('Error creating notification with Drizzle', { error, userId, type, title })
    throw error
  }
}

export async function setupUserNotificationSchedules(userId: string) {
  // Simplified implementation
  return
}