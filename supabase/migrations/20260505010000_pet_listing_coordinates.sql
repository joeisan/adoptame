alter table public.pet_listings
add column if not exists latitude double precision,
add column if not exists longitude double precision;

create index if not exists pet_listings_location_idx
on public.pet_listings (latitude, longitude)
where latitude is not null and longitude is not null and deleted_at is null;
