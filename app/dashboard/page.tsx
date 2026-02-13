import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardHome } from '@/components/dashboard-home'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Fetch all data for the dashboard overview
  const [
    { data: profile },
    { data: memberships },
    { data: recentItems },
    { data: events },
    { data: expenses },
    { data: splits },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('group_members')
      .select('group_id, groups(id, name, invite_code)')
      .eq('user_id', user.id),
    supabase
      .from('list_items')
      .select('*, shopping_lists(name, group_id)')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('shopping_events')
      .select('*')
      .gte('scheduled_date', new Date().toISOString().split('T')[0])
      .order('scheduled_date', { ascending: true })
      .limit(5),
    supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('expense_splits')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_settled', false),
  ])

  const groups = (memberships || []).map((m: any) => m.groups).filter(Boolean)
  const groupIds = groups.map((g: any) => g.id)

  // Get list count
  const { count: listCount } = await supabase
    .from('shopping_lists')
    .select('*', { count: 'exact', head: true })
    .in('group_id', groupIds.length > 0 ? groupIds : ['none'])

  // Get unchecked items count
  const { count: uncheckedCount } = await supabase
    .from('list_items')
    .select('*, shopping_lists!inner(group_id)', {
      count: 'exact',
      head: true,
    })
    .eq('is_checked', false)
    .in(
      'shopping_lists.group_id',
      groupIds.length > 0 ? groupIds : ['none']
    )

  const totalOwed = (splits || []).reduce(
    (sum: number, s: any) => sum + s.amount,
    0
  )

  return (
    <DashboardHome
      user={user}
      profile={profile}
      groups={groups || []}
      recentItems={recentItems || []}
      upcomingEvents={events || []}
      recentExpenses={expenses || []}
      totalOwed={totalOwed}
      listCount={listCount || 0}
      uncheckedCount={uncheckedCount || 0}
    />
  )
}
