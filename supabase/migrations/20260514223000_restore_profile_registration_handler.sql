-- Restore the registration/profile sync path after an old migration
-- may have replaced the auth trigger function with stale logic.
--
-- Goals:
-- 1. Ensure the profile columns expected by the current app exist.
-- 2. Backfill only missing profile data from auth.users metadata.
-- 3. Recreate handle_new_user() with conservative upsert behavior.
-- 4. Rebind the auth trigger to the restored function.

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists whatsapp text;
alter table public.profiles add column if not exists organization_name text;
alter table public.profiles add column if not exists organization_type text;
alter table public.profiles add column if not exists slug text unique;

update public.profiles p
set
  full_name = coalesce(
    p.full_name,
    nullif(u.raw_user_meta_data ->> 'full_name', '')
  ),
  display_name = coalesce(
    p.display_name,
    nullif(u.raw_user_meta_data ->> 'full_name', ''),
    split_part(u.email, '@', 1)
  ),
  email = coalesce(
    p.email,
    u.email
  ),
  phone = coalesce(
    p.phone,
    nullif(u.raw_user_meta_data ->> 'phone', '')
  ),
  whatsapp = coalesce(
    p.whatsapp,
    nullif(u.raw_user_meta_data ->> 'whatsapp', ''),
    nullif(u.raw_user_meta_data ->> 'phone', '')
  ),
  organization_name = coalesce(
    p.organization_name,
    nullif(u.raw_user_meta_data ->> 'organization_name', '')
  ),
  organization_type = coalesce(
    p.organization_type,
    nullif(u.raw_user_meta_data ->> 'organization_type', '')
  ),
  slug = coalesce(
    p.slug,
    lower(
      regexp_replace(
        coalesce(
          nullif(u.raw_user_meta_data ->> 'full_name', ''),
          split_part(u.email, '@', 1)
        ),
        '[^a-zA-Z0-9]+',
        '-',
        'g'
      )
    ) || '-' || substring(p.id::text from 1 for 8)
  )
from auth.users u
where p.id = u.id;

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
  base_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    split_part(new.email, '@', 1)
  );

  final_slug := lower(
    regexp_replace(base_name, '[^a-zA-Z0-9]+', '-', 'g')
  ) || '-' || substring(new.id::text from 1 for 8);

  insert into public.profiles (
    id,
    full_name,
    display_name,
    slug,
    email,
    phone,
    whatsapp,
    organization_name,
    organization_type
  )
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    base_name,
    final_slug,
    new.email,
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'whatsapp', ''),
      nullif(new.raw_user_meta_data ->> 'phone', '')
    ),
    nullif(new.raw_user_meta_data ->> 'organization_name', ''),
    nullif(new.raw_user_meta_data ->> 'organization_type', '')
  )
  on conflict (id) do update set
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    display_name = coalesce(public.profiles.display_name, excluded.display_name),
    slug = coalesce(public.profiles.slug, excluded.slug),
    email = coalesce(public.profiles.email, excluded.email),
    phone = coalesce(public.profiles.phone, excluded.phone),
    whatsapp = coalesce(public.profiles.whatsapp, excluded.whatsapp),
    organization_name = coalesce(public.profiles.organization_name, excluded.organization_name),
    organization_type = coalesce(public.profiles.organization_type, excluded.organization_type);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
