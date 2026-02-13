-- Enable Realtime for chat and shopping lists
-- Run this in Supabase SQL Editor if Realtime isn't working

-- Enable Realtime publication (if not already enabled)
-- This is usually enabled by default, but we'll ensure tables are added

-- Add messages table to Realtime publication
do $$ 
begin 
  alter publication supabase_realtime add table public.messages; 
exception 
  when duplicate_object then 
    null; -- Table already in publication
  when undefined_object then
    -- Publication might not exist, create it
    create publication supabase_realtime;
    alter publication supabase_realtime add table public.messages;
end $$;

-- Add shopping_lists table to Realtime publication
do $$ 
begin 
  alter publication supabase_realtime add table public.shopping_lists; 
exception 
  when duplicate_object then 
    null;
end $$;

-- Add list_items table to Realtime publication
do $$ 
begin 
  alter publication supabase_realtime add table public.list_items; 
exception 
  when duplicate_object then 
    null;
end $$;

-- Verify tables are in publication
select 
  schemaname,
  tablename 
from pg_publication_tables 
where pubname = 'supabase_realtime' 
  and tablename in ('messages', 'shopping_lists', 'list_items');
