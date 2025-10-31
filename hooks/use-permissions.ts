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

// Global cache
let cache: {
  data: { role: UserRole | null; permissions: Permission[] } | null
  promise: Promise<any> | null
} = { data: null, promise: null }

export function usePermissions(): UsePermissionsReturn {
  const [data, setData] = useState<{ role: UserRole | null; permissions: Permission[] } | null>(cache.data)
  const [loading, setLoading] = useState(!cache.data)

  useEffect(() => {
    if (cache.data) {
      setData(cache.data)
      setLoading(false)
      return
    }

    if (!cache.promise) {
      cache.promise = fetch('/api/auth/permissions')
        .then(res => res.json())
        .then(result => {
          cache.data = {
            role: result.role || 'user',
            permissions: result.permissions || []
          }
          setData(cache.data)
          setLoading(false)
        })
        .catch(() => {
          cache.data = { role: 'user', permissions: [] }
          setData(cache.data)
          setLoading(false)
        })
    } else {
      cache.promise.then(() => {
        setData(cache.data)
        setLoading(false)
      })
    }
  }, [])

  const hasPermission = (permission: string): boolean => {
    return data?.permissions.some(p => p.name === permission) || false
  }

  const canAccess = (requiredRole: UserRole): boolean => {
    if (!data?.role) return false
    
    const roleHierarchy = {
      'user': 0,
      'editor': 1,
      'admin': 2,
      'super_admin': 3
    }
    
    return roleHierarchy[data.role] >= roleHierarchy[requiredRole]
  }

  return {
    role: data?.role || null,
    permissions: data?.permissions || [],
    hasPermission,
    canAccess,
    loading
  }
}