import { ACTIVE_LISTING_STATUSES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { canCreateListing, getCurrentUser } from "@/lib/permissions";
import type { PetCardListing } from "@/types/app";
import { getAllListingsForAdmin, getUserListings } from "@/server/queries/listings";

export async function getDashboardSummary() {
  const { user, profile } = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const limitState = await canCreateListing(user.id);
  const isSuperAdmin = profile?.role === "super_admin";

  if (!supabase) {
    return {
      profile,
      active: 0,
      adopted: 0,
      limit: limitState.limit,
      activeCount: limitState.activeCount,
      listings: [] as PetCardListing[]
    };
  }

  let activeQuery = supabase
    .from("pet_listings")
    .select("id", { count: "exact", head: true })
    .is("deleted_at", null)
    .in("status", ACTIVE_LISTING_STATUSES);

  let adoptedQuery = supabase
    .from("pet_listings")
    .select("id", { count: "exact", head: true })
    .is("deleted_at", null)
    .eq("status", "adopted");

  if (!isSuperAdmin) {
    activeQuery = activeQuery.eq("owner_id", user.id);
    adoptedQuery = adoptedQuery.eq("owner_id", user.id);
  }

  const [
    { count: active },
    { count: adopted },
    userListings,
    { data: appSettings }
  ] = await Promise.all([
    activeQuery,
    adoptedQuery,
    isSuperAdmin ? getAllListingsForAdmin() : getUserListings(user.id),
    supabase.from("app_settings").select("key, value").in("key", ["admin_contact_whatsapp", "admin_contact_email"])
  ]);

  const wantsToBeOrganization = user.user_metadata?.wants_to_be_organization === true;
  const adminWhatsapp = appSettings?.find(s => s.key === "admin_contact_whatsapp")?.value as string | undefined;
  const adminEmail = appSettings?.find(s => s.key === "admin_contact_email")?.value as string | undefined;

  return {
    profile,
    active: active ?? 0,
    adopted: adopted ?? 0,
    limit: limitState.limit,
    activeCount: limitState.activeCount,
    listings: userListings.listings,
    wantsToBeOrganization,
    adminWhatsapp,
    adminEmail
  };
}
