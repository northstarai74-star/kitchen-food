-- KITCHEN FOOD: one notebook (dishes, week plan, shopping list) per account.
-- Run once in the Supabase dashboard → SQL Editor.

create table if not exists public.notebooks (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.notebooks enable row level security;

-- Each signed-in user can only see and change their own notebook.
drop policy if exists "Read own notebook" on public.notebooks;
create policy "Read own notebook" on public.notebooks
  for select using (auth.uid() = user_id);

drop policy if exists "Create own notebook" on public.notebooks;
create policy "Create own notebook" on public.notebooks
  for insert with check (auth.uid() = user_id);

drop policy if exists "Update own notebook" on public.notebooks;
create policy "Update own notebook" on public.notebooks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
