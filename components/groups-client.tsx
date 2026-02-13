'use client'

import { useState } from 'react'
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
import { Plus, Users, Copy, Check, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

interface Group {
  id: string
  name: string
  description: string | null
  invite_code: string
  created_by: string
  created_at: string
  role: string
}

export function GroupsClient({
  groups,
  userId,
}: {
  groups: Group[]
  userId: string
}) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [qrGroupId, setQrGroupId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const code =
      Math.random().toString(36).substring(2, 8).toUpperCase()

    const { data: group, error: createError } = await supabase
      .from('groups')
      .insert({
        name: newName,
        description: newDesc || null,
        invite_code: code,
        created_by: userId,
      })
      .select()
      .single()

    if (createError) {
      setError(createError.message)
      setLoading(false)
      return
    }

    const { error: memberError } = await supabase.from('group_members').insert({
      group_id: group.id,
      user_id: userId,
      role: 'owner',
    })

    if (memberError) {
      setError(memberError.message)
      setLoading(false)
      return
    }

    setNewName('')
    setNewDesc('')
    setCreateOpen(false)
    setLoading(false)
    
    // Small delay to ensure DB operations complete, then navigate
    setTimeout(() => {
      router.push('/dashboard/groups')
    }, 100)
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { data: group } = await supabase
      .from('groups')
      .select('id')
      .eq('invite_code', joinCode.toUpperCase())
      .single()

    if (!group) {
      setError('Invalid invite code')
      setLoading(false)
      return
    }

    const { error: joinError } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: userId,
        role: 'member',
      })

    if (joinError) {
      setError(
        joinError.message.includes('duplicate')
          ? 'You are already a member of this group'
          : joinError.message,
      )
      setLoading(false)
      return
    }

    setJoinCode('')
    setJoinOpen(false)
    setLoading(false)
    
    // Small delay to ensure DB operations complete, then navigate
    setTimeout(() => {
      router.push('/dashboard/groups')
    }, 100)
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Create group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Create a new group</DialogTitle>
              <DialogDescription>
                Start a shopping group for your household, roommates, or friends.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Group name</Label>
                <Input
                  id="name"
                  placeholder="e.g. The Smiths"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc">Description (optional)</Label>
                <Input
                  id="desc"
                  placeholder="Weekly grocery shopping"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create group'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" /> Join group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Join a group</DialogTitle>
              <DialogDescription>
                Enter the invite code shared by a group admin.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Invite code</Label>
                <Input
                  id="code"
                  placeholder="e.g. ABC123"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  required
                  className="uppercase tracking-widest text-center font-mono text-lg"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Joining...' : 'Join group'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-display font-semibold text-card-foreground">
                No groups yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a group or join one with an invite code.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="font-display">{group.name}</CardTitle>
                    {group.description && (
                      <CardDescription>{group.description}</CardDescription>
                    )}
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
                    {group.role}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
                  <code className="flex-1 text-center font-mono text-lg tracking-widest text-foreground">
                    {group.invite_code}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => copyCode(group.invite_code)}
                    aria-label="Copy invite code"
                  >
                    {copied === group.invite_code ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Dialog
                    open={qrGroupId === group.id}
                    onOpenChange={(open) => setQrGroupId(open ? group.id : null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Show QR code"
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xs">
                      <DialogHeader>
                        <DialogTitle className="font-display text-center">
                          Scan to join {group.name}
                        </DialogTitle>
                        <DialogDescription className="text-center">
                          Or use code: {group.invite_code}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-center p-4">
                        <QRCodeSVG
                          value={`${typeof window !== 'undefined' ? window.location.origin : ''}/join/${group.invite_code}`}
                          size={200}
                          bgColor="transparent"
                          fgColor="hsl(152, 55%, 33%)"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
