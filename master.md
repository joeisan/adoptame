# Especificación para Codex: Plataforma de adopción de animales en Panamá

## Objetivo
Crear una plataforma web moderna para Panamá donde las personas puedan:

- Ver animales disponibles para adopción sin registrarse.
- Consultar detalles públicos de cada animal.
- Registrarse/iniciar sesión para desbloquear datos de contacto del publicante.
- Publicar animales en adopción.
- Gestionar sus propias publicaciones.
- Permitir a asociaciones u organizaciones publicar más animales según un límite configurable por el super admin.
- Permitir que el super admin administre usuarios, publicaciones, reportes, verificaciones, baneos y métricas.

El proyecto iniciará en local, luego se subirá a GitHub y se desplegará en Vercel usando Supabase como backend principal.

---

## Contexto visual local para Codex

Antes de implementar la interfaz, inspecciona estos recursos locales si existen:

```txt
./references/
./references/capturas/
./references/screenshots/
./references/videos/
./assets/reference/
./public/reference/
```

Usa las capturas y videos como referencia visual para:

- La imagen/ilustración del hero en la página de inicio.
- Estilo general: colores, composición, espaciado, formas, tarjetas, sombras, botones y tono visual.
- Comportamiento de carruseles, cards, navegación y secciones principales.

No copies assets privados fuera del proyecto. Si un asset debe usarse directamente, colócalo en `public/` con nombres limpios y optimizados. Si solo sirve como inspiración, crea una versión propia usando componentes y estilos del proyecto.

---

## Stack recomendado

Usar tecnologías actuales, mantenibles y compatibles con Vercel/Supabase:

- Next.js con App Router.
- TypeScript estricto.
- React actual.
- Tailwind CSS v4.
- shadcn/ui para componentes accesibles y consistentes.
- Lucide React para iconos.
- Supabase:
  - Auth.
  - Postgres.
  - Row Level Security.
  - Storage para imágenes de mascotas y avatars.
  - Migrations con Supabase CLI.
- React Hook Form + Zod para formularios y validación.
- Recharts para gráficos del dashboard super admin.
- TanStack Table para tablas administrativas.
- Sonner o sistema de toast equivalente.
- next/image para imágenes optimizadas.
- Server Components por defecto y Client Components solo cuando haya interactividad.
- Server Actions o Route Handlers para mutaciones según convenga.

No usar datos mock como solución final. Se pueden usar seeds locales para desarrollo, pero la app debe quedar conectada a Supabase.

---

## Nombre temporal del proyecto

Usar un nombre temporal editable:

```txt
Adopta Panamá
```

El código debe permitir cambiar nombre, logo, colores y copy fácilmente desde constantes o configuración.

---

## Comandos iniciales sugeridos

Si no existe el proyecto, inicializarlo así:

```bash
npx create-next-app@latest adopta-panama --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd adopta-panama
```

Instalar dependencias sugeridas:

```bash
npm install @supabase/supabase-js @supabase/ssr zod react-hook-form @hookform/resolvers lucide-react recharts @tanstack/react-table sonner clsx tailwind-merge next-themes
npx shadcn@latest init
```

Agregar componentes shadcn necesarios:

```bash
npx shadcn@latest add button card badge input textarea select tabs table dialog dropdown-menu avatar sheet separator skeleton form alert tooltip carousel popover calendar
```

---

## Variables de entorno

Crear `.env.example`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Reglas:

- Nunca exponer `SUPABASE_SERVICE_ROLE_KEY` en cliente.
- Usar `NEXT_PUBLIC_` solo para datos seguros que puedan llegar al navegador.
- Todas las operaciones administrativas sensibles deben validarse en servidor y con RLS/RBAC.

---

## Estructura de rutas esperada

```txt
src/
  app/
    (public)/
      page.tsx                       # Inicio
      explore/page.tsx               # Explorar mascotas
      pets/[slug]/page.tsx           # Detalle público de mascota
      categories/[slug]/page.tsx     # Categoría específica
      about/page.tsx                 # Opcional
    (auth)/
      login/page.tsx
      register/page.tsx
      forgot-password/page.tsx
    (dashboard)/
      dashboard/page.tsx             # Dashboard usuario
      dashboard/listings/page.tsx
      dashboard/listings/new/page.tsx
      dashboard/listings/[id]/edit/page.tsx
      dashboard/profile/page.tsx
      dashboard/organization/page.tsx
    (admin)/
      super-admin/page.tsx
      super-admin/users/page.tsx
      super-admin/listings/page.tsx
      super-admin/reports/page.tsx
      super-admin/organizations/page.tsx
      super-admin/settings/page.tsx
    api/
      webhooks/route.ts              # Si luego se necesita
    layout.tsx
    globals.css
    robots.ts
    sitemap.ts
  components/
    layout/
    home/
    pets/
    categories/
    auth/
    dashboard/
    admin/
    ui/
  lib/
    supabase/
      client.ts
      server.ts
      middleware.ts
      admin.ts
    validations/
    utils.ts
    constants.ts
    permissions.ts
  server/
    actions/
    queries/
  types/
    database.ts
    app.ts
```

---

## Diseño general

### Principios UI

- Mobile-first.
- Diseño cálido, confiable y moderno.
- Accesible: buen contraste, foco visible, labels, textos alternativos.
- Estilo recomendado: cards redondeadas, sombras suaves, fondos claros, gradientes sutiles, microinteracciones discretas.
- Paleta sugerida:
  - Primario: verde/teal cálido o naranja suave.
  - Secundario: crema/beige claro.
  - Acentos: coral o amarillo suave.
  - Neutros: slate/zinc.
- Debe verse profesional, no infantil.
- Usar componentes reutilizables.

### Navegación pública

Header con:

- Logo/nombre.
- Inicio.
- Explorar.
- Categorías.
- Publicar.
- Iniciar sesión.
- Registrarse.

En móvil usar menú tipo sheet.

### Footer

Incluir:

- Logo/nombre.
- Texto corto de misión.
- Enlaces: Explorar, Publicar, Registro, Contacto, Privacidad, Términos.
- Nota: “Plataforma enfocada en Panamá”.

---

## Página de inicio

Ruta: `/`

Debe tener estas secciones en orden:

### 1. Hero

Layout:

- Texto a la izquierda.
- Imagen/ilustración a la derecha.
- En móvil: texto arriba, imagen abajo.

Contenido sugerido:

```txt
Encuentra un nuevo hogar para quienes más lo necesitan.
Adopta Panamá conecta personas, rescatistas y organizaciones con animales en adopción en todo Panamá.
```

Botones:

- “Buscar mascotas” → `/explore`
- “Publicar en adopción” → `/register` si no está logueado, o `/dashboard/listings/new` si está logueado.

La imagen del hero debe inspirarse en las capturas locales. Si hay una imagen exacta indicada por las capturas, usarla desde `public/`.

### 2. Últimas mascotas subidas

Mostrar cards de las últimas mascotas activas/publicadas.

Orden:

```txt
published_at DESC NULLS LAST, created_at DESC
```

Contenido de cada card:

- Imagen principal.
- Nombre.
- Categoría/especie.
- Edad aproximada.
- Sexo.
- Provincia/distrito.
- Badge de estado: “Disponible”, “En proceso”, “Adoptado”.
- Badge “Verificado” si el publicante es organización verificada.
- Botón “Ver detalles”.

CTA inferior:

- “Ver todas las mascotas” → `/explore`

### 3. Carrusel de categorías con contador

Carrusel horizontal con categorías de animales y counter de publicaciones activas.

Categorías iniciales:

- Perros.
- Gatos.
- Conejos.
- Aves.
- Reptiles.
- Roedores.
- Peces.
- Otros.

Cada item:

- Icono o imagen.
- Nombre de categoría.
- Counter: `N disponibles`.
- Click → `/categories/[slug]` o `/explore?category=slug`.

### 4. Sección CTA final

Texto sugerido:

```txt
¿Listo para cambiar una vida?
Explora animales que buscan familia o publica una mascota que necesita un hogar responsable.
```

Botones:

- “Buscar” → `/explore`
- “Publicar / Registrarme” → `/register`

---

## Página Explorar

Ruta: `/explore`

Esta página es obligatoria y debe funcionar como el catálogo principal de listings de mascotas en adopción.

Funcionalidad:

- Mostrar los listings de mascotas activas/publicadas.
- El orden inicial por defecto debe ser por fecha, mostrando primero las publicaciones más recientes.
- Orden SQL recomendado:

```txt
published_at DESC NULLS LAST, created_at DESC
```

- Debe tener paginación o infinite load.
- Debe tener filtros visibles y fáciles de usar, especialmente en desktop; en móvil pueden abrirse en un sheet/drawer.
- Filtros requeridos:
  - Categoría/tipo de animal: perros, gatos, conejos, aves, reptiles, roedores, peces, otros.
  - Provincia.
  - Distrito.
  - Sexo.
  - Edad aproximada.
  - Tamaño.
  - Estado de adopción.
  - Organización verificada.
  - Búsqueda por texto: nombre, raza, especie, descripción o ubicación.
- Ordenamientos disponibles para el usuario:
  - Más recientes, default.
  - Más antiguos.
  - Nombre A-Z.
  - Nombre Z-A.
- Los filtros deben sincronizarse con query params en la URL para poder compartir búsquedas.
- Debe incluir botón para limpiar filtros.
- Debe mostrar contador de resultados encontrados.
- Debe mantener el orden por fecha mientras se aplican filtros, salvo que el usuario seleccione otro orden.
- Empty state amigable cuando no haya resultados.
- Skeletons durante carga.
- Las cards de listings deben ser consistentes con la sección de “Últimas mascotas subidas” del home.

---

## Página Detalle de mascota

Ruta: `/pets/[slug]`

Visible para usuarios no registrados:

- Galería de imágenes.
- Nombre.
- Categoría/especie.
- Raza opcional.
- Edad aproximada.
- Sexo.
- Tamaño.
- Provincia, distrito y sector aproximado.
- Descripción.
- Historia / notas de salud.
- Requisitos de adopción.
- Estado.
- Publicante con nombre público y badge verificado si aplica.

No visible para usuarios no registrados:

- Teléfono.
- WhatsApp.
- Email.
- Dirección exacta.
- Cualquier dato sensible de contacto.

Para guests mostrar bloque bloqueado:

```txt
Inicia sesión o regístrate para ver los datos de contacto del publicante.
```

Botones:

- “Iniciar sesión” → `/login?redirect=/pets/[slug]`
- “Registrarme” → `/register?redirect=/pets/[slug]`

Para usuarios autenticados:

- Mostrar datos de contacto del publicante.
- Botón WhatsApp si hay número válido de Panamá.
- Botón email si existe.
- Botón reportar publicación.

---

## Publicación de mascotas

Ruta: `/dashboard/listings/new`

Solo usuarios autenticados.

Campos:

- Nombre de mascota.
- Categoría.
- Especie/raza opcional.
- Edad aproximada.
- Unidad edad: meses/años/desconocida.
- Sexo: macho/hembra/desconocido.
- Tamaño: pequeño/mediano/grande/desconocido.
- Provincia.
- Distrito.
- Corregimiento/sector opcional.
- Descripción.
- Historia/notas.
- Salud/vacunas/esterilización opcional.
- Requisitos de adopción.
- Contacto preferido: WhatsApp, teléfono, email.
- Teléfono Panamá con validación básica `+507`.
- Imágenes: mínimo 1, máximo configurable, por defecto 6.

Reglas:

- Usuario regular: máximo 10 publicaciones activas/en adopción.
- Organización/asociación: límite configurable por super admin.
- No permitir crear publicación si el usuario está baneado.
- No permitir exceder límite.
- Las publicaciones nuevas deben tener estado inicial `published` o `pending_review` según configuración. Para MVP usar `published`, pero dejar preparado setting para moderación.
- Permitir editar y marcar como adoptado.

---

## Roles y permisos

Roles iniciales:

```ts
type UserRole = "user" | "organization" | "moderator" | "super_admin";
```

### Guest

Puede:

- Ver inicio.
- Ver explore.
- Ver detalle público de mascotas.

No puede:

- Ver datos de contacto.
- Publicar mascotas.
- Reportar.

### User regular

Puede:

- Ver contactos.
- Publicar hasta 10 mascotas activas.
- Editar/eliminar sus publicaciones.
- Marcar mascotas como adoptadas.
- Reportar usuarios o publicaciones.

### Organization

Puede:

- Todo lo de user.
- Tener límite de publicaciones configurable.
- Mostrar perfil de organización.
- Recibir badge “Verificado” si el super admin lo activa.

### Super admin

Puede:

- Ver dashboard global.
- Gestionar usuarios.
- Cambiar roles.
- Activar/desactivar badge verificado para organizaciones.
- Configurar límite de publicaciones por organización.
- Banear usuarios por un tiempo definido o permanentemente.
- Eliminar o suspender usuarios.
- Moderar publicaciones.
- Ver y resolver reportes.
- Ver métricas y gráficos.

---

## Dashboard de usuario

Ruta base: `/dashboard`

Secciones:

- Resumen:
  - Publicaciones activas.
  - Publicaciones adoptadas.
  - Límite usado: `X / 10` o `X / límite organización`.
- Mis publicaciones.
- Crear nueva publicación.
- Perfil y datos de contacto.
- Solicitud de rol organización, opcional:
  - Nombre organización.
  - Descripción.
  - Sitio/redes.
  - Documentación opcional.

---

## Dashboard super admin

Ruta base: `/super-admin`

Debe estar protegido. Solo usuarios con rol `super_admin`.

### Vista principal

Cards KPI:

- Total usuarios.
- Usuarios nuevos últimos 7/30 días.
- Total publicaciones.
- Publicaciones activas.
- Publicaciones adoptadas.
- Total organizaciones.
- Organizaciones verificadas.
- Reportes abiertos.
- Usuarios baneados activos.

Gráficos con Recharts:

- Usuarios registrados por día/semana/mes.
- Publicaciones por categoría.
- Publicaciones por provincia.
- Estados de publicaciones: disponible/en proceso/adoptado/suspendido.
- Reportes por estado.
- Top organizaciones por publicaciones activas.

### Pestaña Usuarios

Tabla con:

- Nombre.
- Email.
- Rol.
- Estado: activo/baneado/eliminado.
- Fecha registro.
- Cantidad de publicaciones.
- Cantidad de reportes recibidos.
- Acciones.

Acciones:

- Ver perfil.
- Cambiar rol.
- Banear temporalmente:
  - 24 horas.
  - 7 días.
  - 30 días.
  - Fecha personalizada.
- Ban permanente.
- Quitar ban.
- Eliminar usuario con confirmación.
- Marcar como organización.
- Configurar límite de publicaciones.
- Activar/desactivar badge verificado.

### Pestaña Publicaciones

Tabla con:

- Mascota.
- Publicante.
- Categoría.
- Provincia.
- Estado.
- Fecha creación.
- Reportes asociados.

Acciones:

- Ver.
- Suspender.
- Reactivar.
- Marcar como adoptado.
- Eliminar.

### Pestaña Reportes

Reportes de usuarios o publicaciones.

Campos:

- Tipo: usuario/listing.
- Reportado por.
- Entidad reportada.
- Motivo.
- Descripción.
- Estado: abierto/en revisión/resuelto/rechazado.
- Fecha.

Acciones:

- Revisar.
- Cambiar estado.
- Añadir nota interna.
- Banear usuario relacionado.
- Suspender publicación relacionada.

### Pestaña Organizaciones

Tabla con:

- Nombre organización.
- Usuario dueño.
- Verificado sí/no.
- Límite publicaciones.
- Publicaciones activas.
- Estado.

Acciones:

- Verificar.
- Quitar verificación.
- Ajustar límite.
- Suspender.

### Pestaña Configuración

Settings mínimos:

- Límite por defecto usuarios regulares: 10.
- Máximo imágenes por publicación: 6.
- Moderación previa activada/desactivada.
- Email/contacto soporte.
- Categorías activas.

---

## Modelo de datos Supabase

Crear migraciones SQL en `supabase/migrations`.

### Enums sugeridos

```sql
create type public.user_role as enum ('user', 'organization', 'moderator', 'super_admin');
create type public.user_status as enum ('active', 'banned', 'deleted');
create type public.pet_status as enum ('draft', 'pending_review', 'published', 'in_process', 'adopted', 'suspended', 'deleted');
create type public.pet_sex as enum ('male', 'female', 'unknown');
create type public.pet_size as enum ('small', 'medium', 'large', 'unknown');
create type public.report_status as enum ('open', 'reviewing', 'resolved', 'rejected');
create type public.report_type as enum ('user', 'listing');
```

### Tabla profiles

```sql
create table public.profiles (
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
```

### Tabla organizations

```sql
create table public.organizations (
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
  listing_limit integer not null default 10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### Tabla categories

```sql
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  icon text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
```

Seeds iniciales:

```txt
perros, gatos, conejos, aves, reptiles, roedores, peces, otros
```

### Tabla pet_listings

```sql
create table public.pet_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text unique not null,
  species text,
  breed text,
  age_value integer,
  age_unit text check (age_unit in ('months', 'years', 'unknown')),
  sex public.pet_sex not null default 'unknown',
  size public.pet_size not null default 'unknown',
  province text not null,
  district text,
  sector text,
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
```

### Tabla pet_images

```sql
create table public.pet_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.pet_listings(id) on delete cascade,
  storage_path text not null,
  public_url text,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
```

### Tabla reports

```sql
create table public.reports (
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
  created_at timestamptz not null default now()
);
```

### Tabla admin_actions

```sql
create table public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id),
  target_user_id uuid references public.profiles(id),
  target_listing_id uuid references public.pet_listings(id),
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

### Tabla app_settings

```sql
create table public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);
```

Settings iniciales:

```sql
insert into public.app_settings (key, value) values
('regular_listing_limit', '10'::jsonb),
('max_images_per_listing', '6'::jsonb),
('require_review_before_publish', 'false'::jsonb);
```

---

## Funciones de permisos en SQL

Crear funciones auxiliares:

```sql
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
    and (
      status = 'banned'
      and (banned_until is null or banned_until > now())
    )
  );
$$;
```

---

## RLS esperado

Activar RLS en todas las tablas públicas sensibles.

Reglas principales:

### profiles

- Usuario autenticado puede leer perfiles públicos básicos.
- Usuario puede actualizar su propio perfil, excepto rol/status/baneo.
- Super admin puede leer y actualizar todos los perfiles.

### pet_listings

- Todos pueden leer publicaciones con `status in ('published', 'in_process', 'adopted')` y `deleted_at is null`.
- Solo usuarios autenticados no baneados pueden crear publicaciones.
- Usuario puede actualizar/eliminar sus propias publicaciones si no está baneado.
- Super admin puede actualizar/suspender/eliminar cualquiera.

### Datos de contacto

No confiar solo en frontend. Crear una vista o función RPC para detalle público que oculte contacto si `auth.uid()` es null.

Sugerencia:

- Query pública: retorna listing sin campos `contact_*`.
- Query autenticada: retorna listing con contacto.
- En componentes, separar claramente `getPublicPetListing` y `getAuthenticatedPetContact`.

### organizations

- Todos pueden leer organizaciones activas/verificadas.
- Owner puede actualizar datos básicos de su organización.
- Solo super admin puede cambiar `is_verified`, `listing_limit` y estado administrativo.

### reports

- Usuario autenticado puede crear reportes.
- Usuario puede ver sus propios reportes.
- Super admin puede ver y administrar todos.

### storage

Buckets sugeridos:

```txt
pet-images
avatars
organization-logos
```

Reglas:

- Imágenes de mascotas pueden ser públicas si no contienen datos sensibles.
- Solo dueño puede subir/editar/eliminar archivos dentro de su carpeta.
- Estructura de path:

```txt
pet-images/{user_id}/{listing_id}/{filename}
avatars/{user_id}/{filename}
organization-logos/{organization_id}/{filename}
```

---

## Límite de publicaciones

Implementar una función server-side para validar límite antes de crear publicación.

Reglas:

- Usuario regular: límite desde `app_settings.regular_listing_limit`, por defecto 10.
- Organización: límite desde `organizations.listing_limit`.
- Contar solo publicaciones activas/relevantes:

```txt
status in ('draft', 'pending_review', 'published', 'in_process') and deleted_at is null
```

No contar:

```txt
adopted, suspended, deleted
```

Si excede, mostrar error claro:

```txt
Has alcanzado tu límite de publicaciones activas. Marca alguna como adoptada o contacta al administrador.
```

---

## Panamá: localización

Usar datos de Panamá para ubicación.

Provincias/comarcas iniciales sugeridas:

```txt
Bocas del Toro
Coclé
Colón
Chiriquí
Darién
Herrera
Los Santos
Panamá
Panamá Oeste
Veraguas
Guna Yala
Emberá-Wounaan
Ngäbe-Buglé
Naso Tjër Di
```

Para MVP se puede manejar provincia/distrito como texto o constantes locales. Diseñar el modelo para poder normalizar luego con tablas `locations_provinces`, `locations_districts`, `locations_corregimientos`.

Teléfonos:

- Validar formato de Panamá con prefijo `+507`.
- Para WhatsApp generar URL segura:

```ts
https://wa.me/507XXXXXXXX
```

---

## Formularios y validación

Usar React Hook Form + Zod.

Validaciones mínimas:

- Nombre mascota: requerido, 2-80 caracteres.
- Descripción: requerida, 30-2000 caracteres.
- Categoría: requerida.
- Provincia: requerida.
- Teléfono/WhatsApp/email: al menos un método de contacto para publicar.
- Imágenes: mínimo 1.
- No permitir scripts o HTML peligroso en campos de texto.
- Slugs únicos generados desde nombre + sufijo corto si hay colisión.

---

## Componentes clave

Crear componentes reutilizables:

```txt
<HomeHero />
<LatestPetsSection />
<CategoryCarousel />
<HomeCTA />
<PetCard />
<PetGallery />
<ContactLock />
<ContactPanel />
<ListingForm />
<DashboardStatsCard />
<AdminKpiCard />
<AdminChartCard />
<UsersTable />
<ListingsTable />
<ReportsTable />
<RoleBadge />
<VerifiedBadge />
<BanUserDialog />
<ConfirmDeleteDialog />
```

---

## Estados de UI

Implementar:

- Loading skeletons.
- Empty states.
- Error states amigables.
- Toasts de éxito/error.
- Confirmaciones antes de borrar, suspender o banear.
- Not found para mascotas inexistentes.
- Unauthorized/forbidden para dashboards.

---

## Seguridad básica

- Proteger rutas con middleware y validación server-side.
- Nunca depender solo de ocultar botones en UI.
- RLS obligatorio.
- Service role solo en servidor.
- Validar rol de super admin en servidor para cada acción admin.
- Soft delete preferible para publicaciones y usuarios.
- Auditar acciones administrativas en `admin_actions`.
- Evitar exponer contacto a guests desde queries o props serializadas.
- Limitar tamaño/tipo de imágenes.
- Usar `alt` en imágenes.
- Sanitizar textos si se renderizan como HTML; preferir texto plano.

---

## SEO y rendimiento

Implementar:

- Metadata global.
- Metadata dinámica para detalle de mascota.
- Open Graph básico.
- `robots.ts`.
- `sitemap.ts` con rutas principales y mascotas publicadas.
- Imágenes con `next/image`.
- Lazy loading donde aplique.
- Server Components para queries públicas.
- Paginación para listados.
- Índices SQL para rendimiento.

Índices sugeridos:

```sql
create index pet_listings_status_created_idx on public.pet_listings (status, created_at desc);
create index pet_listings_category_idx on public.pet_listings (category_id);
create index pet_listings_owner_idx on public.pet_listings (owner_id);
create index pet_listings_province_idx on public.pet_listings (province);
create index reports_status_idx on public.reports (status, created_at desc);
create index profiles_role_status_idx on public.profiles (role, status);
```

---

## Seed de desarrollo

Crear seed con:

- Categorías.
- Usuarios demo:
  - user regular.
  - organización.
  - super admin.
- Mascotas demo en varias provincias.
- Reportes demo.

No incluir credenciales reales en el repo.

---

## Flujos principales a implementar

### Guest

1. Entra al home.
2. Ve hero, últimas mascotas, categorías y CTA.
3. Explora mascotas.
4. Abre detalle.
5. Intenta ver contacto.
6. Se le pide login/registro.

### Usuario regular

1. Se registra.
2. Completa perfil.
3. Publica mascota.
4. Puede ver sus publicaciones.
5. Puede editar, eliminar o marcar como adoptada.
6. No puede pasar de 10 publicaciones activas.

### Organización

1. Tiene rol `organization` asignado por super admin.
2. Puede publicar hasta el límite configurado.
3. Si está verificada, sus publicaciones muestran badge.

### Super admin

1. Entra a `/super-admin`.
2. Ve métricas.
3. Gestiona usuarios.
4. Banea usuarios por fecha definida.
5. Verifica organizaciones.
6. Cambia límites.
7. Revisa reportes.
8. Suspende publicaciones si aplica.

---

## Criterios de aceptación

El proyecto se considera listo para MVP local cuando:

- La app corre con `npm run dev` sin errores.
- El home tiene hero texto izquierda + imagen derecha.
- El home muestra últimas mascotas desde Supabase.
- El home tiene carrusel de categorías con contador real.
- El CTA tiene botones “Buscar” y “Publicar / Registrarme”.
- `/explore` lista y filtra mascotas.
- `/pets/[slug]` muestra detalle público.
- Guests no reciben ni ven datos de contacto.
- Usuarios autenticados sí pueden ver contacto.
- Registro/login funcionan con Supabase Auth.
- Usuario puede crear/editar/marcar adoptado sus mascotas.
- Usuario regular no puede pasar de 10 publicaciones activas.
- Organización puede tener límite configurable.
- Badge verificado aparece solo si super admin lo activa.
- Dashboard super admin muestra KPIs y gráficos.
- Super admin puede administrar usuarios, roles, bans, reportes, listings y organizaciones.
- RLS está activado y probado.
- No hay service role expuesto al cliente.
- Build pasa con `npm run build`.
- Lint pasa o los errores están justificados y documentados.

---

## Orden de implementación recomendado para Codex

1. Inspeccionar referencias visuales locales.
2. Crear/validar estructura Next.js.
3. Configurar Tailwind, shadcn, tema, layout, header y footer.
4. Configurar Supabase clients: browser, server y admin server-only.
5. Crear migraciones SQL, enums, tablas, índices, seeds y RLS.
6. Implementar Auth: login, registro, logout, sesión server-side.
7. Implementar home público.
8. Implementar explore y detalle de mascota con contacto bloqueado.
9. Implementar dashboard usuario y formulario de publicación.
10. Implementar límites de publicación.
11. Implementar reportes.
12. Implementar super admin dashboard con KPIs, gráficos y tablas.
13. Implementar acciones admin: roles, verificación, límites, bans, suspensiones.
14. Agregar SEO, sitemap, robots, metadata dinámica.
15. Revisar accesibilidad, responsive, estados vacíos y errores.
16. Ejecutar pruebas manuales y build.
17. Preparar README con setup local, Supabase y despliegue Vercel.

---

## Instrucciones de trabajo para Codex

- Antes de modificar, revisar el árbol de archivos existente.
- Si ya existen archivos, no sobrescribir sin integrar.
- Priorizar una implementación funcional y limpia sobre decoración excesiva.
- Crear commits lógicos si el entorno lo permite.
- Añadir comentarios solo cuando aporten claridad.
- Evitar hacks temporales.
- Mantener TypeScript estricto.
- Mantener componentes pequeños y reutilizables.
- Reportar al final:
  - Archivos creados/modificados.
  - Comandos ejecutados.
  - Variables necesarias.
  - Pendientes para producción.

---

## Prompt breve para ejecutar en Codex

Copia este bloque al iniciar la tarea en Codex:

```txt
Construye una plataforma web llamada “Adopta Panamá” para adopción de animales en Panamá usando Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui, Supabase Auth/Postgres/Storage/RLS, React Hook Form + Zod, Recharts y TanStack Table.

Primero inspecciona las carpetas locales ./references, ./references/capturas, ./references/screenshots, ./references/videos, ./assets/reference y ./public/reference para usar capturas/videos como referencia visual, especialmente para el hero de inicio con texto a la izquierda e imagen a la derecha.

Implementa: home con hero, últimas mascotas, carrusel de categorías con contador y CTA con botones Buscar -> /explore y Publicar/Registrarme -> /register; página /explore como catálogo principal mostrando listings por fecha inicialmente, con publicaciones más recientes primero, filtros por categoría, provincia, distrito, sexo, edad, tamaño, estado, organización verificada y búsqueda por texto, contador de resultados, botón limpiar filtros y query params compartibles; detalle público de mascota con contacto bloqueado para guests y desbloqueado solo para usuarios autenticados; registro/login; dashboard de usuario para publicar/gestionar mascotas; límite de 10 publicaciones activas para usuarios regulares; rol organization con límite configurable por super admin; badge Verificado para organizaciones; super admin dashboard protegido con KPIs, gráficos, usuarios, publicaciones, reportes, organizaciones, roles, bans temporales/permanentes, eliminación/suspensión y configuración.

Crea migraciones Supabase con tablas profiles, organizations, categories, pet_listings, pet_images, reports, admin_actions y app_settings. Activa RLS en tablas sensibles. No expongas SUPABASE_SERVICE_ROLE_KEY al cliente. Crea queries separadas para detalle público sin contacto y contacto autenticado. Agrega sitemap, robots, metadata, responsive design, estados loading/empty/error, validaciones Zod y README de setup local/Vercel/Supabase.

Termina cuando npm run build pase y documenta archivos modificados, comandos ejecutados y variables .env necesarias.
```

