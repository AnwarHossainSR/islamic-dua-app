'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export function useUserPresence() {
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({})
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  console.log('useUserPresence hook initialized')

  useEffect(() => {
    console.log('useUserPresence useEffect running')
    const supabase = getSupabaseBrowserClient()
    let heartbeatInterval: NodeJS.Timeout

    const setupPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setCurrentUserId(user.id)

      // Update user presence via API
      const updatePresence = async () => {
        try {
          console.log('Updating presence for user:', user.id)
          const { data: { session } } = await supabase.auth.getSession()
          const response = await fetch('/api/user-presence', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({ userId: user.id, lastSeen: Date.now() })
          })
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          const result = await response.json()
          console.log('Presence update result:', result)
        } catch (error) {
          console.error('Failed to update presence:', error)
        }
      }

      // Set user as online initially
      await updatePresence()

      // Update last seen every 30 seconds
      heartbeatInterval = setInterval(updatePresence, 30000)

      // Fetch online users initially and every minute
      const fetchOnlineUsers = async () => {
        try {
          console.log('Fetching online users...')
          const { data: { session } } = await supabase.auth.getSession()
          const response = await fetch('/api/user-presence', {
            headers: {
              'Authorization': `Bearer ${session?.access_token}`
            }
          })
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          const data = await response.json()
          console.log('Online users data:', data)
          setOnlineUsers(data.onlineUsers || {})
        } catch (error) {
          console.error('Failed to fetch online users:', error)
        }
      }

      fetchOnlineUsers()
      const fetchInterval = setInterval(fetchOnlineUsers, 60000)

      return () => {
        clearInterval(fetchInterval)
      }
    }

    setupPresence()

    return () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval)
      }
    }
  }, [])

  const isUserOnline = (userId: string) => {
    return onlineUsers[userId] || false
  }

  return {
    onlineUsers: Object.keys(onlineUsers).filter(id => onlineUsers[id]),
    isUserOnline,
    currentUserId,
  }
}