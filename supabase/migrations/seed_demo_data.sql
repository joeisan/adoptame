-- Script para poblar la base de datos con datos reales de prueba
-- Esto habilitará Favoritos, el Mapa y el Panel de Administración con datos persistentes.

DO $$
DECLARE
    admin_id UUID;
    org_id UUID;
    perro_cat_id UUID;
    gato_cat_id UUID;
BEGIN
    -- 1. Obtener el ID del administrador (ajusta el email si es diferente)
    SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@adoptame.com' LIMIT 1;
    
    IF admin_id IS NULL THEN
        RAISE NOTICE 'No se encontró el usuario admin@adoptame.com. Asegúrate de estar registrado.';
        RETURN;
    END IF;

    -- 2. Insertar Categorías si no existen
    INSERT INTO public.categories (name, slug, is_active)
    VALUES 
        ('Perros', 'perros', true), 
        ('Gatos', 'gatos', true), 
        ('Otros', 'otros', true)
    ON CONFLICT (slug) DO UPDATE SET is_active = true;
    
    SELECT id INTO perro_cat_id FROM public.categories WHERE slug = 'perros';
    SELECT id INTO gato_cat_id FROM public.categories WHERE slug = 'gatos';

    -- 3. Insertar Organización de prueba
    INSERT INTO public.organizations (name, slug, owner_id, is_verified)
    VALUES ('Rescate Animal', 'rescate-animal', admin_id, true)
    ON CONFLICT (slug) DO UPDATE SET is_verified = true
    RETURNING id INTO org_id;

    -- 4. Insertar Mascotas de prueba
    -- Buddy
    INSERT INTO public.pet_listings (
        owner_id, slug, name, species, breed, age_value, age_unit, sex, size, 
        status, province, district, latitude, longitude, description, category_id, organization_id, badges, contact_name, contact_phone, contact_whatsapp, contact_email
    )
    VALUES 
    (admin_id, 'buddy-labrador', 'Buddy Real', 'Perro', 'Labrador', 2, 'years', 'male', 'large', 'published', 'Panamá', 'Bella Vista', 8.9833, -79.5167, 'Buddy es un perro real guardado en la base de datos.', perro_cat_id, org_id, ARRAY['Vacunado', 'Desparasitado'], 'Admin', '6000-0000', '6000-0000', 'admin@adoptame.com')
    ON CONFLICT (slug) DO NOTHING;

    -- Luna
    INSERT INTO public.pet_listings (
        owner_id, slug, name, species, breed, age_value, age_unit, sex, size, 
        status, province, district, latitude, longitude, description, category_id, organization_id, badges, contact_name, contact_phone, contact_whatsapp, contact_email
    )
    VALUES 
    (admin_id, 'luna-gatita-real', 'Luna Real', 'Gato', 'Común', 6, 'months', 'female', 'small', 'published', 'Chiriquí', 'David', 8.4333, -82.4333, 'Luna es una gatita real guardada en la base de datos.', gato_cat_id, null, ARRAY['Desparasitada', 'Cariñosa'], 'Admin', '6000-0000', '6000-0000', 'admin@adoptame.com')
    ON CONFLICT (slug) DO NOTHING;

    -- Max
    INSERT INTO public.pet_listings (
        owner_id, slug, name, species, breed, age_value, age_unit, sex, size, 
        status, province, district, latitude, longitude, description, category_id, organization_id, badges, contact_name, contact_phone, contact_whatsapp, contact_email
    )
    VALUES 
    (admin_id, 'max-golden-real', 'Max Real', 'Perro', 'Golden Retriever', 1, 'years', 'male', 'medium', 'published', 'Colón', 'Colón', 9.35, -79.9, 'Max es un perro real guardado en la base de datos.', perro_cat_id, org_id, ARRAY['Sano', 'Juguetón'], 'Admin', '6000-0000', '6000-0000', 'admin@adoptame.com')
    ON CONFLICT (slug) DO NOTHING;

    RAISE NOTICE 'Datos de prueba insertados correctamente.';
END $$;
