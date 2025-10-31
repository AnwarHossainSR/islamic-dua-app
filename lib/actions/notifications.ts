'use server'

import { getUser } from '@/lib/actions/auth'
import { getSupabaseServerClient, getSupabaseAdminServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Notification {
  id: string
  type: 'dua_reminder' | 'challenge_reminder' | 'achievement' | 'system' | 'prayer_time'
  title: string
  message: string
  icon: string
  action_url?: string
  is_read: boolean
  created_at: string
  expires_at?: string
}

export async function getNotifications(limit = 20) {
  const supabase = await getSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as Notification[]
}

export async function getUnreadCount() {
  const supabase = await getSupabaseServerClient()
  
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false)
  
  if (error) throw error
  return count || 0
}

export async function markAsRead(notificationId: string) {
  const supabase = await getSupabaseServerClient()
  const user = await getUser()
  
  if (!user) throw new Error('Not authenticated')
  
  const { error } = await supabase.rpc('mark_notification_read', {
    p_notification_id: notificationId,
    p_user_id: user.id
  })
  
  if (error) throw error
  revalidatePath('/')
}

export async function markAllAsRead() {
  const supabase = await getSupabaseServerClient()
  const user = await getUser()
  
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase.rpc('mark_all_notifications_read', {
    p_user_id: user.id
  })
  
  if (error) throw error
  revalidatePath('/')
  return data
}

export async function deleteNotification(notificationId: string) {
  const supabase = await getSupabaseServerClient()
  const user = await getUser()
  
  if (!user) throw new Error('Not authenticated')
  
  const { error } = await supabase.rpc('delete_notification', {
    p_notification_id: notificationId,
    p_user_id: user.id
  })
  
  if (error) throw error
  revalidatePath('/')
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
  const supabase = getSupabaseAdminServerClient()
  
  const { data, error } = await supabase.rpc('create_notification', {
    p_user_id: userId,
    p_type: type,
    p_title: title,
    p_message: message,
    p_icon: options?.icon || '🔔',
    p_action_url: options?.actionUrl,
    p_expires_at: options?.expiresAt?.toISOString(),
    p_metadata: options?.metadata || {}
  })
  
  if (error) throw error
  return data
}

export async function setupUserNotificationSchedules(userId: string) {
  const supabase = getSupabaseAdminServerClient()
  
  const schedules = [
    { time: '06:00', type: 'dua_reminder', title: 'Morning Dua', message: 'Start your day with morning duas' },
    { time: '12:00', type: 'dua_reminder', title: 'Midday Reminder', message: 'Take a moment for dhikr and dua' },
    { time: '18:00', type: 'dua_reminder', title: 'Evening Dua', message: 'Recite evening duas and seek forgiveness' },
    { time: '21:00', type: 'dua_reminder', title: 'Night Dua', message: 'End your day with gratitude and night duas' },
    { time: '09:00', type: 'challenge_reminder', title: 'Daily Challenge', message: 'Complete your daily Islamic challenge' },
    { time: '20:00', type: 'challenge_reminder', title: 'Challenge Reflection', message: 'Reflect on today\'s spiritual progress' }
  ]
  
  for (const schedule of schedules) {
    await supabase
      .from('notification_schedules')
      .upsert({
        user_id: userId,
        type: schedule.type,
        title: schedule.title,
        message: schedule.message,
        schedule_time: schedule.time,
        is_active: true
      }, { 
        onConflict: 'user_id,type,schedule_time',
        ignoreDuplicates: true 
      })
  }
}