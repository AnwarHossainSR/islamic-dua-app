'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export function useUserPresence() {
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({})
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    let heartbeatInterval: NodeJS.Timeout

    const setupPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setCurrentUserId(user.id)

      // Update user presence via API
      const updatePresence = async () => {
        try {
          await fetch('/api/user-presence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, lastSeen: Date.now() })
          })
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
          const response = await fetch('/api/user-presence')
          const data = await response.json()
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