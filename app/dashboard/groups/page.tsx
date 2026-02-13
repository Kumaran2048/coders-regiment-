import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GroupsClient } from '@/components/groups-client'

export default async function GroupsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id, role, groups(id, name, description, invite_code, created_by, created_at)')
    .eq('user_id', user.id)

  const groups = (memberships ?? []).map((m) => ({
    ...(m.groups as unknown as {
      id: string
      name: string
      description: string | null
      invite_code: string
      created_by: string
      created_at: string
    }),
    role: m.role,
  }))

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Groups</h1>
        <p className="mt-1 text-muted-foreground">
          Create and manage your shopping groups. Share invite codes so others can join.
        </p>
      </div>
      <GroupsClient groups={groups} userId={user.id} />
    </div>
  )
}
