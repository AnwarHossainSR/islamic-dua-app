import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { PermissionGuard } from '@/components/auth/permission-guard'
import { checkAdminAccess } from '@/lib/actions/admin'
import { PERMISSIONS } from '@/lib/permissions'
import type React from 'react'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await checkAdminAccess()

  return (
    <PermissionGuard permission={PERMISSIONS.DASHBOARD_READ}>
      <div className="flex min-h-[calc(100vh-113px)]">
        <Suspense fallback={<div className="w-64 border-r border-border" />}>
          <AdminSidebar />
        </Suspense>
        <main className="flex-1 overflow-auto md:px-8 py-2 md:py-8">{children}</main>
      </div>
    </PermissionGuard>
  )
}
