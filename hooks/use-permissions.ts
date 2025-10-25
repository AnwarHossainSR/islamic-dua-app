'use client'

import { useState, useEffect } from 'react'
import { UserRole, Permission } from '@/lib/permissions/constants'

interface UsePermissionsReturn {
  role: UserRole | null
  permissions: Permission[]
  hasPermission: (permission: string) => boolean
  canAccess: (requiredRole: UserRole) => boolean
  loading: boolean
}

export function usePermissions(): UsePermissionsReturn {
  const [role, setRole] = useState<UserRole | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch('/api/auth/permissions')
        const data = await response.json()
        
        setRole(data.role || 'user')
        setPermissions(data.permissions || [])
      } catch (error) {
        console.error('Failed to fetch permissions:', error)
        setRole('user')
        setPermissions([])
      } finally {
        setLoading(false)
      }
    }

    fetchPermissions()
  }, [])

  const hasPermission = (permission: string): boolean => {
    return permissions.some(p => p.name === permission)
  }

  const canAccess = (requiredRole: UserRole): boolean => {
    if (!role) return false
    
    const roleHierarchy = {
      'user': 0,
      'editor': 1,
      'super_admin': 2
    }
    
    return roleHierarchy[role] >= roleHierarchy[requiredRole]
  }

  return {
    role,
    permissions,
    hasPermission,
    canAccess,
    loading
  }
}