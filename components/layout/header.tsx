import { Button } from "@/components/ui/button"
import { isUserAdmin } from "@/lib/actions/admin"
import { getUser } from "@/lib/actions/auth"
import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"
import { UserMenu } from "./user-menu"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export async function Header() {
  const user = await getUser()
  const isAdmin = user ? await isUserAdmin() : false

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-xl font-bold">HR</span>
          </div>
          <span className="hidden text-lg font-semibold sm:inline-block">Heaven Rose Islamic</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/duas">Duas</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/dhikr">Dhikr</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/daily-practices">Daily Practices</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/categories">Categories</Link>
          </Button>
          <ThemeToggle />
          {user ? (
            <UserMenu user={user} isAdmin={isAdmin} />
          ) : (
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          {user ? (
            <UserMenu user={user} isAdmin={isAdmin} />
          ) : (
            <Button size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 pt-8">
                <Button variant="ghost" asChild className="justify-start">
                  <Link href="/duas">Duas</Link>
                </Button>
                <Button variant="ghost" asChild className="justify-start">
                  <Link href="/dhikr">Dhikr</Link>
                </Button>
                <Button variant="ghost" asChild className="justify-start">
                  <Link href="/daily-practices">Daily Practices</Link>
                </Button>
                <Button variant="ghost" asChild className="justify-start">
                  <Link href="/categories">Categories</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
