"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/permissions";
import { slugify } from "@/lib/utils";

function safeRedirect(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.startsWith("/") ? value : null;
}

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidPhone(value: string) {
  return /^\+?(?:507)?[\s-]?\d{4}[\s-]?\d{4}$/.test(value);
}

async function nextOrganizationSlug(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  organizationName: string,
  currentOrganizationId?: string
) {
  const baseSlug = slugify(organizationName);
  if (!baseSlug) return null;

  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const { data: existing } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!existing || existing.id === currentOrganizationId) {
      return slug;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

export async function updateProfileAction(formData: FormData) {
  const { user, profile } = await getCurrentUser();
  if (!user) return { error: "No autorizado." };

  const displayName = clean(formData.get("displayName"));
  const description = clean(formData.get("description"));
  const phone = clean(formData.get("phone"));
  const whatsapp = clean(formData.get("whatsapp"));
  const normalizedWhatsapp = whatsapp || phone;
  const province = clean(formData.get("province"));
  const district = clean(formData.get("district"));
  const email = clean(formData.get("email"));
  const website = clean(formData.get("website"));
  const facebook = clean(formData.get("facebook"));
  const instagram = clean(formData.get("instagram"));
  const youtube = clean(formData.get("youtube"));
  const linkedin = clean(formData.get("linkedin"));
  const telegram = clean(formData.get("telegram"));
  const organizationName = clean(formData.get("organizationName"));
  const organizationType = clean(formData.get("organizationType"));
  const redirectTo = safeRedirect(formData.get("redirect"));

  if (displayName.length < 2) return { error: "Escribe un nombre a mostrar." };
  if (!phone || !isValidPhone(phone)) return { error: "Ingresa un teléfono válido de 8 dígitos (Obligatorio)." };
  if (normalizedWhatsapp && !isValidPhone(normalizedWhatsapp)) return { error: "Ingresa un WhatsApp válido de 8 dígitos." };

  const supabase = await createClient();
  if (!supabase) return { error: "Error de conexión." };
  const { data: organizationData } = await supabase
    .from("organizations")
    .select("id,name,type,slug")
    .eq("owner_id", user.id)
    .maybeSingle();
  const organization = organizationData as { id: string; name: string | null; type: string | null; slug: string | null } | null;
  const isOrganizationProfile = profile?.role === "organization" || Boolean(organization?.id || organizationType || organizationName);
  const nextOrganizationName = organizationName || organization?.name || "";
  const nextOrganizationType = organizationType || organization?.type || "";

  if (isOrganizationProfile && !nextOrganizationName) {
    return { error: "Escribe el nombre de la organización o fundación." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName || null,
      description: description || null,
      phone: phone || null,
      whatsapp: normalizedWhatsapp || null,
      province: province || null,
      district: district || null,
      email: email || null,
      website_url: website || null,
      facebook_url: facebook || null,
      instagram_url: instagram || null,
      youtube_url: youtube || null,
      linkedin_url: linkedin || null,
      telegram_url: telegram || null,
      organization_name: isOrganizationProfile ? nextOrganizationName || null : null,
      organization_type: isOrganizationProfile ? nextOrganizationType || null : null,
      updated_at: new Date().toISOString()
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  if (profile?.role === "organization" || organization?.id) {
    const organizationSlug = nextOrganizationName
      ? await nextOrganizationSlug(supabase, nextOrganizationName, organization?.id)
      : organization?.slug || null;
    const { error: organizationError } = await supabase
      .from("organizations")
      .update({
        name: nextOrganizationName || undefined,
        type: nextOrganizationType || undefined,
        slug: organizationSlug || undefined
      })
      .eq("owner_id", user.id);

    if (organizationError) {
      return { error: organizationError.message };
    }
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/perfil");
  revalidatePath("/explore");
  revalidatePath("/pets/[slug]", "page");

  if (redirectTo) {
    redirect(redirectTo);
  }

  return { success: true };
}
