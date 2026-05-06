-- 1. Add slug to profiles
alter table public.profiles add column if not exists slug text unique;

-- Update existing profiles with a slug
update public.profiles 
set slug = lower(regexp_replace(coalesce(display_name, 'user'), '\s+', '-', 'g')) || '-' || substring(id::text from 1 for 8)
where slug is null;

-- Recreate handle_new_user to include slug
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_name text;
  final_slug text;
begin
  base_name := coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1));
  final_slug := lower(regexp_replace(base_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substring(new.id::text from 1 for 8);
  
  insert into public.profiles (id, full_name, display_name, slug)
  values (new.id, new.raw_user_meta_data ->> 'full_name', base_name, final_slug)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 2. Add contact info to organizations
alter table public.organizations add column if not exists phone text;
alter table public.organizations add column if not exists whatsapp text;
alter table public.organizations add column if not exists email text;

-- 3. Add badges to pet_listings
alter table public.pet_listings add column if not exists badges text[] not null default '{}'::text[];

-- 4. Add admin contact to app_settings
insert into public.app_settings (key, value) values
('admin_contact_whatsapp', '"+507 6000-0000"'::jsonb),
('admin_contact_email', '"admin@adoptamepanama.local"'::jsonb),
('admin_contact_phone', '"+507 6000-0000"'::jsonb),
('social_instagram', '""'::jsonb),
('social_facebook', '""'::jsonb),
('social_tiktok', '""'::jsonb),
('social_youtube', '""'::jsonb),
('social_x', '""'::jsonb)
on conflict (key) do nothing;
