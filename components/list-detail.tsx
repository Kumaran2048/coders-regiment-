'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Plus, Trash2, Package } from 'lucide-react'
import { CATEGORIES, getCategoryInfo } from '@/lib/categories'

interface ListItem {
  id: string
  list_id: string
  name: string
  category: string
  quantity: number
  unit: string | null
  is_checked: boolean
  added_by: string
  checked_by: string | null
  price_estimate: number | null
  notes: string | null
  created_at: string
}

interface ListDetailProps {
  list: {
    id: string
    name: string
    status: string
    group_id: string
  }
  groupName: string
  userId: string
  onBack: () => void
}

export function ListDetail({ list, groupName, userId, onBack }: ListDetailProps) {
  const [items, setItems] = useState<ListItem[]>([])
  const [newItemName, setNewItemName] = useState('')
  const [newItemCategory, setNewItemCategory] = useState('other')
  const [newItemQty, setNewItemQty] = useState('1')
  const [loading, setLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const supabase = createClient()

    const fetchItems = async () => {
      const { data } = await supabase
        .from('list_items')
        .select('*')
        .eq('list_id', list.id)
        .order('created_at', { ascending: true })
      setItems(data ?? [])
      setLoading(false)
    }

    fetchItems()

    const channel = supabase
      .channel(`list-items-${list.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'list_items',
          filter: `list_id=eq.${list.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setItems((prev) => {
              if (prev.some((i) => i.id === (payload.new as ListItem).id)) return prev
              return [...prev, payload.new as ListItem]
            })
          } else if (payload.eventType === 'UPDATE') {
            setItems((prev) =>
              prev.map((i) =>
                i.id === (payload.new as ListItem).id ? (payload.new as ListItem) : i,
              ),
            )
          } else if (payload.eventType === 'DELETE') {
            setItems((prev) =>
              prev.filter((i) => i.id !== (payload.old as { id: string }).id),
            )
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [list.id])

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemName.trim()) return
    const supabase = createClient()

    await supabase.from('list_items').insert({
      list_id: list.id,
      name: newItemName.trim(),
      category: newItemCategory,
      quantity: parseFloat(newItemQty) || 1,
      added_by: userId,
      is_checked: false,
    })

    setNewItemName('')
    setNewItemQty('1')
    inputRef.current?.focus()
  }

  const toggleItem = async (item: ListItem) => {
    const supabase = createClient()
    await supabase
      .from('list_items')
      .update({
        is_checked: !item.is_checked,
        checked_by: !item.is_checked ? userId : null,
      })
      .eq('id', item.id)
  }

  const deleteItem = async (id: string) => {
    const supabase = createClient()
    await supabase.from('list_items').delete().eq('id', id)
  }

  const checkedCount = items.filter((i) => i.is_checked).length
  const totalCount = items.length

  // Group items by category
  const grouped = items.reduce(
    (acc, item) => {
      const cat = item.category || 'other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    },
    {} as Record<string, ListItem[]>,
  )

  const sortedCategories = CATEGORIES.filter((c) => grouped[c.value])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to lists">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="font-display text-xl font-bold text-foreground">
            {list.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {groupName} &middot; {checkedCount}/{totalCount} items
          </p>
        </div>
        {totalCount > 0 && (
          <div className="hidden sm:block">
            <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Add item form */}
      <form onSubmit={addItem} className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-end">
        <div className="flex-1 grid gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Item</label>
          <Input
            ref={inputRef}
            placeholder="Add an item..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
          />
        </div>
        <div className="grid gap-1.5 sm:w-36">
          <label className="text-xs font-medium text-muted-foreground">Category</label>
          <Select value={newItemCategory} onValueChange={setNewItemCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5 sm:w-20">
          <label className="text-xs font-medium text-muted-foreground">Qty</label>
          <Input
            type="number"
            min="1"
            step="0.5"
            value={newItemQty}
            onChange={(e) => setNewItemQty(e.target.value)}
          />
        </div>
        <Button type="submit" className="gap-2 sm:w-auto">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </form>

      {/* Items grouped by category */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : totalCount === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Package className="h-7 w-7 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-display font-semibold text-foreground">No items yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Start adding items to your list above.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedCategories.map((category) => {
            const catItems = grouped[category.value]
            const catInfo = getCategoryInfo(category.value)
            return (
              <div key={category.value}>
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${catInfo.color}`}
                  >
                    {catInfo.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {catItems.filter((i) => i.is_checked).length}/{catItems.length}
                  </span>
                </div>
                <div className="space-y-1">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={item.is_checked}
                        onCheckedChange={() => toggleItem(item)}
                        aria-label={`Mark ${item.name} as ${item.is_checked ? 'unchecked' : 'checked'}`}
                      />
                      <span
                        className={`flex-1 text-sm ${
                          item.is_checked
                            ? 'text-muted-foreground line-through'
                            : 'text-card-foreground'
                        }`}
                      >
                        {item.name}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-xs text-muted-foreground">
                          x{item.quantity}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteItem(item.id)}
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
