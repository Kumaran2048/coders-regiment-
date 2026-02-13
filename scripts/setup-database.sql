-- FreshCart: run this entire file in Supabase SQL Editor once
-- Dashboard → SQL Editor → New query → paste → Run

-- 1. Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 2. Groups
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  invite_code text unique not null default substr(md5(random()::text), 1, 6),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

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

create policy "groups_select" on public.groups for select
  using (id in (select group_id from public.group_members where user_id = auth.uid()));
create policy "groups_insert" on public.groups for insert
  with check (auth.uid() = created_by);
create policy "groups_update" on public.groups for update
  using (id in (select group_id from public.group_members where user_id = auth.uid() and role in ('owner', 'admin')));
create policy "groups_delete" on public.groups for delete
  using (id in (select group_id from public.group_members where user_id = auth.uid() and role = 'owner'));

create policy "group_members_select" on public.group_members for select
  using (group_id in (select group_id from public.group_members where user_id = auth.uid()));
create policy "group_members_insert" on public.group_members for insert
  with check (auth.uid() = user_id);
create policy "group_members_update" on public.group_members for update
  using (group_id in (select group_id from public.group_members where user_id = auth.uid() and role in ('owner', 'admin')));
create policy "group_members_delete" on public.group_members for delete
  using (
    user_id = auth.uid()
    or group_id in (select group_id from public.group_members where user_id = auth.uid() and role = 'owner')
  );
create policy "groups_select_by_invite" on public.groups for select
  using (true);

-- 3. Lists
create table if not exists public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  name text not null,
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

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

create policy "lists_select" on public.shopping_lists for select
  using (group_id in (select group_id from public.group_members where user_id = auth.uid()));
create policy "lists_insert" on public.shopping_lists for insert
  with check (group_id in (select group_id from public.group_members where user_id = auth.uid()));
create policy "lists_update" on public.shopping_lists for update
  using (group_id in (select group_id from public.group_members where user_id = auth.uid()));
create policy "lists_delete" on public.shopping_lists for delete
  using (created_by = auth.uid() or group_id in (select group_id from public.group_members where user_id = auth.uid() and role in ('owner', 'admin')));

create policy "items_select" on public.list_items for select
  using (list_id in (select id from public.shopping_lists where group_id in (select group_id from public.group_members where user_id = auth.uid())));
create policy "items_insert" on public.list_items for insert
  with check (list_id in (select id from public.shopping_lists where group_id in (select group_id from public.group_members where user_id = auth.uid())));
create policy "items_update" on public.list_items for update
  using (list_id in (select id from public.shopping_lists where group_id in (select group_id from public.group_members where user_id = auth.uid())));
create policy "items_delete" on public.list_items for delete
  using (list_id in (select id from public.shopping_lists where group_id in (select group_id from public.group_members where user_id = auth.uid())));

do $$ begin alter publication supabase_realtime add table public.list_items; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.shopping_lists; exception when duplicate_object then null; end $$;

-- 4. Chat (messages)
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

do $$ begin alter publication supabase_realtime add table public.messages; exception when duplicate_object then null; end $$;

-- 5. Calendar (shopping_events)
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

-- 6. Budget (budgets, expenses, expense_splits)
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  month integer not null check (month between 1 and 12),
  year integer not null,
  amount numeric not null default 0,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(group_id, month, year)
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  list_id uuid references public.shopping_lists(id) on delete set null,
  paid_by uuid not null references auth.users(id) on delete cascade,
  amount numeric not null,
  description text not null,
  receipt_url text,
  created_at timestamptz default now()
);

create table if not exists public.expense_splits (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null,
  is_settled boolean default false,
  settled_at timestamptz,
  unique(expense_id, user_id)
);

alter table public.budgets enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_splits enable row level security;

create policy "budgets_select" on public.budgets for select
  using (group_id in (select group_id from public.group_members where user_id = auth.uid()));
create policy "budgets_insert" on public.budgets for insert
  with check (group_id in (select group_id from public.group_members where user_id = auth.uid()));
create policy "budgets_update" on public.budgets for update
  using (group_id in (select group_id from public.group_members where user_id = auth.uid()));

create policy "expenses_select" on public.expenses for select
  using (group_id in (select group_id from public.group_members where user_id = auth.uid()));
create policy "expenses_insert" on public.expenses for insert
  with check (group_id in (select group_id from public.group_members where user_id = auth.uid()) and auth.uid() = paid_by);
create policy "expenses_update" on public.expenses for update
  using (auth.uid() = paid_by);
create policy "expenses_delete" on public.expenses for delete
  using (auth.uid() = paid_by);

create policy "splits_select" on public.expense_splits for select
  using (expense_id in (select id from public.expenses where group_id in (select group_id from public.group_members where user_id = auth.uid())));
create policy "splits_insert" on public.expense_splits for insert
  with check (expense_id in (select id from public.expenses where group_id in (select group_id from public.group_members where user_id = auth.uid())));
create policy "splits_update" on public.expense_splits for update
  using (expense_id in (select id from public.expenses where group_id in (select group_id from public.group_members where user_id = auth.uid())));
