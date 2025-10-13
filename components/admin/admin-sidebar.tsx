"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  Tags,
  Sparkles,
  Calendar,
  Users,
  Settings,
  Upload,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

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

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="space-y-4 p-4">
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
              onClick={onLinkClick}
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
  )
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed bottom-4 right-4 z-50 lg:hidden bg-transparent">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent onLinkClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <aside className="hidden w-64 border-r border-border bg-card lg:block">
        <div className="sticky top-16">
          <SidebarContent />
        </div>
      </aside>
    </>
  )
}
