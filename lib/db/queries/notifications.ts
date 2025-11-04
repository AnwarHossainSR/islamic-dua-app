import { eq, desc, count, and } from 'drizzle-orm'
import { db } from '../index'
import { notifications } from '../schema'

export async function getNotifications(userId: string, limit = 20) {
  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.user_id, userId))
    .orderBy(desc(notifications.created_at))
    .limit(limit)
}

export async function getUnreadCount(userId: string) {
  const result = await db
    .select({ count: count() })
    .from(notifications)
    .where(and(eq(notifications.user_id, userId), eq(notifications.is_read, false)))
  
  return result[0].count
}

export async function markAsRead(notificationId: string, userId: string) {
  return await db
    .update(notifications)
    .set({ is_read: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.user_id, userId)))
}

export async function markAllAsRead(userId: string) {
  return await db
    .update(notifications)
    .set({ is_read: true })
    .where(eq(notifications.user_id, userId))
}

export async function deleteNotification(notificationId: string, userId: string) {
  return await db
    .delete(notifications)
    .where(and(eq(notifications.id, notificationId), eq(notifications.user_id, userId)))
}

export async function createNotification(data: {
  userId: string
  type: string
  title: string
  message: string
  icon?: string
  actionUrl?: string
  expiresAt?: Date
  metadata?: Record<string, any>
}) {
  return await db
    .insert(notifications)
    .values({
      user_id: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      icon: data.icon || '🔔',
      action_url: data.actionUrl,
      expires_at: data.expiresAt,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    })
    .returning()
}