"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";

export async function createReportAction(formData: FormData) {
  const { user } = await getCurrentUser();
  const supabase = await createClient();

  if (!user || !supabase) {
    return { error: "Debes iniciar sesión para reportar." };
  }

  const listingId = formData.get("listingId") as string;
  const reason = formData.get("reason") as string;
  const description = formData.get("description") as string;

  if (!listingId || !reason) {
    return { error: "Motivo y ID de publicación requeridos." };
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    reported_listing_id: listingId,
    report_type: "listing", // Adjust if enum is different
    reason,
    description,
    status: "open"
  });

  if (error) {
    console.error("Report error:", error);
    return { error: "Error al enviar el reporte. Intenta de nuevo." };
  }

  revalidatePath("/super-admin/reports");
  return { success: true };
}
