import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ListsClient } from '@/components/lists-client'

export default async function ListsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id, groups(id, name)')
    .eq('user_id', user.id)

  const groups = (memberships ?? []).map((m) => ({
    id: (m.groups as unknown as { id: string; name: string }).id,
    name: (m.groups as unknown as { id: string; name: string }).name,
  }))

  const groupIds = groups.map((g) => g.id)

  let lists: Array<{
    id: string
    name: string
    status: string
    group_id: string
    created_at: string
    created_by: string
  }> = []

  if (groupIds.length > 0) {
    const { data } = await supabase
      .from('shopping_lists')
      .select('*')
      .in('group_id', groupIds)
      .order('created_at', { ascending: false })
    lists = data ?? []
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Shopping Lists
        </h1>
        <p className="mt-1 text-muted-foreground">
          Create and manage shared shopping lists for your groups.
        </p>
      </div>
      <ListsClient
        initialLists={lists}
        groups={groups}
        userId={user.id}
      />
    </div>
  )
}
