-- Create budgets table
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

-- Create expenses table
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

-- Create expense_splits table
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

-- Budgets policies
create policy "budgets_select" on public.budgets for select
  using (group_id in (select group_id from public.group_members where user_id = auth.uid()));

create policy "budgets_insert" on public.budgets for insert
  with check (group_id in (select group_id from public.group_members where user_id = auth.uid()));

create policy "budgets_update" on public.budgets for update
  using (group_id in (select group_id from public.group_members where user_id = auth.uid()));

-- Expenses policies
create policy "expenses_select" on public.expenses for select
  using (group_id in (select group_id from public.group_members where user_id = auth.uid()));

create policy "expenses_insert" on public.expenses for insert
  with check (group_id in (select group_id from public.group_members where user_id = auth.uid()) and auth.uid() = paid_by);

create policy "expenses_update" on public.expenses for update
  using (auth.uid() = paid_by);

create policy "expenses_delete" on public.expenses for delete
  using (auth.uid() = paid_by);

-- Expense splits policies
create policy "splits_select" on public.expense_splits for select
  using (expense_id in (select id from public.expenses where group_id in (select group_id from public.group_members where user_id = auth.uid())));

create policy "splits_insert" on public.expense_splits for insert
  with check (expense_id in (select id from public.expenses where group_id in (select group_id from public.group_members where user_id = auth.uid())));

create policy "splits_update" on public.expense_splits for update
  using (expense_id in (select id from public.expenses where group_id in (select group_id from public.group_members where user_id = auth.uid())));
