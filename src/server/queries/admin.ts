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
  const [usersRes, authUsersRes, listingsRes, categoryRes, organizationLookupRes, ownerLookupRes, imageRes, reportsRes, organizationsRes] = await Promise.all([
    supabase.from("profiles").select("id,display_name,full_name,role,status,created_at,organization_name,organization_type,slug").limit(200),
    supabase.auth.admin.listUsers({ perPage: 200 }),
    supabase
      .from("pet_listings")
      .select("id,name,slug,status,province,created_at,owner_id,organization_id,category_id")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("categories").select("id,name"),
    supabase.from("organizations").select("id,name,slug,owner_id"),
    supabase.from("profiles").select("id,display_name,full_name,slug"),
    supabase.from("pet_images").select("listing_id,public_url,sort_order").order("sort_order", { ascending: true }),
    supabase.from("reports").select("id,report_type,reason,status,created_at,description,reported_listing_id,pet_listings(name,slug)").limit(100),
    supabase.from("organizations").select("id,name,slug,type,is_verified,listing_limit,created_at,owner:profiles(id,display_name,full_name,slug)").limit(100)
  ]);

  const authUsers = authUsersRes.data?.users || [];
  const organizationRows = (organizationsRes.data ?? []) as Array<{
    id: string;
    name: string;
    slug: string;
    type: string | null;
    is_verified: boolean;
    listing_limit: number;
    created_at: string;
    owner: { id?: string; display_name?: string | null; full_name?: string | null; slug?: string | null } | null;
  }>;
  const rawUsers = (usersRes.data ?? []) as Array<{
    id: string;
    display_name?: string | null;
    full_name?: string | null;
    email?: string | null;
    slug?: string | null;
    role?: string | null;
    status?: string | null;
    created_at?: string;
    organization_name?: string | null;
    organization_type?: string | null;
  }>;

  const categories = new Map(((categoryRes.data ?? []) as Array<{ id: string; name: string | null }>).map((item) => [item.id, item]));
  const organizations = new Map(((organizationLookupRes.data ?? []) as Array<{ id: string; name: string | null; slug: string | null; owner_id: string }>).map((item) => [item.id, item]));
  const organizationsByOwner = new Map(
    ((organizationLookupRes.data ?? []) as Array<{ id: string; name: string | null; slug: string | null; owner_id: string }>).map((item) => [item.owner_id, item])
  );
  const owners = new Map(((ownerLookupRes.data ?? []) as Array<{ id: string; display_name: string | null; full_name: string | null; slug: string | null }>).map((item) => [item.id, item]));
  const imagesByListing = ((imageRes.data ?? []) as Array<{ listing_id: string; public_url: string | null; sort_order: number | null }>).reduce<Record<string, Array<{ public_url: string | null }>>>(
    (acc, image) => {
      acc[image.listing_id] ??= [];
      acc[image.listing_id].push({ public_url: image.public_url });
      return acc;
    },
    {}
  );

  const rawListings = (listingsRes.data ?? []) as Array<{
    id: string;
    name: string;
    slug: string;
    status: string;
    province: string;
    created_at: string;
    owner_id: string;
    organization_id: string | null;
    category_id: string | null;
  }>;
  const listingCountByOwner = rawListings.reduce<Record<string, number>>((acc, listing) => {
    acc[listing.owner_id] = (acc[listing.owner_id] ?? 0) + 1;
    return acc;
  }, {});

  const users = rawUsers.map(u => {
    const authUser = authUsers.find(au => au.id === u.id);
    const organization = organizationsByOwner.get(u.id);
    return {
      ...u,
      email: authUser?.email || "Sin correo",
      listing_count: listingCountByOwner[u.id] ?? 0,
      wants_to_be_organization: authUser?.user_metadata?.wants_to_be_organization === true,
      public_slug: u.role === "organization" ? organization?.slug || null : u.slug || null
    };
  });

  const pendingOrganizationRequests = users
    .filter((user) => user.role === "user" && user.wants_to_be_organization)
    .filter((user) => !organizationRows.some((organization) => {
      const owner = organization.owner as { id?: string } | null;
      return owner?.id === user.id;
    }))
    .map((user) => ({
      id: user.id,
      name: (user as { organization_name?: string | null }).organization_name || `${user.display_name || user.full_name || "Usuario"} - Solicitud`,
      type: (user as { organization_type?: string | null }).organization_type || "Organización",
      is_verified: false,
      listing_limit: 0,
      created_at: (user as { created_at?: string }).created_at,
      owner: {
        display_name: user.display_name || user.full_name || "Usuario",
        full_name: user.full_name || user.display_name || "Usuario",
        slug: user.slug || null
      },
      contact_email: user.email,
      is_pending_request: true
    }));

  const enrichedListings = rawListings.map((listing) => {
    const ownerData = owners.get(listing.owner_id) || users.find((u) => u.id === listing.owner_id);
    const organization = listing.organization_id ? organizations.get(listing.organization_id) : null;
    const category = listing.category_id ? categories.get(listing.category_id) : null;

    return {
      ...listing,
      owner: ownerData || { display_name: "Usuario Desconocido", id: listing.owner_id },
      organizations: organization ? { name: organization.name, slug: organization.slug } : null,
      category: category ? { name: category.name } : null,
      pet_images: imagesByListing[listing.id] ?? []
    };
  });

  return {
    users: users,
    listings: enrichedListings,
    reports: reportsRes.data ?? [],
    organizations: [...pendingOrganizationRequests, ...organizationRows]
  };
}
