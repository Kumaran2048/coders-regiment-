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
import { Plus, Calendar, CheckCircle2, Clock, MapPin } from 'lucide-react'

interface ShoppingEvent {
  id: string
  title: string
  description: string | null
  scheduled_date: string
  status: string
  group_id: string
  created_by: string
  assigned_to: string | null
  created_at: string
}

interface Group {
  id: string
  name: string
}

export function CalendarClient({
  initialEvents,
  groups,
  userId,
}: {
  initialEvents: ShoppingEvent[]
  groups: Group[]
  userId: string
}) {
  const router = useRouter()
  const [events, setEvents] = useState(initialEvents)
  const [createOpen, setCreateOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { data, error: insertError } = await supabase
      .from('shopping_events')
      .insert({
        title,
        description: description || null,
        scheduled_date: date,
        status: 'planned',
        group_id: selectedGroup,
        created_by: userId,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    if (data) {
      setEvents((prev) => [...prev, data].sort(
        (a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
      ))
    }

    setTitle('')
    setDescription('')
    setDate('')
    setSelectedGroup('')
    setCreateOpen(false)
    setLoading(false)
  }

  const toggleComplete = async (event: ShoppingEvent) => {
    const supabase = createClient()
    const newStatus = event.status === 'completed' ? 'planned' : 'completed'
    await supabase
      .from('shopping_events')
      .update({ status: newStatus })
      .eq('id', event.id)
    setEvents((prev) =>
      prev.map((e) => (e.id === event.id ? { ...e, status: newStatus } : e)),
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const today = new Date().toISOString().split('T')[0]
  const upcomingEvents = events.filter((e) => e.scheduled_date >= today && e.status !== 'completed' && e.status !== 'cancelled')
  const pastEvents = events.filter((e) => e.scheduled_date < today || e.status === 'completed' || e.status === 'cancelled')

  if (groups.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Calendar className="h-7 w-7 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-display font-semibold text-card-foreground">
              Join a group first
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Calendar events are linked to groups.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Schedule trip
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Schedule a shopping trip</DialogTitle>
            <DialogDescription>
              Plan a trip and assign it to your group.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="eventTitle">Title</Label>
              <Input
                id="eventTitle"
                placeholder="e.g. Weekly grocery run"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="eventDesc">Description (optional)</Label>
              <Input
                id="eventDesc"
                placeholder="Notes about this trip"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="eventDate">Date</Label>
              <Input
                id="eventDate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
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
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || !selectedGroup}>
              {loading ? 'Scheduling...' : 'Schedule trip'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upcoming events */}
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-foreground">
          Upcoming
        </h2>
        {upcomingEvents.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No upcoming shopping trips scheduled.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => {
              const groupName = groups.find((g) => g.id === event.group_id)?.name ?? ''
              return (
                <Card key={event.id}>
                  <CardContent className="flex items-center gap-4 py-4">
                    <button
                      onClick={() => toggleComplete(event)}
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary/30 text-primary/30 transition-colors hover:border-primary hover:text-primary"
                      aria-label="Mark as completed"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </button>
                    <div className="flex-1">
                      <p className="font-medium text-card-foreground">{event.title}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(event.scheduled_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {groupName}
                        </span>
                      </div>
                      {event.description && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {event.description}
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

      {/* Past events */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold text-muted-foreground">
            Past / Completed
          </h2>
          <div className="space-y-2">
            {pastEvents.map((event) => {
              const groupName = groups.find((g) => g.id === event.group_id)?.name ?? ''
              return (
                <Card key={event.id} className="opacity-60">
                  <CardContent className="flex items-center gap-4 py-3">
                    <button
                      onClick={() => toggleComplete(event)}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                      aria-label="Mark as incomplete"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-card-foreground line-through">
                        {event.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(event.scheduled_date)} &middot; {groupName}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
