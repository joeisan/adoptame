import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminMetrics } from "@/types/app";

const EMPTY_METRICS: AdminMetrics = {
  totalUsers: 0,
  newUsers7d: 0,
  newUsers30d: 0,
  totalListings: 0,
  activeListings: 0,
  adoptedListings: 0,
  totalOrganizations: 0,
  verifiedOrganizations: 0,
  openReports: 0,
  bannedUsers: 0,
  usersByPeriod: [],
  listingsByCategory: [],
  listingsByProvince: [],
  listingsByStatus: [],
  reportsByStatus: [],
  topOrganizations: []
};

function since(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const supabase = createAdminClient();

  if (!supabase) return EMPTY_METRICS;

  const [
    users,
    new7,
    new30,
    listings,
    active,
    adopted,
    organizations,
    verified,
    reports,
    banned,
    categoryRows,
    provinceRows,
    statusRows,
    reportRows
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since(7)),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since(30)),
    supabase.from("pet_listings").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase
      .from("pet_listings")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .in("status", ["published", "in_process"]),
    supabase.from("pet_listings").select("id", { count: "exact", head: true }).eq("status", "adopted"),
    supabase.from("organizations").select("id", { count: "exact", head: true }),
    supabase.from("organizations").select("id", { count: "exact", head: true }).eq("is_verified", true),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "banned"),
    supabase.from("pet_listings").select("categories(name)").is("deleted_at", null),
    supabase.from("pet_listings").select("province").is("deleted_at", null),
    supabase.from("pet_listings").select("status").is("deleted_at", null),
    supabase.from("reports").select("status")
  ]);

  const fold = (items: string[]) =>
    Object.entries(
      items.reduce<Record<string, number>>((acc, item) => {
        acc[item] = (acc[item] ?? 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

  const categoryNames = ((categoryRows.data ?? []) as unknown as Array<{ categories?: { name?: string | null } | null }>)
    .map((row) => row.categories?.name)
    .filter(Boolean) as string[];
  const provinceNames = (provinceRows.data ?? []).map((row) => row.province).filter(Boolean) as string[];
  const statusNames = (statusRows.data ?? []).map((row) => row.status).filter(Boolean) as string[];
  const reportNames = (reportRows.data ?? []).map((row) => row.status).filter(Boolean) as string[];

  return {
    totalUsers: users.count ?? 0,
    newUsers7d: new7.count ?? 0,
    newUsers30d: new30.count ?? 0,
    totalListings: listings.count ?? 0,
    activeListings: active.count ?? 0,
    adoptedListings: adopted.count ?? 0,
    totalOrganizations: organizations.count ?? 0,
    verifiedOrganizations: verified.count ?? 0,
    openReports: reports.count ?? 0,
    bannedUsers: banned.count ?? 0,
    usersByPeriod: [
      { label: "Hace 30 días", users: Math.max((new30.count ?? 0) - (new7.count ?? 0), 0) },
      { label: "Últimos 7 días", users: new7.count ?? 0 }
    ],
    listingsByCategory: fold(categoryNames),
    listingsByProvince: fold(provinceNames),
    listingsByStatus: fold(statusNames),
    reportsByStatus: fold(reportNames),
    topOrganizations: []
  };
}

export async function getAdminTableData() {
  const supabase = createAdminClient();
  if (!supabase) return { users: [], listings: [], reports: [], organizations: [] };

  // Cargamos todo con el cliente de administración para saltar RLS
  const [usersRes, authUsersRes, listingsRes, reportsRes, organizationsRes] = await Promise.all([
    supabase.from("profiles").select("id,display_name,full_name,role,status,created_at,banned_until").limit(200),
    supabase.auth.admin.listUsers({ perPage: 200 }),
    supabase
      .from("pet_listings")
      .select(`
        id,
        name,
        slug,
        status,
        province,
        created_at,
        owner_id,
        category:categories(name),
        organizations(name),
        owner:profiles(display_name, full_name),
        pet_images(public_url)
      `)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("reports").select("id,report_type,reason,status,created_at,description,reported_listing_id,pet_listings(name,slug)").limit(100),
    supabase.from("organizations").select("id,name,is_verified,listing_limit,created_at,owner:profiles(display_name,full_name)").limit(100)
  ]);

  const authUsers = authUsersRes.data?.users || [];
  const rawUsers = (usersRes.data ?? []) as Array<{ id: string; display_name?: string | null; full_name?: string | null; email?: string | null }>;
  
  const users = rawUsers.map(u => {
    const authUser = authUsers.find(au => au.id === u.id);
    return {
      ...u,
      email: authUser?.email || "Sin correo"
    };
  });

  const rawListings = (listingsRes.data ?? []) as Array<Record<string, any> & { owner_id: string }>;

  // Unión manual usando la lista de usuarios ya cargada
  const enrichedListings = rawListings.map(listing => {
    // Priorizamos el dueño que viene de la relación directa, si no, buscamos en la lista de usuarios
    const ownerData = (listing as any).owner || users.find(u => u.id === listing.owner_id);
    return {
      ...listing,
      owner: ownerData || { display_name: "Usuario Desconocido", id: listing.owner_id }
    };
  });

  return {
    users: users,
    listings: enrichedListings,
    reports: reportsRes.data ?? [],
    organizations: organizationsRes.data ?? []
  };
}
