'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
import { Plus, ListChecks, ShoppingBasket } from 'lucide-react'
import { ListDetail } from '@/components/list-detail'

interface ShoppingList {
  id: string
  name: string
  status: string
  group_id: string
  created_at: string
  created_by: string
}

interface Group {
  id: string
  name: string
}

export function ListsClient({
  initialLists,
  groups,
  userId,
}: {
  initialLists: ShoppingList[]
  groups: Group[]
  userId: string
}) {
  const router = useRouter()
  const [lists, setLists] = useState(initialLists)
  const [selectedList, setSelectedList] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (groups.length === 0) return
    const supabase = createClient()
    const channel = supabase
      .channel('lists-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shopping_lists',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newList = payload.new as ShoppingList
            if (groups.some((g) => g.id === newList.group_id)) {
              setLists((prev) => [newList, ...prev])
            }
          } else if (payload.eventType === 'UPDATE') {
            setLists((prev) =>
              prev.map((l) =>
                l.id === (payload.new as ShoppingList).id
                  ? (payload.new as ShoppingList)
                  : l,
              ),
            )
          } else if (payload.eventType === 'DELETE') {
            setLists((prev) =>
              prev.filter((l) => l.id !== (payload.old as { id: string }).id),
            )
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [groups])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('shopping_lists')
      .insert({
        name: newName,
        group_id: selectedGroup,
        created_by: userId,
        status: 'active',
      })
      .select()
      .single()

    if (!error && data) {
      setLists((prev) => [data, ...prev])
      setSelectedList(data.id)
    }

    setNewName('')
    setSelectedGroup('')
    setCreateOpen(false)
    setLoading(false)
  }

  if (selectedList) {
    const list = lists.find((l) => l.id === selectedList)
    if (list) {
      return (
        <ListDetail
          list={list}
          groupName={groups.find((g) => g.id === list.group_id)?.name ?? ''}
          userId={userId}
          onBack={() => setSelectedList(null)}
        />
      )
    }
  }

  return (
    <div className="space-y-6">
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2" disabled={groups.length === 0}>
            <Plus className="h-4 w-4" /> New list
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Create shopping list</DialogTitle>
            <DialogDescription>
              Create a new shared list for one of your groups.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="listName">List name</Label>
              <Input
                id="listName"
                placeholder="e.g. Weekly Groceries"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
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
              {loading ? 'Creating...' : 'Create list'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <ListChecks className="h-7 w-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-display font-semibold text-card-foreground">
                Join a group first
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                You need to be part of a group before creating shopping lists.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : lists.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <ShoppingBasket className="h-7 w-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-display font-semibold text-card-foreground">
                No shopping lists yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first shared shopping list.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {lists.map((list) => {
            const groupName =
              groups.find((g) => g.id === list.group_id)?.name ?? 'Unknown'
            return (
              <Card
                key={list.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => setSelectedList(list.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="font-display text-lg">
                        {list.name}
                      </CardTitle>
                      <CardDescription>{groupName}</CardDescription>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                        list.status === 'active'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {list.status}
                    </span>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
