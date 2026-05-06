-- 1. Añadir tipo de organización a ambas tablas
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Organización' CHECK (type IN ('Fundación', 'Organización', 'ONG'));

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS organization_type TEXT DEFAULT NULL CHECK (organization_type IN ('Fundación', 'Organización', 'ONG', NULL));

-- 2. Corregir publicaciones de admin@adoptame.com
UPDATE public.pet_listings
SET owner_id = '430abef5-236f-409f-9561-b1d64fde3ddb'
WHERE id IN ('d39fe867-2d52-4c0d-98ee-c533872070db', 'ddce917f-b71a-4396-b47f-8bab1d463d99');
