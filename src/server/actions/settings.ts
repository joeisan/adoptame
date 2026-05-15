import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];

async function requireSuperAdmin() {
  const { user, profile } = await getCurrentUser();

  if (!user || !profile || profile.role !== "super_admin" || profile.status !== "active") {
    return null;
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return null;
  }

  return { user, supabase };
}

function normalizeRequiredText(value: FormDataEntryValue | null, fieldLabel: string) {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    throw new Error(`${fieldLabel} es requerido.`);
  }

  return normalized;
}

async function uploadHeroImage(file: File) {
  const admin = createAdminClient();
  if (!admin) {
    return { error: "Cliente administrativo no disponible." } as const;
  }

  const fileExt = file.name.split(".").pop() ?? "webp";
  const fileName = `hero/${crypto.randomUUID()}.${fileExt}`;
  const { data: uploadData, error: uploadError } = await admin.storage.from("site_assets").upload(fileName, file);

  if (uploadError) {
    console.error("Error uploading hero image:", uploadError);
    return { error: `Error subiendo la imagen: ${uploadError.message}` } as const;
  }

  const { data: publicUrlData } = admin.storage.from("site_assets").getPublicUrl(uploadData.path);
  return { publicUrl: publicUrlData.publicUrl } as const;
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from("site_settings").select("*").maybeSingle();
  if (error) {
    console.error("Error fetching site settings:", error);
    return null;
  }

  return data;
}

export async function saveSiteSettings(formData: FormData) {
  const admin = await requireSuperAdmin();
  if (!admin) return { error: "No autorizado." };

  let heroTitle: string;
  let heroSubtitle: string;

  try {
    heroTitle = normalizeRequiredText(formData.get("hero_title"), "El título principal");
    heroSubtitle = normalizeRequiredText(formData.get("hero_subtitle"), "El subtítulo");
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Datos inválidos." };
  }

  let heroImageUrl = String(formData.get("hero_image_url") ?? "").trim();
  const imageFile = formData.get("hero_image_file");

  if (imageFile instanceof File && imageFile.size > 0) {
    const uploadResult = await uploadHeroImage(imageFile);
    if ("error" in uploadResult) {
      return uploadResult;
    }

    heroImageUrl = uploadResult.publicUrl;
  }

  const { data: existing, error: existingError } = await admin.supabase.from("site_settings").select("id").maybeSingle();
  if (existingError) {
    console.error("Error checking existing site settings:", existingError);
    return { error: existingError.message };
  }

  const payload: Database["public"]["Tables"]["site_settings"]["Update"] = {
    hero_title: heroTitle,
    hero_subtitle: heroSubtitle,
    hero_image_url: heroImageUrl || null
  };

  const { error } = existing
    ? await admin.supabase.from("site_settings").update(payload).eq("id", existing.id)
    : await admin.supabase.from("site_settings").insert(payload);

  if (error) {
    console.error("Error updating site settings:", error);
    return { error: error.message };
  }

  return { ok: true };
}
