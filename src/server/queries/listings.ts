import { notFound } from "next/navigation";

import { CATEGORY_OPTIONS, PUBLIC_LISTING_STATUSES } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  CategorySummary,
  ExploreFilters,
  PetCardListing,
  PetContact,
  PetImage,
  PetSex,
  PetSize,
  PetStatus,
  PublicPetDetail
} from "@/types/app";

type RawImage = {
  id?: string;
  public_url?: string | null;
  storage_path?: string | null;
  alt_text?: string | null;
  sort_order?: number | null;
};

type RawCategory = {
  name?: string | null;
  slug?: string | null;
};

type RawOrganization = {
  name?: string | null;
  slug?: string | null;
  is_verified?: boolean | null;
};

type RawPet = {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  species?: string | null;
  breed?: string | null;
  age_value?: number | null;
  age_unit?: string | null;
  sex: "male" | "female" | "unknown";
  size: "small" | "medium" | "large" | "unknown";
  status: "draft" | "pending_review" | "published" | "in_process" | "adopted" | "suspended" | "deleted";
  province: string;
  district?: string | null;
  sector?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  story?: string | null;
  health_notes?: string | null;
  adoption_requirements?: string | null;
  published_at?: string | null;
  created_at: string;
  pet_images?: RawImage[] | null;
  categories?: RawCategory | null;
  organizations?: RawOrganization | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_whatsapp?: string | null;
  contact_email?: string | null;
  badges?: string[] | null;
  owner?: { display_name?: string | null; full_name?: string | null; slug?: string | null; } | null;
};

const LISTING_SELECT = `
  id,
  owner_id,
  slug,
  name,
  species,
  breed,
  age_value,
  age_unit,
  sex,
  size,
  status,
  province,
  district,
  sector,
  latitude,
  longitude,
  description,
  story,
  health_notes,
  adoption_requirements,
  published_at,
  created_at,
  badges,
  pet_images(id, public_url, storage_path, alt_text, sort_order),
  categories!inner(name, slug),
  organizations(name, slug, is_verified),
  owner:profiles!pet_listings_owner_id_fkey(display_name, full_name, slug)
`;

function publicUrlForImage(image: RawImage | null | undefined): string {
  if (image?.public_url) return image.public_url;
  return "/reference/hero-adoptame-panama.png";
}

function mapImages(images?: RawImage[] | null, fallbackName = "Mascota en adopción"): PetImage[] {
  return (images ?? [])
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((image, index) => ({
      id: image.id,
      publicUrl: publicUrlForImage(image),
      altText: image.alt_text ?? `${fallbackName} imagen ${index + 1}`,
      sortOrder: image.sort_order ?? index
    }));
}

export function mapPetCard(row: RawPet): PetCardListing {
  const images = mapImages(row.pet_images, row.name);

  return {
    id: row.id,
    ownerId: row.owner_id,
    slug: row.slug,
    name: row.name,
    species: row.species ?? null,
    breed: row.breed ?? null,
    ageValue: row.age_value ?? null,
    ageUnit: row.age_unit ?? null,
    sex: row.sex,
    size: row.size,
    status: row.status,
    province: row.province,
    district: row.district ?? null,
    publishedAt: row.published_at ?? null,
    createdAt: row.created_at,
    category: row.categories?.name
      ? {
          name: row.categories.name,
          slug: row.categories.slug ?? ""
        }
      : null,
    organization: row.organizations?.name
      ? {
          name: row.organizations.name,
          slug: row.organizations.slug ?? "",
          isVerified: Boolean(row.organizations.is_verified)
        }
      : null,
    image: images[0] ?? null,
    badges: row.badges ?? [],
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    ownerName: row.organizations?.name ?? row.owner?.display_name ?? row.owner?.full_name ?? "Publicante",
    ownerSlug: row.organizations?.slug ?? row.owner?.slug ?? null
  };
}

function mapPetDetail(row: RawPet): PublicPetDetail {
  return {
    ...mapPetCard(row),
    description: row.description ?? "",
    story: row.story ?? null,
    healthNotes: row.health_notes ?? null,
    adoptionRequirements: row.adoption_requirements ?? null,
    sector: row.sector ?? null,
    images: mapImages(row.pet_images, row.name),
    contactName: row.contact_name ?? null,
    contactPhone: row.contact_phone ?? null,
    contactWhatsapp: row.contact_whatsapp ?? null,
    contactEmail: row.contact_email ?? null
  };
}

type OrderableQuery = {
  order: (column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) => OrderableQuery;
};

function applySort<T extends OrderableQuery>(query: T, sort?: string): T {
  let sorted: OrderableQuery = query;

  if (sort === "oldest") {
    sorted = sorted.order("published_at", { ascending: true, nullsFirst: false }).order("created_at", { ascending: true });
    return sorted as T;
  }

  if (sort === "az") {
    sorted = sorted.order("name", { ascending: true });
    return sorted as T;
  }

  if (sort === "za") {
    sorted = sorted.order("name", { ascending: false });
    return sorted as T;
  }

  sorted = sorted.order("published_at", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false });
  return sorted as T;
}

const DUMMY_LISTINGS: PetCardListing[] = [
  {
    id: "dummy-1",
    ownerId: "dummy-owner",
    slug: "buddy-el-labrador",
    name: "Buddy",
    species: "Perro",
    breed: "Labrador",
    ageValue: 2,
    ageUnit: "years",
    sex: "male",
    size: "large",
    status: "published",
    province: "Panamá",
    district: "Bella Vista",
    latitude: 8.9833,
    longitude: -79.5167,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    category: { name: "Perros", slug: "perros" },
    ownerName: "Juan Pérez",
    ownerSlug: "juan-perez",
    organization: { name: "Rescate Animal", slug: "rescate-animal", isVerified: true },
    image: { publicUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1000&auto=format&fit=crop", altText: "Buddy", sortOrder: 0, id: "img-1" },
    badges: ["Vacunado", "Desparasitado"]
  },
  {
    id: "dummy-2",
    ownerId: "dummy-owner",
    slug: "luna-la-gatita",
    name: "Luna",
    species: "Gato",
    breed: "Común",
    ageValue: 6,
    ageUnit: "months",
    sex: "female",
    size: "small",
    status: "published",
    province: "Chiriquí",
    district: "David",
    latitude: 8.4333,
    longitude: -82.4333,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    category: { name: "Gatos", slug: "gatos" },
    ownerName: "María García",
    ownerSlug: "maria-garcia",
    organization: null,
    image: { publicUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1000&auto=format&fit=crop", altText: "Luna", sortOrder: 0, id: "img-2" },
    badges: ["Desparasitado", "Cariñosa"]
  },
  {
    id: "dummy-3",
    ownerId: "dummy-owner",
    slug: "max-el-golden",
    name: "Max",
    species: "Perro",
    breed: "Golden Retriever",
    ageValue: 1,
    ageUnit: "years",
    sex: "male",
    size: "medium",
    status: "published",
    province: "Colón",
    district: "Colón",
    latitude: 9.35,
    longitude: -79.9,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    category: { name: "Perros", slug: "perros" },
    ownerName: "Fundación Peludos",
    ownerSlug: "fundacion-peludos",
    organization: { name: "Fundación Peludos", slug: "fundacion-peludos", isVerified: false },
    image: { publicUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1000&auto=format&fit=crop", altText: "Max", sortOrder: 0, id: "img-3" },
    badges: ["Vacunado", "Esterilizado", "Juguetón"]
  }
];

export function getDummyPetDetail(slug: string): PublicPetDetail | null {
  const dummy = DUMMY_LISTINGS.find((d) => d.slug === slug);
  if (!dummy) return null;
  return {
    ...dummy,
    description: "Este es un perfil de prueba para demostrar cómo se ve la información de una mascota en la plataforma. Es un animal muy cariñoso y amigable que busca un hogar definitivo.",
    story: "Fue rescatado de las calles hace unas semanas y ha estado en un hogar de acogida temporal, donde ha demostrado ser excelente con niños y otros animales.",
    healthNotes: "Vacunado y desparasitado. Se encuentra en perfecto estado de salud.",
    adoptionRequirements: "Se busca una familia responsable, con espacio adecuado. Firma de contrato de adopción y seguimiento.",
    sector: "Centro",
    ownerName: dummy.organization?.name ?? "Publicante",
    ownerSlug: dummy.organization?.slug ?? null,
    images: dummy.image ? [dummy.image] : [],
    contactName: null,
    contactPhone: null,
    contactWhatsapp: null,
    contactEmail: null
  };
}

export async function getLatestPets(limit = 6) {
  const supabase = await createClient();

  if (!supabase) {
    return { listings: [] as PetCardListing[], error: null as string | null };
  }

  const query = supabase
    .from("pet_listings")
    .select(LISTING_SELECT)
    .in("status", PUBLIC_LISTING_STATUSES)
    .is("deleted_at", null)
    .limit(limit);

  const { data, error } = await applySort(query, "recent");

  const listings = ((data ?? []) as unknown as RawPet[]).map(mapPetCard);

  if (listings.length === 0 && !error) {
    return { listings: DUMMY_LISTINGS.slice(0, limit), error: null };
  }

  return {
    listings,
    error: error?.message ?? null
  };
}

export async function getExploreListings(filters: ExploreFilters) {
  const supabase = await createClient();
  const page = Math.max(filters.page ?? 1, 1);
  const pageSize = 12;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  if (!supabase) {
    return { listings: [] as PetCardListing[], count: 0, page, pageSize, error: null as string | null };
  }

  let query = supabase
    .from("pet_listings")
    .select(LISTING_SELECT, { count: "exact" })
    .in("status", PUBLIC_LISTING_STATUSES)
    .is("deleted_at", null)
    .range(from, to);

  if (filters.category) query = query.eq("categories.slug", filters.category);
  if (filters.province) query = query.eq("province", filters.province);
  if (filters.district) query = query.ilike("district", `%${filters.district}%`);
  if (filters.sex && ["male", "female", "unknown"].includes(filters.sex)) query = query.eq("sex", filters.sex as PetSex);
  if (filters.size && ["small", "medium", "large", "unknown"].includes(filters.size)) query = query.eq("size", filters.size as PetSize);
  if (filters.status && ["published", "in_process", "adopted"].includes(filters.status)) query = query.eq("status", filters.status as PetStatus);
  if (filters.verified === "true") query = query.eq("organizations.is_verified", true);
  if (filters.age === "baby") query = query.eq("age_unit", "months");
  if (filters.age === "adult") query = query.gte("age_value", 1).eq("age_unit", "years");
  if (filters.location === "nearby" && filters.lat && filters.lng && filters.radius) {
    const latitude = Number(filters.lat);
    const longitude = Number(filters.lng);
    const radiusKm = Number(filters.radius ?? "35");

    if (Number.isFinite(latitude) && Number.isFinite(longitude) && Number.isFinite(radiusKm)) {
      const latitudeDelta = radiusKm / 111;
      const longitudeDelta = radiusKm / Math.max(Math.cos((latitude * Math.PI) / 180) * 111, 1);

      query = query
        .gte("latitude", latitude - latitudeDelta)
        .lte("latitude", latitude + latitudeDelta)
        .gte("longitude", longitude - longitudeDelta)
        .lte("longitude", longitude + longitudeDelta);
    }
  }
  if (filters.q) {
    const q = filters.q.replaceAll(",", " ").trim();
    query = query.or(
      `name.ilike.%${q}%,breed.ilike.%${q}%,species.ilike.%${q}%,description.ilike.%${q}%,province.ilike.%${q}%,district.ilike.%${q}%`
    );
  }

  const { data, count, error } = await applySort(query, filters.sort);
  const listings = ((data ?? []) as unknown as RawPet[]).map(mapPetCard);

  if (listings.length === 0 && !error) {
    let dummy = DUMMY_LISTINGS;
    if (filters.category) dummy = dummy.filter(d => d.category?.slug === filters.category);
    if (filters.province) dummy = dummy.filter(d => d.province === filters.province);
    if (filters.district) dummy = dummy.filter(d => d.district?.toLowerCase().includes(filters.district!.toLowerCase()));
    if (filters.sex && ["male", "female", "unknown"].includes(filters.sex)) dummy = dummy.filter(d => d.sex === filters.sex);
    if (filters.size && ["small", "medium", "large", "unknown"].includes(filters.size)) dummy = dummy.filter(d => d.size === filters.size);
    if (filters.age === "baby") dummy = dummy.filter(d => d.ageUnit === "months");
    if (filters.age === "adult") dummy = dummy.filter(d => d.ageUnit === "years" && (d.ageValue ?? 0) >= 1);
    if (filters.q) {
      const q = filters.q.toLowerCase();
      dummy = dummy.filter(d => 
        d.name.toLowerCase().includes(q) || 
        d.breed?.toLowerCase().includes(q) || 
        d.species?.toLowerCase().includes(q) || 
        d.province.toLowerCase().includes(q)
      );
    }
    
    return {
      listings: dummy,
      count: dummy.length,
      page,
      pageSize,
      error: null
    };
  }

  return {
    listings,
    count: count ?? 0,
    page,
    pageSize,
    error: error?.message ?? null
  };
}

export async function getUserListings(ownerId: string) {
  const supabase = await createClient();

  if (!supabase) {
    return { listings: [] as PetCardListing[], error: null as string | null };
  }

  const query = supabase
    .from("pet_listings")
    .select(LISTING_SELECT)
    .eq("owner_id", ownerId)
    .is("deleted_at", null)
    .limit(50);

  const { data, error } = await applySort(query, "recent");

  return {
    listings: ((data ?? []) as unknown as RawPet[]).map(mapPetCard),
    error: error?.message ?? null
  };
}

export async function getAllListingsForAdmin(limit = 200) {
  const supabase = createAdminClient() ?? (await createClient());

  if (!supabase) {
    return { listings: [] as PetCardListing[], error: null as string | null };
  }

  const query = supabase
    .from("pet_listings")
    .select(LISTING_SELECT)
    .is("deleted_at", null)
    .limit(limit);

  const { data, error } = await applySort(query, "recent");

  return {
    listings: ((data ?? []) as unknown as RawPet[]).map(mapPetCard),
    error: error?.message ?? null
  };
}

export async function getFavoriteListingIds(userId?: string | null) {
  const supabase = await createClient();

  if (!supabase || !userId) {
    return new Set<string>();
  }

  const { data } = await supabase.from("user_favorites").select("listing_id").eq("user_id", userId);

  return new Set((data ?? []).map((favorite) => favorite.listing_id));
}

export async function getFavoriteListings(userId: string) {
  const supabase = await createClient();

  if (!supabase) {
    return { listings: [] as PetCardListing[], favoriteIds: new Set<string>(), error: null as string | null };
  }

  const { data: favorites, error: favoritesError } = await supabase
    .from("user_favorites")
    .select("listing_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (favoritesError) {
    return { listings: [] as PetCardListing[], favoriteIds: new Set<string>(), error: favoritesError.message };
  }

  const ids = (favorites ?? []).map((favorite) => favorite.listing_id);
  const favoriteIds = new Set(ids);

  if (!ids.length) {
    return { listings: [] as PetCardListing[], favoriteIds, error: null };
  }

  const query = supabase
    .from("pet_listings")
    .select(LISTING_SELECT)
    .in("id", ids)
    .in("status", PUBLIC_LISTING_STATUSES)
    .is("deleted_at", null);

  const { data, error } = await applySort(query, "recent");

  return {
    listings: ((data ?? []) as unknown as RawPet[]).map(mapPetCard),
    favoriteIds,
    error: error?.message ?? null
  };
}

export async function getPublicPetListing(slug: string) {
  const supabase = await createClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("pet_listings")
    .select(LISTING_SELECT)
    .eq("slug", slug)
    .in("status", PUBLIC_LISTING_STATUSES)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    const dummy = getDummyPetDetail(slug);
    if (dummy) return dummy;
    return null;
  }

  return mapPetDetail(data as unknown as RawPet);
}

export async function requirePublicPetListing(slug: string) {
  const listing = await getPublicPetListing(slug);
  if (!listing) notFound();
  return listing;
}

export async function getListingForEdit(slug: string) {
  const supabase = await createClient();

  if (!supabase) return null;

  const { data, error } = await supabase
    .from("pet_listings")
    .select(LISTING_SELECT)
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;

  return mapPetDetail(data as unknown as RawPet);
}

export async function getPublicPetContact(slug: string): Promise<PetContact | null> {
  const supabase = await createClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("pet_listings")
    .select(`
      contact_name, contact_phone, contact_whatsapp, contact_email,
      owner:profiles!pet_listings_owner_id_fkey(display_name, full_name, phone, whatsapp),
      organization:organizations(name, phone, whatsapp, email)
    `)
    .eq("slug", slug)
    .in("status", PUBLIC_LISTING_STATUSES)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;

  const d = data as any;
  const org = d.organization as Record<string, string> | null;
  const profile = d.owner as Record<string, string> | null;

  const name = org?.name || profile?.display_name || profile?.full_name || d.contact_name;
  const phone = org?.phone || profile?.phone || d.contact_phone;
  const whatsapp = org?.whatsapp || profile?.whatsapp || d.contact_whatsapp;
  const email = org?.email || d.contact_email;

  return {
    contactName: name,
    contactPhone: phone,
    contactWhatsapp: whatsapp,
    contactEmail: email
  };
}

export async function getSitemapPets() {
  const supabase = await createClient();

  if (!supabase) return [];

  const { data } = await supabase
    .from("pet_listings")
    .select("slug,updated_at")
    .in("status", PUBLIC_LISTING_STATUSES)
    .is("deleted_at", null)
    .limit(5000);

  return (data ?? []).map((pet) => ({ slug: pet.slug, updatedAt: pet.updated_at }));
}

export async function getCategoryCounts(): Promise<CategorySummary[]> {
  const supabase = await createClient();

  if (!supabase) {
    return CATEGORY_OPTIONS.map((category) => ({
      name: category.name,
      slug: category.slug,
      activeCount: 0
    }));
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("id,name,slug,icon,sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const rows = categories?.length
    ? categories
    : CATEGORY_OPTIONS.map((category, index) => ({
        id: category.slug,
        name: category.name,
        slug: category.slug,
        icon: null,
        sort_order: index
      }));

  const counts = await Promise.all(
    rows.map(async (category) => {
      const { count } = await supabase
        .from("pet_listings")
        .select("id", { count: "exact", head: true })
        .eq("category_id", category.id)
        .in("status", ["published", "in_process"])
        .is("deleted_at", null);

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        activeCount: count ?? 0
      };
    })
  );

  // If all counts are 0, use dummy counts so the UI isn't empty
  const totalCount = counts.reduce((sum, c) => sum + c.activeCount, 0);
  if (totalCount === 0) {
    const dummyCategoryCount: Record<string, number> = {};
    for (const d of DUMMY_LISTINGS) {
      const slug = d.category?.slug;
      if (slug) dummyCategoryCount[slug] = (dummyCategoryCount[slug] ?? 0) + 1;
    }
    return counts.map((c) => ({
      ...c,
      activeCount: dummyCategoryCount[c.slug] ?? 0
    }));
  }

  return counts;
}

export async function getHomeStats() {
  const supabase = createAdminClient() ?? (await createClient());

  if (!supabase) {
    return {
      adoptions: 0,
      volunteers: 0,
      totalListings: 0
    };
  }

  const [adoptions, volunteers, totalListings] = await Promise.all([
    supabase
      .from("pet_listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "adopted")
      .is("deleted_at", null),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("pet_listings").select("id", { count: "exact", head: true }).is("deleted_at", null)
  ]);

  return {
    adoptions: adoptions.count ?? 0,
    volunteers: volunteers.count ?? 0,
    totalListings: totalListings.count ?? 0
  };
}
