create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  hero_title text,
  hero_subtitle text,
  hero_image_url text,
  updated_at timestamptz default now()
);

create unique index if not exists site_settings_single_row on public.site_settings ((true));

create table if not exists public.home_banners (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  link_url text,
  title text,
  is_active boolean default true,
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.home_banners add column if not exists title text;

drop policy if exists "Allow public read-access on site_settings" on public.site_settings;
drop policy if exists "Allow admin to insert site_settings" on public.site_settings;
drop policy if exists "Allow admin to update site_settings" on public.site_settings;
drop policy if exists "site_settings public read" on public.site_settings;
drop policy if exists "site_settings super admin all" on public.site_settings;

drop policy if exists "Allow public read-access on home_banners" on public.home_banners;
drop policy if exists "Allow admin to insert home_banners" on public.home_banners;
drop policy if exists "Allow admin to update home_banners" on public.home_banners;
drop policy if exists "Allow admin to delete home_banners" on public.home_banners;
drop policy if exists "home_banners public read active" on public.home_banners;
drop policy if exists "home_banners super admin all" on public.home_banners;

drop policy if exists "Public Access site_assets" on storage.objects;
drop policy if exists "Admin Insert site_assets" on storage.objects;
drop policy if exists "Admin Update site_assets" on storage.objects;
drop policy if exists "Admin Delete site_assets" on storage.objects;
drop policy if exists "site_assets public read" on storage.objects;
drop policy if exists "site_assets super admin insert" on storage.objects;
drop policy if exists "site_assets super admin update" on storage.objects;
drop policy if exists "site_assets super admin delete" on storage.objects;

drop trigger if exists update_site_settings_modtime on public.site_settings;
drop trigger if exists update_home_banners_modtime on public.home_banners;
drop trigger if exists site_settings_touch_updated_at on public.site_settings;
drop trigger if exists home_banners_touch_updated_at on public.home_banners;

create trigger site_settings_touch_updated_at
before update on public.site_settings
for each row execute function public.touch_updated_at();

alter table public.site_settings enable row level security;

create policy "site_settings public read"
  on public.site_settings for select
  using (true);

create policy "site_settings super admin all"
  on public.site_settings for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

create trigger home_banners_touch_updated_at
before update on public.home_banners
for each row execute function public.touch_updated_at();

alter table public.home_banners enable row level security;

create policy "home_banners public read active"
  on public.home_banners for select
  using (is_active = true or public.is_super_admin());

create policy "home_banners super admin all"
  on public.home_banners for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

insert into storage.buckets (id, name, public)
values ('site_assets', 'site_assets', true)
on conflict (id) do nothing;

create policy "site_assets public read"
  on storage.objects for select
  using (bucket_id = 'site_assets');

create policy "site_assets super admin insert"
  on storage.objects for insert
  with check (bucket_id = 'site_assets' and public.is_super_admin());

create policy "site_assets super admin update"
  on storage.objects for update
  using (bucket_id = 'site_assets' and public.is_super_admin());

create policy "site_assets super admin delete"
  on storage.objects for delete
  using (bucket_id = 'site_assets' and public.is_super_admin());
