-- Favourites: user-saved KrisFlyer routes (origin + destination + cabin + tier + trip).
-- Stores the route SPEC only, never the miles — miles stay derived from
-- DESTINATIONS in the app so saved favourites auto-correct on rate updates.
-- Run this on the Supabase project before shipping the favourites feature.

create table if not exists public.favourites (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  origin       text not null default 'SIN',
  dest_city    text not null,
  dest_country text not null,
  cabin        text not null,   -- eco | premEco | biz | first
  tier         text not null,   -- saver | advantage | access
  trip         text not null default 'oneway',  -- oneway | return
  created_at   timestamptz not null default now(),
  unique (user_id, origin, dest_city, cabin, tier, trip)
);

create index if not exists favourites_user_id_idx on public.favourites (user_id);

alter table public.favourites enable row level security;

-- Each user can only see and mutate their own rows.
create policy "favourites_select_own"
  on public.favourites for select
  using (auth.uid() = user_id);

create policy "favourites_insert_own"
  on public.favourites for insert
  with check (auth.uid() = user_id);

create policy "favourites_delete_own"
  on public.favourites for delete
  using (auth.uid() = user_id);
