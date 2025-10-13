"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, BookOpen, FolderTree, Tags, Sparkles, Calendar, Users, Settings, Upload } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Duas", href: "/admin/duas", icon: BookOpen },
  { name: "Categories", href: "/admin/categories", icon: FolderTree },
  { name: "Tags", href: "/admin/tags", icon: Tags },
  { name: "Fazilat", href: "/admin/fazilat", icon: Sparkles },
  { name: "Day-wise Duas", href: "/admin/day-wise", icon: Calendar },
  { name: "Dhikr Presets", href: "/admin/dhikr-presets", icon: BookOpen },
  { name: "Admin Users", href: "/admin/users", icon: Users },
  { name: "Import/Export", href: "/admin/import-export", icon: Upload },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-border bg-card">
      <div className="sticky top-16 space-y-4 p-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 text-lg font-semibold">Admin Panel</h2>
          <p className="text-sm text-muted-foreground">Content Management</p>
        </div>
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
