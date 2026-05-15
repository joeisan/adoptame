import { getCurrentUser } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type HomeBanner = Database["public"]["Tables"]["home_banners"]["Row"];

export async function requireSuperAdmin() {
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

export function normalizeOptionalText(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized.length ? normalized : null;
}

export function normalizeDisplayOrder(value: FormDataEntryValue | null) {
  const parsed = Number.parseInt(String(value ?? "0"), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function uploadBannerImage(file: File, pathPrefix: string) {
  const admin = createAdminClient();
  if (!admin) {
    return { error: "Cliente administrativo no disponible." } as const;
  }

  const fileExt = file.name.split(".").pop() ?? "webp";
  const fileName = `${pathPrefix}/${crypto.randomUUID()}.${fileExt}`;
  const { data: uploadData, error: uploadError } = await admin.storage.from("site_assets").upload(fileName, file);

  if (uploadError) {
    console.error("Error uploading banner image:", uploadError);
    return { error: `Error subiendo la imagen: ${uploadError.message}` } as const;
  }

  const { data: publicUrlData } = admin.storage.from("site_assets").getPublicUrl(uploadData.path);
  return { publicUrl: publicUrlData.publicUrl } as const;
}

export async function getBanners(onlyActive = false): Promise<HomeBanner[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase.from("home_banners").select("*").order("display_order", { ascending: true }).order("created_at", { ascending: false });
  if (onlyActive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching banners:", error);
    return [];
  }

  return data ?? [];
}
