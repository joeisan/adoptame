-- Development-only seed. Create users through Supabase Auth, then replace owner_id values below.

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
('admin_contact_whatsapp', '"+507 6000-0000"'::jsonb),
('admin_contact_email', '"admin@adoptamepanama.local"'::jsonb),
('admin_contact_phone', '"+507 6000-0000"'::jsonb),
('social_instagram', '""'::jsonb),
('social_facebook', '""'::jsonb),
('social_tiktok', '""'::jsonb),
('social_youtube', '""'::jsonb),
('social_x', '""'::jsonb)
on conflict (key) do nothing;
