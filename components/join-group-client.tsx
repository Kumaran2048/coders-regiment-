'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, Users } from 'lucide-react'

interface JoinGroupClientProps {
  group: { id: string; name: string; description: string | null }
  userId: string
  code: string
}

export function JoinGroupClient({ group, userId }: JoinGroupClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleJoin = async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { error: joinError } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: userId, role: 'member' })

    if (joinError) {
      if (joinError.message.includes('duplicate')) {
        router.push('/dashboard')
        return
      }
      setError(joinError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <ShoppingCart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground">FreshCart</span>
          </div>
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-display text-xl">
                {"You've been invited!"}
              </CardTitle>
              <CardDescription>
                Join <strong>{group.name}</strong>
                {group.description ? ` - ${group.description}` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <Button onClick={handleJoin} disabled={loading} className="w-full">
                {loading ? 'Joining...' : 'Join group'}
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard')} className="w-full">
                Go to dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
