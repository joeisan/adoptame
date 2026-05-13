import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapPetCard } from "./listings";
import { PUBLIC_LISTING_STATUSES } from "@/lib/constants";
import type { PetCardListing } from "@/types/app";

export type PublicProfile = {
  id: string;
  isOrganization: boolean;
  name: string;
  slug: string;
  description?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  linkedin?: string | null;
  telegram?: string | null;
  province?: string;
  district?: string;
  isVerified?: boolean;
  organizationType?: string | null;
};

export async function getPublicProfileBySlug(slug: string): Promise<PublicProfile | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (org) {
    const o = org as Record<string, unknown>;
    return {
      id: org.id,
      isOrganization: true,
      name: org.name,
      slug: org.slug,
      description: org.description,
      phone: (o.phone as string) ?? null,
      whatsapp: (o.whatsapp as string) ?? null,
      email: (o.email as string) ?? null,
      website: org.website_url,
      facebook: org.facebook_url,
      instagram: org.instagram_url,
      isVerified: org.is_verified,
      organizationType: (o.type as string) || "Organización"
    };
  }

  const { data: profile } = await (supabase
    .from("profiles")
    .select("*") as any)
    .eq("slug", slug)
    .maybeSingle();

  if (profile) {
    const publicName =
      profile.role === "organization"
        ? profile.organization_name ?? profile.display_name ?? profile.full_name ?? "Organización"
        : profile.display_name ?? profile.full_name ?? "Usuario";

    return {
      id: profile.id,
      isOrganization: profile.role === "organization",
      name: publicName,
      slug: profile.slug ?? slug,
      description: profile.description,
      phone: profile.phone,
      whatsapp: profile.whatsapp,
      email: profile.email,
      website: profile.website_url,
      facebook: profile.facebook_url,
      instagram: profile.instagram_url,
      youtube: profile.youtube_url,
      linkedin: profile.linkedin_url,
      telegram: profile.telegram_url,
      province: profile.province,
      district: profile.district,
      organizationType: profile.organization_type
    };
  }

  // Handle Dummy routes
  if (slug === "rescate-animal") {
    return {
      id: "550e8400-e29b-41d4-a716-446655440001",
      isOrganization: true,
      name: "Rescate Animal",
      slug: "rescate-animal",
      description: "Organización dedicada al rescate y rehabilitación de animales en abandono.",
      whatsapp: "+507 6000-0000",
      email: "contacto@rescateanimal.dummy",
      isVerified: true
    };
  }
  if (slug === "fundacion-peludos") {
    return {
      id: "550e8400-e29b-41d4-a716-446655440002",
      isOrganization: true,
      name: "Fundación Peludos",
      slug: "fundacion-peludos",
      description: "Ayudando a encontrar hogar a perritos sin raza.",
      whatsapp: "+507 6000-0001",
      isVerified: false
    };
  }

  return null;
}

export async function getProfileActiveListings(profile: PublicProfile): Promise<PetCardListing[]> {
  // Handle Dummy data for mocks
  if (profile.id === "550e8400-e29b-41d4-a716-446655440001") {
    // Return Buddy for Rescate Animal
    return [
      {
        id: "550e8400-e29b-41d4-a716-44665544000a",
        ownerId: profile.id,
        slug: "buddy-perro-alegre",
        name: "Buddy",
        species: "perros",
        breed: "Labrador Mix",
        ageValue: 2,
        ageUnit: "years",
        sex: "male",
        size: "medium",
        status: "published",
        province: "Panamá",
        district: "Panamá",
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        badges: [],
        latitude: null,
        longitude: null,
        image: { publicUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1000&auto=format&fit=crop", altText: "Buddy", id: "dummy-img-1", sortOrder: 0 },
        category: { name: "Perros", slug: "perros" },
        ownerName: "Rescate Animal",
        ownerSlug: "rescate-animal",
        organization: { name: "Rescate Animal", slug: "rescate-animal", isVerified: true }
      }
    ];
  }
  if (profile.id === "550e8400-e29b-41d4-a716-446655440002") {
    // Return Max for Fundación Peludos
    return [
      {
        id: "550e8400-e29b-41d4-a716-44665544000b",
        ownerId: profile.id,
        slug: "max-perro-guardian",
        name: "Max",
        species: "perros",
        breed: "Pastor Alemán Mix",
        ageValue: 4,
        ageUnit: "years",
        sex: "male",
        size: "large",
        status: "published",
        province: "Chiriquí",
        district: "David",
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        badges: [],
        latitude: null,
        longitude: null,
        image: { publicUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1000&auto=format&fit=crop", altText: "Max", id: "dummy-img-3", sortOrder: 0 },
        category: { name: "Perros", slug: "perros" },
        ownerName: "Fundación Peludos",
        ownerSlug: "fundacion-peludos",
        organization: { name: "Fundación Peludos", slug: "fundacion-peludos", isVerified: false }
      }
    ];
  }

  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("pet_listings")
    .select(`
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
      organizations(name, slug, is_verified)
    `)
    .in("status", PUBLIC_LISTING_STATUSES)
    .is("deleted_at", null)
    .limit(50);

  if (profile.isOrganization) {
    query = query.eq("organization_id", profile.id);
  } else {
    query = query.eq("owner_id", profile.id);
  }

  const { data, error } = await query;
  if (error || !data) {
    return [];
  }

  return (data as any[]).map(mapPetCard);
}

export async function getProfilesForSelect() {
  const supabase = createAdminClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, full_name")
    .eq("status", "active")
    .order("display_name", { ascending: true })
    .limit(1000);

  return (data ?? []).map((p) => ({
    id: p.id,
    label: p.display_name || p.full_name || "Usuario sin nombre"
  }));
}

export async function getLatestOrganizations(limit = 6) {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, slug, is_verified")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) {
    return [
      { id: "1", name: "Rescate Animal", slug: "rescate-animal", isVerified: true },
      { id: "2", name: "Fundación Peludos", slug: "fundacion-peludos", isVerified: false },
      { id: "3", name: "Hogares de Paso", slug: "hogares-paso", isVerified: true },
      { id: "4", name: "Gatitos Panamá", slug: "gatitos-panama", isVerified: true },
      { id: "5", name: "Huellitas Chiriquí", slug: "huellitas-chiriqui", isVerified: false },
      { id: "6", name: "Amigos de los Perros", slug: "amigos-perros", isVerified: true }
    ].slice(0, limit);
  }

  return data.map((org) => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
    isVerified: org.is_verified
  }));
}
