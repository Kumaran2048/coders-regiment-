'use client'

import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/dashboard')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-muted p-6 md:p-10">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-display">Supabase not configured</CardTitle>
              <CardDescription>
                Sign in requires Supabase. Add <code className="rounded bg-muted px-1 py-0.5 text-sm">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="rounded bg-muted px-1 py-0.5 text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code className="rounded bg-muted px-1 py-0.5 text-sm">.env.local</code>, then restart the dev server. See <code className="rounded bg-muted px-1 py-0.5">.env.example</code> or{' '}
                <a href="https://supabase.com/dashboard/project/_/settings/api" target="_blank" rel="noopener noreferrer" className="text-primary underline">Supabase API settings</a>.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <ShoppingCart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground">
              FreshCart
            </span>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-display">Welcome back</CardTitle>
              <CardDescription>
                Sign in to your account to continue shopping together
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  {"Don't have an account?"}{' '}
                  <Link
                    href="/auth/sign-up"
                    className="text-primary underline underline-offset-4"
                  >
                    Sign up
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
