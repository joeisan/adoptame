"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/permissions";

function safeRedirect(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.startsWith("/") ? value : null;
}

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidPhone(value: string) {
  return /^\+?(?:507)?[\s-]?\d{4}[\s-]?\d{4}$/.test(value);
}

export async function updateProfileAction(formData: FormData) {
  const { user } = await getCurrentUser();
  if (!user) return { error: "No autorizado." };

  const displayName = clean(formData.get("displayName"));
  const description = clean(formData.get("description"));
  const phone = clean(formData.get("phone"));
  const whatsapp = clean(formData.get("whatsapp"));
  const province = clean(formData.get("province"));
  const district = clean(formData.get("district"));
  const email = clean(formData.get("email"));
  const website = clean(formData.get("website"));
  const facebook = clean(formData.get("facebook"));
  const instagram = clean(formData.get("instagram"));
  const youtube = clean(formData.get("youtube"));
  const linkedin = clean(formData.get("linkedin"));
  const telegram = clean(formData.get("telegram"));
  const redirectTo = safeRedirect(formData.get("redirect"));

  if (displayName.length < 2) return { error: "Escribe un nombre a mostrar." };
  if (!isValidPhone(phone)) return { error: "Ingresa un teléfono válido de 8 dígitos." };
  if (!isValidPhone(whatsapp)) return { error: "Ingresa un WhatsApp válido de 8 dígitos." };

  const supabase = await createClient();
  if (!supabase) return { error: "Error de conexión." };

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName || null,
      description: description || null,
      phone: phone || null,
      whatsapp: whatsapp || null,
      province: province || null,
      district: district || null,
      email: email || null,
      website_url: website || null,
      facebook_url: facebook || null,
      instagram_url: instagram || null,
      youtube_url: youtube || null,
      linkedin_url: linkedin || null,
      telegram_url: telegram || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/perfil");

  if (redirectTo) {
    redirect(redirectTo);
  }

  return { success: true };
}
