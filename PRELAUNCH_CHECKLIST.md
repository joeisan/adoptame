# Prelanzamiento de Adóptame Panamá

## Contenido real

- Reemplazar teléfonos, correos y redes desde `/super-admin/settings`.
- Eliminar o suspender publicaciones demo antes de compartir el sitio públicamente.
- Cargar al menos una publicación real por categoría activa que se quiera mostrar.
- Revisar que cada publicación tenga imagen principal, provincia, distrito, descripción y contacto.
- Confirmar que las organizaciones reales estén marcadas como verificadas desde super admin.

## Registro y Google

- En Supabase, activar `Authentication > Providers > Google`.
- Crear credenciales OAuth en Google Cloud para la app web.
- Agregar como redirect URI autorizado:
  - Local: `http://localhost:3000/auth/callback`
  - Producción: `https://TU-DOMINIO/auth/callback`
- En Supabase, agregar las mismas URLs en `Authentication > URL Configuration`.
- Flujo esperado:
  - Google crea/inicia sesión con email, nombre y avatar.
  - La app guarda esos datos básicos en `profiles`.
  - Si falta teléfono o WhatsApp, la app redirige a `/dashboard/profile?onboarding=1`.
  - El usuario no puede avanzar al dashboard operativo hasta completar nombre, teléfono y WhatsApp.

## Variables y dominio

- Configurar `NEXT_PUBLIC_SITE_URL` con el dominio final.
- Confirmar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y `SUPABASE_SERVICE_ROLE_KEY`.
- Actualizar en Supabase:
  - Site URL: `https://TU-DOMINIO`
  - Redirect URLs: `https://TU-DOMINIO/auth/callback`
- Después de conectar el dominio, probar login email, login Google, logout y recuperación de contraseña.

## Supabase y almacenamiento

- Confirmar buckets públicos:
  - `pet-images`
  - `avatars`
  - `organization-logos`
- Probar subida de imágenes desde una cuenta normal.
- Probar que un usuario no pueda editar publicaciones ajenas.
- Probar que super admin sí pueda moderar publicaciones y usuarios.

## Verificación mínima antes de publicar

- `npm run build` debe pasar.
- Revisar móvil: home, explorar, detalle de mascota, registro, perfil y publicar.
- Crear una publicación real desde una cuenta normal.
- Marcar una publicación como adoptada.
- Reportar una publicación desde otra cuenta y resolver el reporte desde super admin.
- Revisar footer: correo, teléfono y redes configuradas.
