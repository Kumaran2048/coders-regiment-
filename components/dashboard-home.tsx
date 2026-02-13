'use client'

import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ListChecks,
  Calendar,
  PieChart,
  Users,
  CreditCard,
  ChevronRight,
} from 'lucide-react'
import { format } from 'date-fns'

interface Group {
  id: string
  name: string
  invite_code?: string
}

interface ListItem {
  id: string
  name: string
  is_checked: boolean
  shopping_lists?: { name: string; group_id: string } | null
}

interface Event {
  id: string
  title: string
  scheduled_date: string
}

interface Expense {
  id: string
  description: string | null
  amount: number
  created_at: string
}

interface DashboardHomeProps {
  user: User
  profile: { display_name: string | null; avatar_url: string | null } | null
  groups: Group[]
  recentItems: ListItem[]
  upcomingEvents: Event[]
  recentExpenses: Expense[]
  totalOwed: number
  listCount: number
  uncheckedCount: number
}

export function DashboardHome({
  profile,
  groups,
  recentItems,
  upcomingEvents,
  recentExpenses,
  totalOwed,
  listCount,
  uncheckedCount,
}: DashboardHomeProps) {
  const displayName =
    profile?.display_name ?? 'there'

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Welcome back, {displayName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s what&apos;s going on with your shopping groups.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/lists">
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shopping Lists</CardTitle>
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{listCount}</p>
              <p className="text-xs text-muted-foreground">
                {uncheckedCount} unchecked items
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/calendar">
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{upcomingEvents.length}</p>
              <p className="text-xs text-muted-foreground">events this week</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/budget">
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">You owe</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ${totalOwed.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">unsettled splits</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/groups">
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Groups</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{groups.length}</p>
              <p className="text-xs text-muted-foreground">your households</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent list items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent list items</CardTitle>
              <CardDescription>Latest from your shopping lists</CardDescription>
            </div>
            <Link
              href="/dashboard/lists"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No items yet. Create a list and add items.
              </p>
            ) : (
              <ul className="space-y-2">
                {recentItems.slice(0, 5).map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <span className={item.is_checked ? 'text-muted-foreground line-through' : ''}>
                      {item.name}
                    </span>
                    {item.shopping_lists && (
                      <span className="text-xs text-muted-foreground">
                        {item.shopping_lists.name}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Upcoming events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming events</CardTitle>
              <CardDescription>Next shopping or group events</CardDescription>
            </div>
            <Link
              href="/dashboard/calendar"
              className="text-sm font-medium text-primary hover:underline"
            >
              View calendar
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming events.
              </p>
            ) : (
              <ul className="space-y-2">
                {upcomingEvents.slice(0, 5).map((event) => (
                  <li
                    key={event.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <span>{event.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(event.scheduled_date), 'MMM d')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent expenses & quick links */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent expenses</CardTitle>
              <CardDescription>Latest from your groups</CardDescription>
            </div>
            <Link
              href="/dashboard/budget"
              className="text-sm font-medium text-primary hover:underline"
            >
              View budget
            </Link>
          </CardHeader>
          <CardContent>
            {recentExpenses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No expenses yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {recentExpenses.slice(0, 5).map((exp) => (
                  <li
                    key={exp.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <span className="truncate">
                      {exp.description || 'Expense'}
                    </span>
                    <span className="font-medium">
                      ${exp.amount.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Jump to a section</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/dashboard/lists"
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <span className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                Shopping Lists
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/dashboard/calendar"
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendar
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/dashboard/budget"
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <span className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Budget & expenses
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/dashboard/groups"
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Groups
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/dashboard/pay"
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <span className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payments
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
