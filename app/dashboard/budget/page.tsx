import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BudgetClient } from '@/components/budget-client'

export default async function BudgetPage() {
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

  let expenses: Array<{
    id: string
    description: string
    amount: number
    paid_by: string
    group_id: string
    created_at: string
  }> = []

  let splits: Array<{
    id: string
    expense_id: string
    user_id: string
    amount: number
    is_settled: boolean
  }> = []

  if (groupIds.length > 0) {
    const { data: expData } = await supabase
      .from('expenses')
      .select('*')
      .in('group_id', groupIds)
      .order('created_at', { ascending: false })
    expenses = expData ?? []

    if (expenses.length > 0) {
      const { data: splitData } = await supabase
        .from('expense_splits')
        .select('*')
        .in('expense_id', expenses.map((e) => e.id))
      splits = splitData ?? []
    }
  }

  // Fetch profiles for all expense-related users
  const allUserIds = [
    ...new Set([...expenses.map((e) => e.paid_by), ...splits.map((s) => s.user_id)]),
  ]
  let profiles: Record<string, string> = {}
  if (allUserIds.length > 0) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', allUserIds)
    profileData?.forEach((p) => {
      profiles[p.id] = p.display_name || 'User'
    })
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Budget</h1>
        <p className="mt-1 text-muted-foreground">
          Track group expenses, split costs, and manage your grocery budget.
        </p>
      </div>
      <BudgetClient
        initialExpenses={expenses}
        initialSplits={splits}
        groups={groups}
        userId={user.id}
        profiles={profiles}
      />
    </div>
  )
}
