'use client'

import { usePermissions } from '@/hooks/use-permissions'
import { UserRole } from '@/lib/permissions'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, AlertTriangle } from 'lucide-react'

interface PermissionGuardProps {
  children: React.ReactNode
  permission?: string
  role?: UserRole
  fallback?: React.ReactNode
  loading?: React.ReactNode
}

export function PermissionGuard({ 
  children, 
  permission, 
  role, 
  fallback,
  loading 
}: PermissionGuardProps) {
  const { hasPermission, canAccess, loading: permissionsLoading } = usePermissions()

  if (permissionsLoading) {
    return loading || <LoadingSpinner text="Checking permissions..." />
  }

  // Check permission-based access
  if (permission && !hasPermission(permission)) {
    return fallback || <AccessDenied />
  }

  // Check role-based access
  if (role && !canAccess(role)) {
    return fallback || <AccessDenied />
  }

  return <>{children}</>
}

function AccessDenied() {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Shield className="h-5 w-5" />
          Access Denied
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="h-4 w-4" />
          You don't have permission to access this resource.
        </div>
      </CardContent>
    </Card>
  )
}

// Convenience components for common use cases
export function SuperAdminOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <PermissionGuard role="super_admin" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function EditorOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <PermissionGuard role="editor" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function RequirePermission({ 
  permission, 
  children, 
  fallback 
}: { 
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <PermissionGuard permission={permission} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}