-- Create groups table
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  invite_code text unique not null default substr(md5(random()::text), 1, 6),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- Create group_members table
create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

alter table public.groups enable row level security;
alter table public.group_members enable row level security;

-- Groups: users can see groups they belong to
create policy "groups_select" on public.groups for select
  using (id in (select group_id from public.group_members where user_id = auth.uid()));

-- Groups: anyone authenticated can create
create policy "groups_insert" on public.groups for insert
  with check (auth.uid() = created_by);

-- Groups: only owner/admin can update
create policy "groups_update" on public.groups for update
  using (id in (select group_id from public.group_members where user_id = auth.uid() and role in ('owner', 'admin')));

-- Groups: only owner can delete
create policy "groups_delete" on public.groups for delete
  using (id in (select group_id from public.group_members where user_id = auth.uid() and role = 'owner'));

-- Group members: members can see other members in their groups
create policy "group_members_select" on public.group_members for select
  using (group_id in (select group_id from public.group_members where user_id = auth.uid()));

-- Group members: authenticated users can insert themselves
create policy "group_members_insert" on public.group_members for insert
  with check (auth.uid() = user_id);

-- Group members: owner/admin can update roles
create policy "group_members_update" on public.group_members for update
  using (group_id in (select group_id from public.group_members where user_id = auth.uid() and role in ('owner', 'admin')));

-- Group members: owner can remove members or members can remove themselves
create policy "group_members_delete" on public.group_members for delete
  using (
    user_id = auth.uid()
    or group_id in (select group_id from public.group_members where user_id = auth.uid() and role = 'owner')
  );

-- Allow selecting groups by invite_code for joining (public read on invite_code)
create policy "groups_select_by_invite" on public.groups for select
  using (true);
