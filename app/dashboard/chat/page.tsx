import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatClient } from '@/components/chat-client'

export default async function ChatPage() {
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

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Chat</h1>
        <p className="mt-1 text-muted-foreground">
          Coordinate with your group members in real time.
        </p>
      </div>
      <ChatClient groups={groups} userId={user.id} userEmail={user.email ?? ''} />
    </div>
  )
}
