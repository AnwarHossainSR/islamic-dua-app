'use client'

import { Badge } from '@/components/ui/badge'
import { usePermissions } from '@/hooks/use-permissions'
import { PERMISSIONS } from '@/lib/permissions/constants'
import { cn } from '@/lib/utils'
import {
  Activity,
  BookOpen,
  Brain,
  Calendar,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Logs,
  Menu,
  Settings,
  Shield,
  Target,
  Users,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, Activity as ReactActivity } from 'react'
import { Route } from 'next'
import { signOut } from '@/lib/actions/auth'

const navigationGroups = [
  {
    name: 'Overview',
    icon: LayoutDashboard,
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_READ },
      { name: 'AI Assistant', href: '/ai', icon: Brain, permission: PERMISSIONS.DASHBOARD_READ },
    ]
  },
  {
    name: 'Content',
    icon: BookOpen,
    items: [
      { name: 'Challenges', href: '/challenges', icon: Target, permission: PERMISSIONS.CHALLENGES_READ },
      { name: 'Missed Challenges', href: '/missed-challenges', icon: Calendar, permission: PERMISSIONS.CHALLENGES_READ },
      { name: 'Duas', href: '/duas', icon: BookOpen, permission: PERMISSIONS.DUAS_READ },
      { name: 'Activities', href: '/activities', icon: Activity, permission: PERMISSIONS.ACTIVITIES_READ },
    ]
  },
  {
    name: 'Management',
    icon: Users,
    items: [
      { name: 'Users', href: '/users', icon: Users, permission: PERMISSIONS.USERS_READ },
      { name: 'Permissions', href: '/users/permissions', icon: Shield, permission: PERMISSIONS.ADMIN_USERS_READ },
      { name: 'Logs', href: '/logs', icon: Logs, permission: PERMISSIONS.LOGS_READ },
      { name: 'Settings', href: '/settings', icon: Settings, permission: PERMISSIONS.SETTINGS_READ },
    ]
  }
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])
  const { hasPermission, role } = usePermissions()

  const filteredGroups = navigationGroups.map(group => ({
    ...group,
    items: group.items.filter(item => hasPermission(item.permission))
  })).filter(group => group.items.length > 0)

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupName) 
        ? prev.filter(name => name !== groupName)
        : [...prev, groupName]
    )
  }

  // Close sidebar when route changes on mobile
  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(false), 0)
    return () => clearTimeout(timer)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-primary p-3 text-primary-foreground shadow-lg md:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-80 transform border-r border-border bg-card transition-transform duration-300 ease-in-out md:sticky md:top-16 md:w-[18%] md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="space-y-4 p-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 text-lg font-semibold">
              {role === 'super_admin' ? 'Super Admin Panel' : 'Navigation'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {role === 'super_admin' ? 'System Management' : 'Your Islamic Journey'}
            </p>
          </div>
          <nav className="space-y-2">
            {filteredGroups.map(group => {
              const isExpanded = expandedGroups.includes(group.name)
              const hasActiveItem = group.items.some(item => pathname === item.href)
              
              return (
                <div key={group.name} className="space-y-1">
                  <button
                    onClick={() => toggleGroup(group.name)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer',
                      hasActiveItem
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <group.icon className="h-4 w-4" />
                      {group.name}
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  
                  <ReactActivity mode={isExpanded ? 'visible' : 'hidden'}>
                    <div className="ml-4 space-y-1 border-l border-border pl-4">
                      {group.items.map(item => {
                        const isActive = pathname === item.href
                        return (
                          <Link
                            key={item.name}
                            href={item.href as Route}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer',
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                          >
                            <item.icon className="h-3 w-3" />
                            {item.name}
                          </Link>
                        )
                      })}
                    </div>
                  </ReactActivity>
                </div>
              )
            })}
            
            {/* Logout Button */}
            <button
              onClick={() => signOut(pathname)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </nav>

          {/* Role Badge */}
          <div className="mt-4 pt-4 border-t">
            <Badge
              variant={
                role === 'super_admin' ? 'default' : role === 'editor' ? 'secondary' : 'outline'
              }
              className="w-full justify-center"
            >
              {role === 'super_admin' ? 'Super Admin' : role === 'editor' ? 'Editor' : 'User'}
            </Badge>
          </div>
        </div>
      </aside>
    </>
  )
}
