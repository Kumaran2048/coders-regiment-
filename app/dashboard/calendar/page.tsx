import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CalendarClient } from '@/components/calendar-client'

export default async function CalendarPage() {
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

  let events: Array<{
    id: string
    title: string
    description: string | null
    scheduled_date: string
    status: string
    group_id: string
    created_by: string
    assigned_to: string | null
    created_at: string
  }> = []

  if (groupIds.length > 0) {
    const { data } = await supabase
      .from('shopping_events')
      .select('*')
      .in('group_id', groupIds)
      .order('scheduled_date', { ascending: true })
    events = data ?? []
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Calendar</h1>
        <p className="mt-1 text-muted-foreground">
          Schedule shopping trips and assign them to group members.
        </p>
      </div>
      <CalendarClient
        initialEvents={events}
        groups={groups}
        userId={user.id}
      />
    </div>
  )
}
