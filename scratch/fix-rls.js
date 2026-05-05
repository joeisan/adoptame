const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixRLS() {
  console.log("Iniciando reparación de RLS...");
  
  const sql = `
    -- 1. Mejorar la función de super admin para evitar recursión
    -- Al usar un SELECT directo en una función SECURITY DEFINER, 
    -- evitamos que las políticas de la tabla se disparen de nuevo
    CREATE OR REPLACE FUNCTION public.is_super_admin()
    RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    DECLARE
      is_admin boolean;
    BEGIN
      SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'super_admin'
        AND status = 'active'
      ) INTO is_admin;
      RETURN is_admin;
    END;
    $$;

    -- 2. Asegurar que las políticas de perfiles no dependan recursivamente de sí mismas
    -- Permitir que los super admins vean perfiles basándose en una consulta que no use la función is_super_admin directamente en la política de SELECT de perfiles
    DROP POLICY IF EXISTS "profiles super admin all" ON public.profiles;
    CREATE POLICY "profiles super admin all" ON public.profiles
    FOR ALL TO authenticated
    USING (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
    );
  `;

  // Intentar ejecutar mediante rpc si existe un ejecutor de sql, 
  // o simplemente explicar al usuario que hemos detectado el fallo.
  // Como no tenemos un rpc genérico de SQL por defecto, vamos a intentar 
  // una aproximación diferente: actualizar el perfil del admin directamente
  // para asegurar que al menos su sesión sea válida.
  
  console.log("Nota: La reparación completa requiere permisos de SQL directos.");
  console.log("Voy a intentar restaurar los nombres en el código con un 'workaround' seguro.");
}

fixRLS();
