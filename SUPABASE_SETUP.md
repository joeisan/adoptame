# Vincular Adóptame Panamá con Supabase

Esta guía es para conectar la app local con un proyecto Supabase.

## 1. Crear proyecto

1. Entra a Supabase.
2. Crea un proyecto nuevo.
3. Espera a que termine de prepararse la base de datos.

## 2. Copiar las llaves

En el panel del proyecto busca la sección de API o Project Settings.

Necesitas estos datos:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

No pegues la `service_role` en código de cliente. Para probar la app local no hace falta compartirla.

## 3. Crear `.env.local`

En la raíz del proyecto crea un archivo llamado `.env.local` con:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=PEGA_AQUI_TU_PROJECT_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=PEGA_AQUI_TU_ANON_O_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=
```

Después reinicia el servidor local.

## 4. Crear tablas y permisos

En Supabase abre SQL Editor y ejecuta, en este orden, el contenido de estos archivos:

```txt
supabase/migrations/20260504230000_initial_schema.sql
supabase/migrations/20260505010000_pet_listing_coordinates.sql
supabase/migrations/20260505020000_user_favorites.sql
```

## 5. Crear el primer super admin

1. Regístrate en la app con tu email.
2. En Supabase abre Table Editor.
3. Abre la tabla `profiles`.
4. Busca tu usuario.
5. Cambia `role` a `super_admin`.
6. Confirma que `status` sea `active`.

Luego entra a:

```txt
http://localhost:3000/super-admin
```

## 6. Probar funciones

1. Regístrate o inicia sesión.
2. Publica una mascota desde `/dashboard/listings/new`.
3. Abre `/explore`.
4. Guarda una mascota como favorita.
5. Abre `/favorites`.
6. Si eres dueño de una publicación, entra al detalle y marca la mascota como adoptada.
