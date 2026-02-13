-- Create shopping_events table
create table if not exists public.shopping_events (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  description text,
  scheduled_date date not null,
  assigned_to uuid references auth.users(id),
  created_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'planned' check (status in ('planned', 'completed', 'cancelled')),
  created_at timestamptz default now()
);

alter table public.shopping_events enable row level security;

create policy "events_select" on public.shopping_events for select
  using (group_id in (select group_id from public.group_members where user_id = auth.uid()));

create policy "events_insert" on public.shopping_events for insert
  with check (group_id in (select group_id from public.group_members where user_id = auth.uid()) and auth.uid() = created_by);

create policy "events_update" on public.shopping_events for update
  using (group_id in (select group_id from public.group_members where user_id = auth.uid()));

create policy "events_delete" on public.shopping_events for delete
  using (created_by = auth.uid() or group_id in (select group_id from public.group_members where user_id = auth.uid() and role in ('owner', 'admin')));
