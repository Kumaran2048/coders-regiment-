'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react'

interface Expense {
  id: string
  description: string
  amount: number
  paid_by: string
  group_id: string
  created_at: string
}

interface Split {
  id: string
  expense_id: string
  user_id: string
  amount: number
  is_settled: boolean
}

interface Group {
  id: string
  name: string
}

export function BudgetClient({
  initialExpenses,
  initialSplits,
  groups,
  userId,
  profiles,
}: {
  initialExpenses: Expense[]
  initialSplits: Split[]
  groups: Group[]
  userId: string
  profiles: Record<string, string>
}) {
  const router = useRouter()
  const [expenses, setExpenses] = useState(initialExpenses)
  const [splits, setSplits] = useState(initialSplits)
  const [createOpen, setCreateOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [loading, setLoading] = useState(false)

  // Calculate balances
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
  const youPaid = expenses
    .filter((e) => e.paid_by === userId)
    .reduce((sum, e) => sum + e.amount, 0)
  const youOwe = splits
    .filter((s) => s.user_id === userId && !s.is_settled)
    .reduce((sum, s) => sum + s.amount, 0)
  const owedToYou = splits
    .filter((s) => {
      const expense = expenses.find((e) => e.id === s.expense_id)
      return expense?.paid_by === userId && s.user_id !== userId && !s.is_settled
    })
    .reduce((sum, s) => sum + s.amount, 0)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        description,
        amount: parseFloat(amount),
        paid_by: userId,
        group_id: selectedGroup,
      })
      .select()
      .single()

    if (!error && data) {
      setExpenses((prev) => [data, ...prev])

      // Auto-split: get group members and split evenly
      const { data: members } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', selectedGroup)

      if (members && members.length > 1) {
        const splitAmount = parseFloat(amount) / members.length
        const newSplits = members
          .filter((m) => m.user_id !== userId)
          .map((m) => ({
            expense_id: data.id,
            user_id: m.user_id,
            amount: Math.round(splitAmount * 100) / 100,
            is_settled: false,
          }))

        if (newSplits.length > 0) {
          const { data: splitData } = await supabase
            .from('expense_splits')
            .insert(newSplits)
            .select()

          if (splitData) {
            setSplits((prev) => [...prev, ...splitData])
          }
        }
      }
    }

    setDescription('')
    setAmount('')
    setSelectedGroup('')
    setCreateOpen(false)
    setLoading(false)
    router.refresh()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (groups.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <PieChart className="h-7 w-7 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-display font-semibold text-card-foreground">
              Join a group first
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Budget tracking is linked to groups.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-xl font-bold text-card-foreground">
                {formatCurrency(totalSpent)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">You Paid</p>
              <p className="text-xl font-bold text-card-foreground">
                {formatCurrency(youPaid)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">You Owe</p>
              <p className="text-xl font-bold text-card-foreground">
                {formatCurrency(youOwe)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
              <DollarSign className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Owed to You</p>
              <p className="text-xl font-bold text-card-foreground">
                {formatCurrency(owedToYou)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add expense
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Add an expense</DialogTitle>
            <DialogDescription>
              The cost will be automatically split evenly among group members.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="expDesc">Description</Label>
              <Input
                id="expDesc"
                placeholder="e.g. Costco run"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expAmount">Amount ($)</Label>
              <Input
                id="expAmount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Group</Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading || !selectedGroup}>
              {loading ? 'Adding...' : 'Add expense'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Expense list */}
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-foreground">
          Recent Expenses
        </h2>
        {expenses.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No expenses recorded yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {expenses.slice(0, 20).map((expense) => {
              const groupName = groups.find((g) => g.id === expense.group_id)?.name ?? ''
              const paidByName =
                expense.paid_by === userId
                  ? 'You'
                  : profiles[expense.paid_by] || 'Unknown'
              const expenseSplits = splits.filter((s) => s.expense_id === expense.id)
              return (
                <Card key={expense.id}>
                  <CardContent className="flex items-center gap-4 py-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-card-foreground">
                        {expense.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {paidByName} paid &middot; {groupName} &middot;{' '}
                        {new Date(expense.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-card-foreground">
                        {formatCurrency(expense.amount)}
                      </p>
                      {expenseSplits.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Split {expenseSplits.length + 1} ways
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
