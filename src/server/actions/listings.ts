"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

import { SITE_CONFIG } from "@/lib/constants";
import { canCreateListing, getCurrentUser } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { listingSchema } from "@/lib/validations/listing";

function valueOrNull(value?: string | number | null) {
  if (value === "" || value === undefined) return null;
  return value;
}

function fileSafeName(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  return `${crypto.randomUUID()}.${extension.replace(/[^a-z0-9]/g, "")}`;
}

function parseStringArray(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) return [] as string[];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map((item) => String(item ?? "")) : [];
  } catch {
    return [];
  }
}

function parseExistingImagesState(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) return [] as Array<{
    id: string;
    altText: string;
    deleted: boolean;
    sortOrder: number;
  }>;
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        id: String(item?.id ?? ""),
        altText: String(item?.altText ?? ""),
        deleted: Boolean(item?.deleted),
        sortOrder: Number(item?.sortOrder ?? 0)
      }))
      .filter((item) => item.id);
  } catch {
    return [];
  }
}

async function removeImagesFromStorage(paths: string[]) {
  if (!paths.length) return;
  const adminClient = createAdminClient();
  if (adminClient) {
    await adminClient.storage.from("pet-images").remove(paths);
    return;
  }

  const supabase = await createClient();
  if (supabase) {
    await supabase.storage.from("pet-images").remove(paths);
  }
}

async function maxImagesSetting() {
  const supabase = await createClient();
  if (!supabase) return SITE_CONFIG.defaultMaxImages;

  const { data } = await supabase.from("app_settings").select("value").eq("key", "max_images_per_listing").maybeSingle();
  return typeof data?.value === "number" ? data.value : SITE_CONFIG.defaultMaxImages;
}

async function initialListingStatus() {
  const supabase = await createClient();
  if (!supabase) return "published" as const;

  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "require_review_before_publish")
    .maybeSingle();

  return data?.value === true ? ("pending_review" as const) : ("published" as const);
}

export async function createListingAction(formData: FormData) {
  const { user, profile } = await getCurrentUser();

  if (!user) return { error: "Debes iniciar sesión para publicar." };

  const parsed = listingSchema.safeParse({
    name: formData.get("name"),
    categorySlug: formData.get("categorySlug"),
    species: formData.get("species") ?? "",
    breed: formData.get("breed") ?? "",
    ageValue: formData.get("ageValue") ?? "",
    ageUnit: formData.get("ageUnit") ?? "unknown",
    sex: formData.get("sex") ?? "unknown",
    size: formData.get("size") ?? "unknown",
    province: formData.get("province"),
    district: formData.get("district") ?? "",
    sector: formData.get("sector") ?? "",
    description: formData.get("description"),
    story: formData.get("story") ?? "",
    healthNotes: formData.get("healthNotes") ?? "",
    adoptionRequirements: formData.get("adoptionRequirements") ?? "",
    contactName: formData.get("contactName") ?? "",
    contactPhone: formData.get("contactPhone") ?? "",
    contactWhatsapp: formData.get("contactWhatsapp") ?? "",
    contactEmail: formData.get("contactEmail") ?? ""
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos de la publicación." };
  }

  const limitState = await canCreateListing(user.id);
  if (!limitState.allowed) return { error: limitState.message ?? "No puedes publicar en este momento." };

  const files = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);
  const newImageAltTexts = parseStringArray(formData.get("newImageAltTexts"));
  const maxImages = await maxImagesSetting();

  if (files.length < 1) return { error: "Agrega al menos una imagen." };
  if (files.length > maxImages) return { error: `Puedes subir hasta ${maxImages} imágenes.` };

  const supabase = await createClient();
  if (!supabase) return { error: "Configura Supabase para publicar mascotas." };

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", parsed.data.categorySlug)
    .maybeSingle();
  const { data: organization } = await supabase.from("organizations").select("id").eq("owner_id", user.id).maybeSingle();

  const slug = `${slugify(parsed.data.name)}-${crypto.randomUUID().slice(0, 8)}`;
  const status = await initialListingStatus();

  const badges = formData.getAll("badges").map(String).filter(Boolean).slice(0, 4);

  const { data: listing, error } = await supabase
    .from("pet_listings")
    .insert({
      owner_id: user.id,
      organization_id: organization?.id ?? null,
      category_id: category?.id ?? null,
      name: parsed.data.name,
      slug,
      species: valueOrNull(parsed.data.species) as string | null,
      breed: valueOrNull(parsed.data.breed) as string | null,
      age_value: typeof parsed.data.ageValue === "number" ? parsed.data.ageValue : null,
      age_unit: parsed.data.ageUnit,
      sex: parsed.data.sex,
      size: parsed.data.size,
      province: parsed.data.province,
      district: valueOrNull(parsed.data.district) as string | null,
      sector: valueOrNull(parsed.data.sector) as string | null,
      description: parsed.data.description,
      story: valueOrNull(parsed.data.story) as string | null,
      health_notes: valueOrNull(parsed.data.healthNotes) as string | null,
      adoption_requirements: valueOrNull(parsed.data.adoptionRequirements) as string | null,
      status,
      contact_name: valueOrNull(parsed.data.contactName) as string | null,
      contact_phone: valueOrNull(parsed.data.contactPhone) as string | null,
      contact_whatsapp: valueOrNull(parsed.data.contactWhatsapp) as string | null,
      contact_email: valueOrNull(parsed.data.contactEmail) as string | null,
      published_at: status === "published" ? new Date().toISOString() : null
    })
    .select("id,slug")
    .single();

  if (error || !listing) return { error: error?.message ?? "No se pudo crear la publicación." };

  // Update badges separately (column not yet in generated types)
  if (badges.length > 0) {
    // @ts-expect-error – badges column exists after migration but isn't in generated types yet
    await supabase.from("pet_listings").update({ badges }).eq("id", listing.id);
  }

  const imageRows = [];
  for (const [index, file] of files.entries()) {
    const storagePath = `${user.id}/${listing.id}/${fileSafeName(file)}`;
    const upload = await supabase.storage.from("pet-images").upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false
    });

    if (upload.error) continue;

    const {
      data: { publicUrl }
    } = supabase.storage.from("pet-images").getPublicUrl(storagePath);

    imageRows.push({
      listing_id: listing.id,
      storage_path: storagePath,
      public_url: publicUrl,
      alt_text: valueOrNull(newImageAltTexts[index]?.trim() || `${parsed.data.name} en adopción`) as string | null,
      sort_order: index
    });
  }

  if (imageRows.length) {
    await supabase.from("pet_images").insert(imageRows);
  }

  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath("/dashboard");
  redirect(`/pets/${listing.slug}`);
}

export async function markListingAdoptedAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const { user, profile } = await getCurrentUser();
  const supabase = await createClient();

  if (!id || !user || !supabase) return { error: "No se pudo actualizar." };

  let query = supabase
    .from("pet_listings")
    .update({ status: "adopted", adopted_at: new Date().toISOString() })
    .eq("id", id);

  if (profile?.role !== "super_admin") {
    query = query.eq("owner_id", user.id);
  }

  const { error } = await query;

  if (error) return { error: "No se pudo marcar como adoptada." };

  revalidatePath("/dashboard");
  revalidatePath("/explore");
  if (slug) revalidatePath(`/pets/${slug}`);
  return { ok: true };
}

export async function softDeleteListingAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const { user, profile } = await getCurrentUser();
  const supabase = await createClient();

  if (!id || !user || !supabase) return { error: "No se pudo eliminar." };

  let query = supabase
    .from("pet_listings")
    .update({ status: "deleted", deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (profile?.role !== "super_admin") {
    query = query.eq("owner_id", user.id);
  }

  const { error } = await query;

  if (error) return { error: "No se pudo eliminar la publicación." };

  revalidatePath("/dashboard");
  revalidatePath("/explore");
  return { ok: true };
}

export async function updateListingAction(formData: FormData) {
  const { user, profile } = await getCurrentUser();
  const listingId = String(formData.get("id") ?? "");

  if (!user || !listingId) return { error: "No autorizado para editar." };
  
  const supabase = await createClient();
  if (!supabase) return { error: "Error de conexión con la base de datos." };

  // Verificación de propiedad o permisos de admin
  const { data: current } = await supabase
    .from("pet_listings")
    .select("owner_id, slug")
    .eq("id", listingId)
    .maybeSingle();

  if (!current) return { error: "Publicación no encontrada." };
  
  const isAdmin = profile?.role === "super_admin";
  if (current.owner_id !== user.id && !isAdmin) {
    return { error: "No tienes permiso para editar esta publicación." };
  }

  const parsed = listingSchema.safeParse({
    name: formData.get("name"),
    categorySlug: formData.get("categorySlug"),
    species: formData.get("species") ?? "",
    breed: formData.get("breed") ?? "",
    ageValue: formData.get("ageValue") ?? "",
    ageUnit: formData.get("ageUnit") ?? "unknown",
    sex: formData.get("sex") ?? "unknown",
    size: formData.get("size") ?? "unknown",
    province: formData.get("province"),
    district: formData.get("district") ?? "",
    sector: formData.get("sector") ?? "",
    description: formData.get("description"),
    story: formData.get("story") ?? "",
    healthNotes: formData.get("healthNotes") ?? "",
    adoptionRequirements: formData.get("adoptionRequirements") ?? "",
    contactName: formData.get("contactName") ?? "",
    contactPhone: formData.get("contactPhone") ?? "",
    contactWhatsapp: formData.get("contactWhatsapp") ?? "",
    contactEmail: formData.get("contactEmail") ?? "",
    status: formData.get("status") ?? "published",
    ownerId: formData.get("ownerId") ?? undefined
  });

  if (!parsed.success) {
    console.error("Zod Error:", parsed.error.format());
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", parsed.data.categorySlug)
    .maybeSingle();

  const badges = formData.getAll("badges").map(String).filter(Boolean).slice(0, 8);
  const updateData: any = {
      category_id: category?.id ?? null,
      name: parsed.data.name,
      species: valueOrNull(parsed.data.species) as any,
      breed: valueOrNull(parsed.data.breed) as any,
      age_value: typeof parsed.data.ageValue === "number" ? parsed.data.ageValue : null,
      age_unit: parsed.data.ageUnit,
      sex: parsed.data.sex,
      size: parsed.data.size,
      province: parsed.data.province,
      district: valueOrNull(parsed.data.district) as any,
      sector: valueOrNull(parsed.data.sector) as any,
      description: parsed.data.description,
      story: valueOrNull(parsed.data.story) as any,
      health_notes: valueOrNull(parsed.data.healthNotes) as any,
      adoption_requirements: valueOrNull(parsed.data.adoptionRequirements) as any,
      contact_name: valueOrNull(parsed.data.contactName) as any,
      contact_phone: valueOrNull(parsed.data.contactPhone) as any,
      contact_whatsapp: valueOrNull(parsed.data.contactWhatsapp) as any,
      contact_email: valueOrNull(parsed.data.contactEmail) as any,
      status: parsed.data.status as any,
      adopted_at: parsed.data.status === "adopted" ? new Date().toISOString() : null,
      badges: badges
    };

    if (isAdmin && parsed.data.ownerId) {
      updateData.owner_id = parsed.data.ownerId;
    }

    const { error } = await supabase
      .from("pet_listings")
      .update(updateData)
      .eq("id", listingId);

  if (error) return { error: "No se pudo actualizar en la base de datos." };

  // Manejo de nuevas imágenes (opcional en edición)
  const files = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);
  const newImageAltTexts = parseStringArray(formData.get("newImageAltTexts"));
  const existingImagesState = parseExistingImagesState(formData.get("existingImagesState"));

  const { data: currentImagesData } = await supabase
    .from("pet_images")
    .select("id, storage_path, sort_order, alt_text")
    .eq("listing_id", listingId)
    .order("sort_order", { ascending: true });

  const currentImages = (currentImagesData ?? []) as Array<{
    id: string;
    storage_path: string;
    sort_order: number;
    alt_text: string | null;
  }>;

  const existingStateMap = new Map(existingImagesState.map((image) => [image.id, image]));
  const keptImages = currentImages.filter((image) => {
    const state = existingStateMap.get(image.id);
    return !state?.deleted;
  });
  const deletedImages = currentImages.filter((image) => {
    const state = existingStateMap.get(image.id);
    return state?.deleted;
  });
  const orderedKeptImages =
    existingImagesState.length > 0
      ? keptImages
          .slice()
          .sort((a, b) => (existingStateMap.get(a.id)?.sortOrder ?? a.sort_order) - (existingStateMap.get(b.id)?.sortOrder ?? b.sort_order))
      : keptImages;

  const maxImages = await maxImagesSetting();
  if (orderedKeptImages.length + files.length < 1) {
    return { error: "La publicación debe conservar al menos una imagen." };
  }
  if (orderedKeptImages.length + files.length > maxImages) {
    return { error: `Puedes subir hasta ${maxImages} imágenes en total.` };
  }

  if (deletedImages.length) {
    await removeImagesFromStorage(deletedImages.map((image) => image.storage_path).filter(Boolean));
    await supabase.from("pet_images").delete().in("id", deletedImages.map((image) => image.id));
  }

  for (const [index, image] of orderedKeptImages.entries()) {
    const state = existingStateMap.get(image.id);
    await supabase
      .from("pet_images")
      .update({
        sort_order: index,
        alt_text: valueOrNull(state?.altText?.trim() || image.alt_text || `${parsed.data.name} en adopción`) as string | null
      })
      .eq("id", image.id);
  }

  if (files.length > 0) {
    const imageRows = [];
    for (const [index, file] of files.entries()) {
      const storagePath = `${user.id}/${listingId}/${fileSafeName(file)}`;
      const upload = await supabase.storage.from("pet-images").upload(storagePath, file);
      if (upload.error) continue;

      const {
        data: { publicUrl }
      } = supabase.storage.from("pet-images").getPublicUrl(storagePath);
      imageRows.push({
        listing_id: listingId,
        storage_path: storagePath,
        public_url: publicUrl,
        alt_text: valueOrNull(newImageAltTexts[index]?.trim() || `${parsed.data.name} en adopción`) as string | null,
        sort_order: orderedKeptImages.length + index
      });
    }
    if (imageRows.length) await supabase.from("pet_images").insert(imageRows);
  }

  revalidatePath("/dashboard");
  revalidatePath("/explore");
  revalidatePath(`/pets/${current.slug}`);
  
  redirect(`/pets/${current.slug}`);
}
