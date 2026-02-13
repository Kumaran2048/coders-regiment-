-- Create messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  type text not null default 'text' check (type in ('text', 'system')),
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

create policy "messages_select" on public.messages for select
  using (group_id in (select group_id from public.group_members where user_id = auth.uid()));

create policy "messages_insert" on public.messages for insert
  with check (group_id in (select group_id from public.group_members where user_id = auth.uid()) and auth.uid() = user_id);

create policy "messages_delete" on public.messages for delete
  using (auth.uid() = user_id);

-- Enable realtime on messages
alter publication supabase_realtime add table public.messages;
