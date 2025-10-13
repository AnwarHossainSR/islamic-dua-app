import type React from "react"
import { checkAdminAccess } from "@/lib/actions/admin"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Suspense } from "react"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await checkAdminAccess()

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Suspense fallback={<div className="hidden w-64 border-r border-border lg:block" />}>
        <AdminSidebar />
      </Suspense>
      <main className="flex-1 overflow-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  )
}
