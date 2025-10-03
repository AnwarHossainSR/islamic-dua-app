import type React from "react"
import { checkAdminAccess } from "@/lib/actions/admin"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Suspense } from "react"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await checkAdminAccess()

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Suspense fallback={<div className="w-64 border-r border-border" />}>
        <AdminSidebar />
      </Suspense>
      <main className="flex-1 overflow-auto">
        <div className="container py-8">{children}</div>
      </main>
    </div>
  )
}
