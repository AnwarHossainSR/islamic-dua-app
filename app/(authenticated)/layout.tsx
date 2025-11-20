import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { PermissionGuard } from '@/components/auth/permission-guard'
import { checkAdminAccess } from '@/lib/actions/admin'
import { PERMISSIONS } from '@/lib/permissions'
import type React from 'react'
import { Suspense } from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-113px)] flex items-center justify-center">Loading...</div>}>
      <AuthenticatedContent>{children}</AuthenticatedContent>
    </Suspense>
  )
}

async function AuthenticatedContent({ children }: { children: React.ReactNode }) {
  await checkAdminAccess()

  return (
    <PermissionGuard permission={PERMISSIONS.DASHBOARD_READ}>
      <div className="flex min-h-[calc(100vh-113px)]">
        <Suspense fallback={<div className="w-64 border-r border-border" />}>
          <AdminSidebar />
        </Suspense>
        <main className="flex-1 overflow-auto px-4 py-2 md:px-8 md:py-8 scrollbar-hide">
          {children}
        </main>
      </div>
    </PermissionGuard>
  )
}
