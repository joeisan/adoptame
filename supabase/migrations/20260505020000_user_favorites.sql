create table if not exists public.user_favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.pet_listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create index if not exists user_favorites_listing_idx on public.user_favorites (listing_id);
create index if not exists user_favorites_user_created_idx on public.user_favorites (user_id, created_at desc);

alter table public.user_favorites enable row level security;

drop policy if exists "favorites owner read" on public.user_favorites;
create policy "favorites owner read" on public.user_favorites
for select using (auth.uid() = user_id);

drop policy if exists "favorites owner insert" on public.user_favorites;
create policy "favorites owner insert" on public.user_favorites
for insert with check (auth.uid() = user_id and not public.is_banned());

drop policy if exists "favorites owner delete" on public.user_favorites;
create policy "favorites owner delete" on public.user_favorites
for delete using (auth.uid() = user_id and not public.is_banned());
