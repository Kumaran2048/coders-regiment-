-- Fix infinite recursion in group_members RLS policies
-- Run this in Supabase SQL Editor to replace the broken policies

-- Drop the problematic policies
drop policy if exists "group_members_select" on public.group_members;
drop policy if exists "group_members_update" on public.group_members;
drop policy if exists "group_members_delete" on public.group_members;
drop policy if exists "groups_select" on public.groups;

-- Create a security definer function to check membership without triggering RLS recursion
create or replace function public.is_group_member(group_uuid uuid, user_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 
    from public.group_members 
    where group_id = group_uuid 
    and user_id = user_uuid
  );
$$;

-- Fix groups_select: Allow if user created it OR is a member (using function to avoid recursion)
create policy "groups_select" on public.groups for select
  using (
    created_by = auth.uid()
    OR public.is_group_member(id, auth.uid())
  );

-- Fix group_members_select: 
-- Allow if viewing own membership OR user created the group OR user is a member
-- Uses the helper function to avoid recursion
create policy "group_members_select" on public.group_members for select
  using (
    -- User can see their own membership record
    user_id = auth.uid()
    -- OR user created the group (can see all members)
    OR group_id in (
      select id 
      from public.groups 
      where created_by = auth.uid()
    )
    -- OR user is a member (use helper function to avoid recursion)
    OR public.is_group_member(group_id, auth.uid())
  );

-- Fix group_members_update: Allow if updating own record OR user created the group
create policy "group_members_update" on public.group_members for update
  using (
    user_id = auth.uid()
    OR group_id in (
      select id 
      from public.groups 
      where created_by = auth.uid()
    )
  );

-- Fix group_members_delete: Allow if deleting own record OR user created the group
create policy "group_members_delete" on public.group_members for delete
  using (
    user_id = auth.uid()
    OR group_id in (
      select id 
      from public.groups 
      where created_by = auth.uid()
    )
  );
