'use client'

import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  ShoppingCart,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Calendar,
  PieChart,
  Users,
  CreditCard,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'

interface DashboardShellProps {
  user: User
  profile: { display_name: string | null; avatar_url: string | null } | null
  groups: { id: string; name: string; role: string }[]
  children: React.ReactNode
}

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/dashboard/lists', label: 'Lists', icon: ListChecks },
  { href: '/dashboard/chat', label: 'Chat', icon: MessageSquare },
  { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
  { href: '/dashboard/budget', label: 'Budget', icon: PieChart },
  { href: '/dashboard/groups', label: 'Groups', icon: Users },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
]

export function DashboardShell({
  user,
  profile,
  groups,
  children,
}: DashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const displayName =
    profile?.display_name || user.user_metadata?.display_name || user.email

  return (
    <div className="flex min-h-svh bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-card lg:flex">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <ShoppingCart className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-card-foreground">
            FreshCart
          </span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        {groups.length > 0 && (
          <div className="border-t p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Your Groups
            </p>
            <div className="space-y-1">
              {groups.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                    {g.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate">{g.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {(displayName ?? 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium text-card-foreground">
                {displayName}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="h-8 w-8 text-muted-foreground"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-card px-4 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <ShoppingCart className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-card-foreground">
              FreshCart
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </header>

        {/* Mobile nav overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-foreground/20"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute right-0 top-0 h-full w-72 bg-card shadow-lg">
              <div className="flex h-14 items-center justify-end px-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="space-y-1 px-4">
                {navItems.map((item) => {
                  const isActive =
                    item.href === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
              <div className="mt-4 border-t p-4">
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </aside>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
