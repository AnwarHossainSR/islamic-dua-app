'use client'

import { Badge } from '@/components/ui/badge'
import { useUserPresence } from '@/hooks/use-user-presence'
import { Wifi, WifiOff } from 'lucide-react'
import { useParams } from 'next/navigation'

export function UserOnlineStatus() {
  const { isUserOnline } = useUserPresence()
  const params = useParams()
  const userId = params.id as string
  const isOnline = isUserOnline(userId)

  return (
    <Badge 
      variant={isOnline ? 'default' : 'secondary'}
      className={isOnline ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500'}
    >
      {isOnline ? (
        <><Wifi className="h-3 w-3 mr-1" />Online</>
      ) : (
        <><WifiOff className="h-3 w-3 mr-1" />Offline</>
      )}
    </Badge>
  )
}