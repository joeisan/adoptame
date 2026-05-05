# Adóptame Panamá

Plataforma web para adopción de animales en Panamá con Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui, Supabase Auth/Postgres/Storage/RLS, React Hook Form + Zod, Recharts y TanStack Table.

## Setup local

1. Instala dependencias:

```bash
npm install
```

2. Copia variables:

```bash
cp .env.example .env.local
```

3. Configura Supabase:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` solo se usa en archivos server-only. No debe exponerse al cliente.

4. Aplica migraciones:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

5. Ejecuta:

```bash
npm run dev
```

## Supabase

La migración principal está en `supabase/migrations/20260504230000_initial_schema.sql` e incluye:

- `profiles`, `organizations`, `categories`, `pet_listings`, `pet_images`, `reports`, `admin_actions`, `app_settings`.
- Enums para roles, estados, sexo, tamaño y reportes.
- RLS en tablas sensibles.
- Buckets públicos para `pet-images`, `avatars` y `organization-logos`.
- Políticas de Storage por carpeta del usuario.
- Seeds base de categorías y settings.

## Vercel

1. Importa el repo en Vercel.
2. Agrega las variables del `.env.example`.
3. Asegura `NEXT_PUBLIC_SITE_URL=https://tu-dominio`.
4. Deploy con:

```bash
npm run build
```

## Flujos incluidos

- Home con hero visual, últimas mascotas, categorías con contador y CTA.
- `/explore` con filtros por query params, contador, ordenamiento y paginación.
- `/pets/[slug]` con detalle público sin contacto y consulta autenticada separada para contacto.
- Registro/login con Supabase Auth.
- Dashboard de usuario para publicar y gestionar mascotas.
- Límite de publicaciones activas para usuarios regulares y organizaciones.
- Super admin protegido con KPIs, gráficos, tablas y acciones de moderación.
- `robots.ts`, `sitemap.ts`, metadata global y metadata dinámica de mascotas.

## Pendientes de producción

- Crear usuarios reales desde Supabase Auth y asignar el primer `super_admin` manualmente en `profiles`.
- Configurar SMTP de Supabase para recuperación de contraseña.
- Añadir pruebas end-to-end cuando haya credenciales de staging.
