import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ShoppingCart,
  Users,
  MessageSquare,
  Calendar,
  PieChart,
  QrCode,
  ArrowRight,
  CheckCircle2,
  Leaf,
} from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Shared Lists',
    description:
      'Collaborate in real-time. Everyone sees updates instantly as items are added, checked off, or categorized.',
  },
  {
    icon: MessageSquare,
    title: 'Group Chat',
    description:
      'Coordinate with your household. Discuss what to buy, share deals, and plan shopping trips together.',
  },
  {
    icon: Calendar,
    title: 'Shopping Calendar',
    description:
      'Schedule shopping trips and assign them to members. Never miss a weekly run again.',
  },
  {
    icon: PieChart,
    title: 'Budget Tracking',
    description:
      'Track spending across trips, split costs fairly, and stay within your household budget.',
  },
  {
    icon: QrCode,
    title: 'QR Join Codes',
    description:
      'Invite anyone to your group instantly with a scannable QR code. No account sharing needed.',
  },
  {
    icon: Leaf,
    title: 'Smart Categories',
    description:
      'Items auto-organize by category - produce, dairy, bakery, and more - for efficient store navigation.',
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <ShoppingCart className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              FreshCart
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <Leaf className="h-3.5 w-3.5 text-primary" />
              Shop smarter, together
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              Grocery shopping made{' '}
              <span className="text-primary">effortless</span> for groups
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
              FreshCart brings your household together with shared shopping
              lists, real-time collaboration, budget tracking, and smart payment
              splitting. No more duplicate trips or forgotten items.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="gap-2">
                <Link href="/auth/sign-up">
                  Start for free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/auth/login">Sign in to your group</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Checklist visual */}
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="mx-auto max-w-md rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display font-semibold text-card-foreground">
                Weekly Groceries
              </h3>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                4/6 items
              </span>
            </div>
            <ul className="space-y-3">
              {[
                { name: 'Organic bananas', cat: 'Produce', checked: true },
                { name: 'Whole milk', cat: 'Dairy', checked: true },
                { name: 'Sourdough bread', cat: 'Bakery', checked: true },
                { name: 'Chicken breast', cat: 'Meat', checked: true },
                { name: 'Frozen berries', cat: 'Frozen', checked: false },
                { name: 'Paper towels', cat: 'Household', checked: false },
              ].map((item) => (
                <li key={item.name} className="flex items-center gap-3">
                  <CheckCircle2
                    className={`h-5 w-5 flex-shrink-0 ${item.checked ? 'text-primary' : 'text-border'}`}
                  />
                  <span
                    className={`flex-1 text-sm ${item.checked ? 'text-muted-foreground line-through' : 'text-card-foreground'}`}
                  >
                    {item.name}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {item.cat}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/50 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl text-balance">
                Everything your household needs
              </h2>
              <p className="mt-4 text-muted-foreground text-pretty">
                From shared lists to payment splitting, FreshCart handles the
                logistics so you can focus on what matters.
              </p>
            </div>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-card-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl text-balance">
              Ready to shop smarter?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground text-pretty">
              Create your group in seconds, invite your household with a QR
              code, and start building your first shared list.
            </p>
            <Button size="lg" asChild className="mt-8 gap-2">
              <Link href="/auth/sign-up">
                Create your free group <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <ShoppingCart className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-display text-sm font-semibold text-foreground">
              FreshCart
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built for households that shop together.
          </p>
        </div>
      </footer>
    </div>
  )
}
