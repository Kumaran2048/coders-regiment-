import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { JoinGroupClient } from '@/components/join-group-client'

export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?redirect=/join/${code}`)
  }

  const { data: group } = await supabase
    .from('groups')
    .select('id, name, description')
    .eq('invite_code', code.toUpperCase())
    .single()

  if (!group) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Invalid invite code
          </h1>
          <p className="mt-2 text-muted-foreground">
            This invite code does not match any group.
          </p>
        </div>
      </div>
    )
  }

  return <JoinGroupClient group={group} userId={user.id} code={code} />
}
