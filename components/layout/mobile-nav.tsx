'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Home, Target, BookOpen, Brain, Activity } from 'lucide-react'

export function MobileNav() {
  const [open, setOpen] = useState(false)

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/challenges', label: 'Challenges', icon: Target },
    { href: '/duas', label: 'Duas', icon: BookOpen },
    { href: '/activities', label: 'Activities', icon: Activity },
    { href: '/ai', label: 'AI Assistant', icon: Brain },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <div className="flex flex-col gap-4 mt-8">
          <div className="flex items-center gap-2 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">HR</span>
            </div>
            <span className="text-lg font-semibold">Heaven Rose Islamic</span>
          </div>
          
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}