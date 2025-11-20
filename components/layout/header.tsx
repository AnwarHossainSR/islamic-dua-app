import { NotificationDropdown } from '@/components/notifications/notification-dropdown'
import { Button } from '@/components/ui/button'
import { isUserAdmin } from '@/lib/actions/admin'
import { getUser } from '@/lib/actions/auth'
import Link from 'next/link'
import { Activity } from 'react'
import { ThemeToggle } from './theme-toggle'
import { UserMenu } from './user-menu'

export async function Header() {
  let user = null
  let isAdmin = false
  
  try {
    user = await getUser()
    isAdmin = user ? await isUserAdmin() : false
  } catch (error) {
    console.log('Auth check failed')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
      <div className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-xl font-bold">HR</span>
          </div>
          <span className="hidden text-lg font-semibold sm:inline-block">Heaven Rose Islamic</span>
        </Link>

        <nav className="flex items-center gap-2">
          <ThemeToggle />
          <Activity mode={user ? 'visible' : 'hidden'}>
            <NotificationDropdown />
            <UserMenu user={user} isAdmin={isAdmin} />
          </Activity>
          <Activity mode={!user ? 'visible' : 'hidden'}>
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </Activity>
        </nav>
      </div>
    </header>
  )
}
