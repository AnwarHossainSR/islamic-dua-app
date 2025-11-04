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