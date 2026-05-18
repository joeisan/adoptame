import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== "adoptameRestoreKey2026") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "No se pudo crear el cliente administrador" }, { status: 500 });
  }

  try {
    // 1. Obtener todos los usuarios de Supabase Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json({ error: "Error al obtener usuarios: " + listError.message }, { status: 500 });
    }

    const log: string[] = [];
    let updatedCount = 0;

    for (const user of users) {
      const phone = user.user_metadata?.phone;
      const whatsapp = user.user_metadata?.whatsapp;

      if (phone || whatsapp) {
        log.push(`Usuario: ${user.email} (ID: ${user.id})`);
        if (phone) log.push(`  - Teléfono en metadata: ${phone}`);
        if (whatsapp) log.push(`  - WhatsApp en metadata: ${whatsapp}`);

        // Obtener perfil actual
        const { data: profile, error: fetchError } = await supabase
          .from("profiles")
          .select("phone, whatsapp")
          .eq("id", user.id)
          .maybeSingle();

        if (fetchError) {
          log.push(`  Error al obtener perfil: ${fetchError.message}`);
          continue;
        }

        const updates: any = {};
        if (phone && (!profile?.phone || profile.phone.trim() === "")) {
          updates.phone = phone.trim();
        }
        if (whatsapp && (!profile?.whatsapp || profile.whatsapp.trim() === "")) {
          updates.whatsapp = whatsapp.trim();
        } else if (phone && (!profile?.whatsapp || profile.whatsapp.trim() === "")) {
          updates.whatsapp = phone.trim();
        }

        if (Object.keys(updates).length > 0) {
          log.push(`  -> Actualizando: ${JSON.stringify(updates)}`);
          const { error: updateError } = await supabase
            .from("profiles")
            .upsert({
              id: user.id,
              email: user.email,
              ...updates
            });

          if (updateError) {
            log.push(`  Error al actualizar: ${updateError.message}`);
          } else {
            log.push(`  [ÉXITO] Perfil de ${user.email} restaurado.`);
            updatedCount++;
          }
        } else {
          log.push(`  [OK] Ya estaba actualizado.`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Proceso completado. Se actualizaron ${updatedCount} perfiles.`,
      log
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
