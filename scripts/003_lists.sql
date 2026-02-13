-- Create shopping_lists table
create table if not exists public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  name text not null,
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- Create list_items table
create table if not exists public.list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.shopping_lists(id) on delete cascade,
  name text not null,
  quantity numeric default 1,
  unit text default 'pcs',
  category text not null default 'other' check (category in ('produce', 'dairy', 'bakery', 'meat', 'frozen', 'beverages', 'snacks', 'household', 'other')),
  is_checked boolean default false,
  checked_by uuid references auth.users(id),
  added_by uuid not null references auth.users(id),
  price_estimate numeric default 0,
  notes text,
  created_at timestamptz default now()
);

alter table public.shopping_lists enable row level security;
alter table public.list_items enable row level security;

-- Shopping lists: group members can view
create policy "lists_select" on public.shopping_lists for select
  using (group_id in (select group_id from public.group_members where user_id = auth.uid()));

create policy "lists_insert" on public.shopping_lists for insert
  with check (group_id in (select group_id from public.group_members where user_id = auth.uid()));

create policy "lists_update" on public.shopping_lists for update
  using (group_id in (select group_id from public.group_members where user_id = auth.uid()));

create policy "lists_delete" on public.shopping_lists for delete
  using (created_by = auth.uid() or group_id in (select group_id from public.group_members where user_id = auth.uid() and role in ('owner', 'admin')));

-- List items: group members can CRUD
create policy "items_select" on public.list_items for select
  using (list_id in (select id from public.shopping_lists where group_id in (select group_id from public.group_members where user_id = auth.uid())));

create policy "items_insert" on public.list_items for insert
  with check (list_id in (select id from public.shopping_lists where group_id in (select group_id from public.group_members where user_id = auth.uid())));

create policy "items_update" on public.list_items for update
  using (list_id in (select id from public.shopping_lists where group_id in (select group_id from public.group_members where user_id = auth.uid())));

create policy "items_delete" on public.list_items for delete
  using (list_id in (select id from public.shopping_lists where group_id in (select group_id from public.group_members where user_id = auth.uid())));

-- Enable realtime on list_items
alter publication supabase_realtime add table public.list_items;
alter publication supabase_realtime add table public.shopping_lists;
