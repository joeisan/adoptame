import { createAdminClient } from "./src/lib/supabase/admin";

async function debug() {
  const supabase = createAdminClient();
  if (!supabase) {
    console.log("ERROR: No se pudo crear el cliente Admin. Revisa SUPABASE_SERVICE_ROLE_KEY");
    return;
  }

  const { data: profiles, error: pError } = await supabase.from("profiles").select("id, display_name, full_name");
  console.log("--- PERFILES ENCONTRADOS ---");
  console.log(JSON.stringify(profiles, null, 2));
  
  const { data: listings, error: lError } = await supabase.from("pet_listings").select("id, name, owner_id").limit(5);
  console.log("--- MUESTRA DE PUBLICACIONES ---");
  console.log(JSON.stringify(listings, null, 2));
}

debug();
