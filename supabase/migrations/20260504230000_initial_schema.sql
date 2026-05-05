create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('user', 'organization', 'moderator', 'super_admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.user_status as enum ('active', 'banned', 'deleted');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.pet_status as enum ('draft', 'pending_review', 'published', 'in_process', 'adopted', 'suspended', 'deleted');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.pet_sex as enum ('male', 'female', 'unknown');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.pet_size as enum ('small', 'medium', 'large', 'unknown');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.report_status as enum ('open', 'reviewing', 'resolved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.report_type as enum ('user', 'listing');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  display_name text,
  avatar_url text,
  role public.user_role not null default 'user',
  status public.user_status not null default 'active',
  phone text,
  whatsapp text,
  province text,
  district text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  banned_until timestamptz,
  ban_reason text
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text unique not null,
  description text,
  website_url text,
  instagram_url text,
  facebook_url text,
  logo_url text,
  is_verified boolean not null default false,
  listing_limit integer not null default 10 check (listing_limit > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  icon text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.pet_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text unique not null,
  species text,
  breed text,
  age_value integer check (age_value is null or age_value >= 0),
  age_unit text check (age_unit in ('months', 'years', 'unknown')),
  sex public.pet_sex not null default 'unknown',
  size public.pet_size not null default 'unknown',
  province text not null,
  district text,
  sector text,
  latitude double precision,
  longitude double precision,
  description text not null,
  story text,
  health_notes text,
  adoption_requirements text,
  status public.pet_status not null default 'published',
  contact_name text,
  contact_phone text,
  contact_whatsapp text,
  contact_email text,
  view_count integer not null default 0,
  published_at timestamptz default now(),
  adopted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.pet_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.pet_listings(id) on delete cascade,
  storage_path text not null,
  public_url text,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  report_type public.report_type not null,
  reported_user_id uuid references public.profiles(id) on delete cascade,
  reported_listing_id uuid references public.pet_listings(id) on delete cascade,
  reason text not null,
  description text,
  status public.report_status not null default 'open',
  admin_notes text,
  resolved_by uuid references public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  constraint reports_target_required check (reported_user_id is not null or reported_listing_id is not null)
);

create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id),
  target_user_id uuid references public.profiles(id),
  target_listing_id uuid references public.pet_listings(id),
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

create table if not exists public.user_favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.pet_listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at before update on public.profiles for each row execute function public.touch_updated_at();

drop trigger if exists organizations_touch_updated_at on public.organizations;
create trigger organizations_touch_updated_at before update on public.organizations for each row execute function public.touch_updated_at();

drop trigger if exists pet_listings_touch_updated_at on public.pet_listings;
create trigger pet_listings_touch_updated_at before update on public.pet_listings for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, display_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name', coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'super_admin'
    and status = 'active'
  );
$$;

create or replace function public.is_banned()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and status = 'banned'
    and (banned_until is null or banned_until > now())
  );
$$;

create index if not exists pet_listings_status_created_idx on public.pet_listings (status, created_at desc);
create index if not exists pet_listings_published_idx on public.pet_listings (published_at desc nulls last, created_at desc);
create index if not exists pet_listings_category_idx on public.pet_listings (category_id);
create index if not exists pet_listings_owner_idx on public.pet_listings (owner_id);
create index if not exists pet_listings_province_idx on public.pet_listings (province);
create index if not exists pet_listings_location_idx on public.pet_listings (latitude, longitude) where latitude is not null and longitude is not null and deleted_at is null;
create index if not exists reports_status_idx on public.reports (status, created_at desc);
create index if not exists profiles_role_status_idx on public.profiles (role, status);
create index if not exists user_favorites_listing_idx on public.user_favorites (listing_id);
create index if not exists user_favorites_user_created_idx on public.user_favorites (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.categories enable row level security;
alter table public.pet_listings enable row level security;
alter table public.pet_images enable row level security;
alter table public.reports enable row level security;
alter table public.admin_actions enable row level security;
alter table public.app_settings enable row level security;
alter table public.user_favorites enable row level security;

drop policy if exists "profiles public read" on public.profiles;
create policy "profiles public read" on public.profiles
for select using (status <> 'deleted');

drop policy if exists "profiles owner update safe fields" on public.profiles;
create policy "profiles owner update safe fields" on public.profiles
for update using (auth.uid() = id and not public.is_banned())
with check (
  auth.uid() = id
  and role = (select role from public.profiles where id = auth.uid())
  and status = (select status from public.profiles where id = auth.uid())
);

drop policy if exists "profiles super admin all" on public.profiles;
create policy "profiles super admin all" on public.profiles
for all using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories
for select using (is_active = true or public.is_super_admin());

drop policy if exists "categories super admin all" on public.categories;
create policy "categories super admin all" on public.categories
for all using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "organizations public read" on public.organizations;
create policy "organizations public read" on public.organizations
for select using (true);

drop policy if exists "organizations owner update basic" on public.organizations;
create policy "organizations owner update basic" on public.organizations
for update using (owner_id = auth.uid() and not public.is_banned())
with check (
  owner_id = auth.uid()
  and is_verified = (select is_verified from public.organizations where id = organizations.id)
  and listing_limit = (select listing_limit from public.organizations where id = organizations.id)
);

drop policy if exists "organizations super admin all" on public.organizations;
create policy "organizations super admin all" on public.organizations
for all using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "pet listings public read" on public.pet_listings;
create policy "pet listings public read" on public.pet_listings
for select using (status in ('published', 'in_process', 'adopted') and deleted_at is null);

drop policy if exists "pet listings owner read" on public.pet_listings;
create policy "pet listings owner read" on public.pet_listings
for select using (owner_id = auth.uid());

drop policy if exists "pet listings authenticated insert" on public.pet_listings;
create policy "pet listings authenticated insert" on public.pet_listings
for insert with check (auth.uid() = owner_id and not public.is_banned());

drop policy if exists "pet listings owner update" on public.pet_listings;
create policy "pet listings owner update" on public.pet_listings
for update using (owner_id = auth.uid() and not public.is_banned())
with check (owner_id = auth.uid());

drop policy if exists "pet listings super admin all" on public.pet_listings;
create policy "pet listings super admin all" on public.pet_listings
for all using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "pet images public read" on public.pet_images;
create policy "pet images public read" on public.pet_images
for select using (
  exists (
    select 1 from public.pet_listings
    where pet_listings.id = pet_images.listing_id
    and pet_listings.status in ('published', 'in_process', 'adopted')
    and pet_listings.deleted_at is null
  )
);

drop policy if exists "pet images owner all" on public.pet_images;
create policy "pet images owner all" on public.pet_images
for all using (
  exists (
    select 1 from public.pet_listings
    where pet_listings.id = pet_images.listing_id
    and pet_listings.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.pet_listings
    where pet_listings.id = pet_images.listing_id
    and pet_listings.owner_id = auth.uid()
  )
);

drop policy if exists "reports owner insert" on public.reports;
create policy "reports owner insert" on public.reports
for insert with check (auth.uid() = reporter_id and not public.is_banned());

drop policy if exists "reports owner read" on public.reports;
create policy "reports owner read" on public.reports
for select using (reporter_id = auth.uid());

drop policy if exists "reports super admin all" on public.reports;
create policy "reports super admin all" on public.reports
for all using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "admin actions super admin read" on public.admin_actions;
create policy "admin actions super admin read" on public.admin_actions
for select using (public.is_super_admin());

drop policy if exists "admin actions super admin insert" on public.admin_actions;
create policy "admin actions super admin insert" on public.admin_actions
for insert with check (public.is_super_admin() and admin_id = auth.uid());

drop policy if exists "app settings public read" on public.app_settings;
create policy "app settings public read" on public.app_settings
for select using (true);

drop policy if exists "app settings super admin all" on public.app_settings;
create policy "app settings super admin all" on public.app_settings
for all using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "favorites owner read" on public.user_favorites;
create policy "favorites owner read" on public.user_favorites
for select using (auth.uid() = user_id);

drop policy if exists "favorites owner insert" on public.user_favorites;
create policy "favorites owner insert" on public.user_favorites
for insert with check (auth.uid() = user_id and not public.is_banned());

drop policy if exists "favorites owner delete" on public.user_favorites;
create policy "favorites owner delete" on public.user_favorites
for delete using (auth.uid() = user_id and not public.is_banned());

insert into public.categories (name, slug, icon, sort_order) values
('Perros', 'perros', 'dog', 1),
('Gatos', 'gatos', 'cat', 2),
('Conejos', 'conejos', 'rabbit', 3),
('Aves', 'aves', 'bird', 4),
('Reptiles', 'reptiles', 'shell', 5),
('Roedores', 'roedores', 'rat', 6),
('Peces', 'peces', 'fish', 7),
('Otros', 'otros', 'paw', 8)
on conflict (slug) do update set name = excluded.name, icon = excluded.icon, sort_order = excluded.sort_order;

insert into public.app_settings (key, value) values
('regular_listing_limit', '10'::jsonb),
('max_images_per_listing', '6'::jsonb),
('require_review_before_publish', 'false'::jsonb),
('support_email', '"soporte@adoptamepanama.local"'::jsonb)
on conflict (key) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
('pet-images', 'pet-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
('organization-logos', 'organization-logos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public;

drop policy if exists "pet images public storage read" on storage.objects;
create policy "pet images public storage read" on storage.objects
for select using (bucket_id in ('pet-images', 'avatars', 'organization-logos'));

drop policy if exists "pet images owner storage insert" on storage.objects;
create policy "pet images owner storage insert" on storage.objects
for insert with check (
  bucket_id = 'pet-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "pet images owner storage update" on storage.objects;
create policy "pet images owner storage update" on storage.objects
for update using (
  bucket_id = 'pet-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "pet images owner storage delete" on storage.objects;
create policy "pet images owner storage delete" on storage.objects
for delete using (
  bucket_id = 'pet-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);
