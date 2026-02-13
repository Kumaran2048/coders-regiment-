'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Send, MessageSquare } from 'lucide-react'

interface Message {
  id: string
  content: string
  user_id: string
  group_id: string
  type: string
  created_at: string
  user_email?: string
}

interface Group {
  id: string
  name: string
}

export function ChatClient({
  groups,
  userId,
  userEmail,
}: {
  groups: Group[]
  userId: string
  userEmail: string
}) {
  const [selectedGroup, setSelectedGroup] = useState(groups[0]?.id ?? '')
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [profiles, setProfiles] = useState<Record<string, string>>({})
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!selectedGroup) return
    const supabase = createClient()
    setLoading(true)

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('group_id', selectedGroup)
        .order('created_at', { ascending: true })
        .limit(100)
      setMessages(data ?? [])
      setLoading(false)

      // Fetch profiles for message authors
      const userIds = [...new Set((data ?? []).map((m) => m.user_id))]
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', userIds)
        const map: Record<string, string> = {}
        profileData?.forEach((p) => {
          map[p.id] = p.display_name || 'User'
        })
        setProfiles(map)
      }
    }

    fetchMessages()

    // Set up Realtime subscription with error handling
    let channel: ReturnType<typeof supabase.channel> | null = null
    try {
      channel = supabase
        .channel(`chat-${selectedGroup}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `group_id=eq.${selectedGroup}`,
          },
          async (payload) => {
            const msg = payload.new as Message
            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev
              return [...prev, msg]
            })
            // Fetch profile if not known
            if (!profiles[msg.user_id]) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('id, display_name')
                .eq('id', msg.user_id)
                .single()
              if (profile) {
                setProfiles((prev) => ({
                  ...prev,
                  [profile.id]: profile.display_name || 'User',
                }))
              }
            }
          },
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Chat realtime connected')
          } else if (status === 'CHANNEL_ERROR') {
            console.warn('Chat realtime connection failed, using polling fallback')
            // Fallback: poll for new messages every 3 seconds
            const pollInterval = setInterval(() => {
              fetchMessages()
            }, 3000)
            return () => clearInterval(pollInterval)
          }
        })
    } catch (error) {
      console.warn('Failed to set up realtime, using polling fallback:', error)
      // Fallback: poll for new messages every 3 seconds
      const pollInterval = setInterval(() => {
        fetchMessages()
      }, 3000)
      return () => {
        clearInterval(pollInterval)
        if (channel) supabase.removeChannel(channel)
      }
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [selectedGroup, userId])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedGroup) return
    const supabase = createClient()

    const { error } = await supabase.from('messages').insert({
      content: newMessage.trim(),
      user_id: userId,
      group_id: selectedGroup,
      type: 'text',
    })

    if (error) {
      console.error('Failed to send message:', error)
      alert(`Failed to send message: ${error.message}`)
      return
    }

    setNewMessage('')
    // Refresh messages to show the new one (in case realtime isn't working)
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('group_id', selectedGroup)
      .order('created_at', { ascending: true })
      .limit(100)
    if (data) {
      setMessages(data)
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    if (date.toDateString() === today.toDateString()) return 'Today'
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  // Group messages by date
  const messagesByDate = messages.reduce(
    (acc, msg) => {
      const dateKey = new Date(msg.created_at).toDateString()
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(msg)
      return acc
    },
    {} as Record<string, Message[]>,
  )

  if (groups.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <MessageSquare className="h-7 w-7 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-display font-semibold text-card-foreground">
              Join a group to start chatting
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Group chat is available once you join or create a group.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Select value={selectedGroup} onValueChange={setSelectedGroup}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Select group" />
        </SelectTrigger>
        <SelectContent>
          {groups.map((g) => (
            <SelectItem key={g.id} value={g.id}>
              {g.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex h-[500px] flex-col rounded-xl border bg-card">
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <MessageSquare className="h-8 w-8" />
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(messagesByDate).map(([dateKey, msgs]) => (
                <div key={dateKey}>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(msgs[0].created_at)}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="space-y-3">
                    {msgs.map((msg) => {
                      const isOwn = msg.user_id === userId
                      const name = profiles[msg.user_id] || 'User'
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                              isOwn
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground'
                            }`}
                          >
                            {!isOwn && (
                              <p className="mb-0.5 text-xs font-medium opacity-70">
                                {name}
                              </p>
                            )}
                            <p className="text-sm">{msg.content}</p>
                            <p
                              className={`mt-1 text-right text-[10px] ${
                                isOwn ? 'opacity-70' : 'text-muted-foreground'
                              }`}
                            >
                              {formatTime(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          )}
        </div>

        <form
          onSubmit={sendMessage}
          className="flex items-center gap-2 border-t bg-card p-4"
        >
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newMessage.trim()}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
