import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, ArrowRight, CheckCircle2 } from 'lucide-react'

export default async function PaymentsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Get user's groups
  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id, groups(id, name)')
    .eq('user_id', user.id)

  const groups = (memberships ?? []).map((m) => ({
    id: (m.groups as unknown as { id: string; name: string }).id,
    name: (m.groups as unknown as { id: string; name: string }).name,
  }))

  const groupIds = groups.map((g) => g.id)

  // Get expenses and splits
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
        .eq('is_settled', false)

      splits = splitData ?? []
    }
  }

  // Get profiles for display names
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

  // Calculate what you owe
  const youOwe = splits
    .filter((s) => s.user_id === user.id && !s.is_settled)
    .map((s) => {
      const expense = expenses.find((e) => e.id === s.expense_id)
      const payerId = expense?.paid_by || ''
      return {
        ...s,
        expense,
        payerName: profiles[payerId] || 'User',
        groupName: groups.find((g) => g.id === expense?.group_id)?.name || 'Group',
      }
    })

  // Calculate what's owed to you
  const owedToYou = splits
    .filter((s) => {
      const expense = expenses.find((e) => e.id === s.expense_id)
      return expense?.paid_by === user.id && s.user_id !== user.id && !s.is_settled
    })
    .map((s) => {
      const expense = expenses.find((e) => e.id === s.expense_id)
      return {
        ...s,
        expense,
        debtorName: profiles[s.user_id] || 'User',
        groupName: groups.find((g) => g.id === expense?.group_id)?.name || 'Group',
      }
    })

  const totalOwed = youOwe.reduce((sum, s) => sum + s.amount, 0)
  const totalOwedToYou = owedToYou.reduce((sum, s) => sum + s.amount, 0)

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Payments
        </h1>
        <p className="mt-1 text-muted-foreground">
          View and settle payments with your group members.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">You owe</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">
              ${totalOwed.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              {youOwe.length} unsettled payment{youOwe.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Owed to you</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              ${totalOwedToYou.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              {owedToYou.length} pending payment{owedToYou.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payments you owe */}
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-foreground">
          Payments you owe
        </h2>
        {youOwe.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No outstanding payments. You&apos;re all caught up!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {youOwe.map((split) => (
              <Card key={split.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex-1">
                    <p className="font-medium text-card-foreground">
                      {split.expense?.description || 'Expense'}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Paying {split.payerName} &middot; {split.groupName}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(split.expense?.created_at || '').toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-destructive">
                      ${split.amount.toFixed(2)}
                    </span>
                    <Link
                      href={`/dashboard/pay?amount=${split.amount}&to=${split.expense?.paid_by || ''}&desc=${encodeURIComponent(split.expense?.description || 'Group expense payment')}`}
                    >
                      <Button size="sm" className="gap-2">
                        Pay now
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Payments owed to you */}
      {owedToYou.length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold text-muted-foreground">
            Payments owed to you
          </h2>
          <div className="space-y-3">
            {owedToYou.map((split) => (
              <Card key={split.id} className="opacity-75">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex-1">
                    <p className="font-medium text-card-foreground">
                      {split.expense?.description || 'Expense'}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {split.debtorName} owes you &middot; {split.groupName}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(split.expense?.created_at || '').toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-primary">
                      ${split.amount.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Pending
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Link to budget page */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-card-foreground">
                Manage expenses and budgets
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Track group spending and create expense splits.
              </p>
            </div>
            <Link href="/dashboard/budget">
              <Button variant="outline">Go to Budget</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
