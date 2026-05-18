import { ACTIVE_LISTING_STATUSES, SITE_CONFIG } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { ProfileSummary } from "@/types/app";

export async function getCurrentUser() {
  const supabase = await createClient();

  if (!supabase) {
    return { user: null, profile: null };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,full_name,display_name,slug,email,phone,whatsapp,role,status")
    .eq("id", user.id)
    .maybeSingle();
  const row = profile as unknown as
    | {
        id: string;
        full_name: string | null;
        display_name: string | null;
        slug: string | null;
        email: string | null;
        phone: string | null;
        whatsapp: string | null;
        role: ProfileSummary["role"];
        status: ProfileSummary["status"];
      }
    | null;

  return {
    user,
    profile: row
      ? ({
          id: row.id,
          fullName: row.full_name,
          displayName: row.display_name,
          slug: row.slug,
          email: row.email,
          phone: row.phone,
          whatsapp: row.whatsapp,
          role: row.role,
          status: row.status
        } satisfies ProfileSummary)
      : null
  };
}

export function isProfileComplete(profile: Pick<ProfileSummary, "displayName" | "fullName"> | null) {
  if (!profile) return false;
  return Boolean((profile.displayName || profile.fullName)?.trim());
}

export async function getListingLimit(userId: string) {
  const supabase = await createClient();

  if (!supabase) {
    return SITE_CONFIG.defaultListingLimit;
  }

  const { data: profileData } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  const profile = profileData as unknown as { role: ProfileSummary["role"] } | null;

  if (profile?.role === "super_admin") {
    return 999;
  }

  if (profile?.role === "organization") {
    const { data: organizationData } = await supabase
      .from("organizations")
      .select("listing_limit")
      .eq("owner_id", userId)
      .maybeSingle();
    const organization = organizationData as unknown as { listing_limit: number } | null;

    return organization?.listing_limit ?? SITE_CONFIG.defaultListingLimit;
  }

  const { data: settingData } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "regular_listing_limit")
    .maybeSingle();
  const setting = settingData as unknown as { value: unknown } | null;

  const value = typeof setting?.value === "number" ? setting.value : SITE_CONFIG.defaultListingLimit;
  return value;
}

export async function canCreateListing(userId: string) {
  const supabase = await createClient();
  const limit = await getListingLimit(userId);

  if (!supabase) {
    return { allowed: false, limit, activeCount: 0, message: "Configura Supabase para publicar mascotas." };
  }

  const { count } = await supabase
    .from("pet_listings")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", userId)
    .is("deleted_at", null)
    .in("status", ACTIVE_LISTING_STATUSES);

  const activeCount = count ?? 0;

  if (activeCount >= limit) {
    return {
      allowed: false,
      limit,
      activeCount,
      message: "Has alcanzado tu límite de publicaciones activas. Marca alguna como adoptada o contacta al administrador."
    };
  }

  return { allowed: true, limit, activeCount, message: null };
}
