"use server";

import { revalidatePath } from "next/cache";
import { randomInt } from "node:crypto";

import { getCurrentUser } from "@/lib/permissions";
import { normalizeCategoryIcon } from "@/lib/category-icons";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { organizationLimitSchema, roleSchema } from "@/lib/validations/admin";
import type { Json } from "@/types/database";

async function requireSuperAdmin() {
  const { user, profile } = await getCurrentUser();
  const supabase = createAdminClient();

  if (!user || !profile || profile.role !== "super_admin" || profile.status !== "active" || !supabase) {
    return null;
  }

  return { user, supabase };
}

async function audit(adminId: string, action: string, metadata: Record<string, unknown>, targetUserId?: string, targetListingId?: string) {
  const supabase = createAdminClient() ?? (await createClient());
  if (!supabase) return;

  await supabase.from("admin_actions").insert({
    admin_id: adminId,
    action,
    metadata: metadata as Json,
    target_user_id: targetUserId,
    target_listing_id: targetListingId
  });
}

export async function changeUserRoleAction(formData: FormData) {
  const parsed = roleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role")
  });
  const admin = await requireSuperAdmin();

  if (!parsed.success || !admin) return { error: "No autorizado." };

  const updateData =
    parsed.data.role === "super_admin"
      ? { role: parsed.data.role, status: "active" as const }
      : { role: parsed.data.role };
  const { error } = await admin.supabase.from("profiles").update(updateData).eq("id", parsed.data.userId);
  if (error) return { error: error.message };
  await audit(admin.user.id, "change_role", { role: parsed.data.role }, parsed.data.userId);
  revalidatePath("/super-admin/users");
  revalidatePath("/super-admin", "layout");
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function setOrganizationVerificationAction(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");
  const isVerified = formData.get("isVerified") === "true";
  const admin = await requireSuperAdmin();

  if (!organizationId || !admin) return { error: "No autorizado." };

  const { error } = await admin.supabase.from("organizations").update({ is_verified: isVerified }).eq("id", organizationId);
  if (error) return { error: error.message };
  await audit(admin.user.id, "set_organization_verification", { isVerified });
  revalidatePath("/super-admin/organizations");
  revalidatePath("/explore");
  return { ok: true };
}

export async function setOrganizationLimitAction(formData: FormData) {
  const parsed = organizationLimitSchema.safeParse({
    organizationId: formData.get("organizationId"),
    listingLimit: formData.get("listingLimit")
  });
  const admin = await requireSuperAdmin();

  if (!parsed.success || !admin) return { error: "No autorizado." };

  const { error } = await admin.supabase
    .from("organizations")
    .update({ listing_limit: parsed.data.listingLimit })
    .eq("id", parsed.data.organizationId);
  if (error) return { error: error.message };
  await audit(admin.user.id, "set_organization_limit", parsed.data);
  revalidatePath("/super-admin/organizations");
  return { ok: true };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateTemporaryPassword(length = 14) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  return Array.from({ length }, () => chars[randomInt(0, chars.length)]).join("");
}

export async function approveOrganizationRequestAction(formData: FormData) {
  const admin = await requireSuperAdmin();
  if (!admin) return { error: "No autorizado." };

  const userId = String(formData.get("userId") ?? "");
  const organizationName = String(formData.get("organizationName") ?? "").trim();
  const organizationType = String(formData.get("organizationType") ?? "Organización").trim() || "Organización";

  if (!userId || !organizationName) {
    return { error: "Faltan datos para aprobar la solicitud." };
  }

  const baseSlug = slugify(organizationName);
  if (!baseSlug) return { error: "No se pudo generar un slug válido para la organización." };

  let slug = baseSlug;
  let suffix = 1;
  while (true) {
    const { data: existing } = await admin.supabase.from("organizations").select("id").eq("slug", slug).maybeSingle();
    if (!existing) break;
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const { error: insertError } = await admin.supabase.from("organizations").insert({
    owner_id: userId,
    name: organizationName,
    slug,
    type: organizationType,
    is_verified: false
  });

  if (insertError) return { error: insertError.message };

  const { error: profileError } = await admin.supabase
    .from("profiles")
    .update({
      role: "organization",
      organization_name: organizationName,
      organization_type: organizationType
    })
    .eq("id", userId);

  if (profileError) return { error: profileError.message };

  const adminClient = (await import("@/lib/supabase/admin")).createAdminClient();
  if (adminClient) {
    await adminClient.auth.admin.updateUserById(userId, {
      user_metadata: {
        wants_to_be_organization: false,
        organization_name: organizationName,
        organization_type: organizationType
      }
    });
  }

  await audit(admin.user.id, "approve_organization_request", { userId, organizationName, organizationType, slug }, userId);
  revalidatePath("/super-admin/organizations");
  revalidatePath("/super-admin/users");
  revalidatePath("/dashboard");
  revalidatePath("/explore");
  return { ok: true };
}

export async function moderateListingAction(formData: FormData) {
  const listingId = String(formData.get("listingId") ?? "");
  const status = String(formData.get("status") ?? "");
  const admin = await requireSuperAdmin();

  if (!listingId || !admin || !["published", "suspended", "adopted", "deleted"].includes(status)) {
    return { error: "No autorizado." };
  }

  const { error } = await admin.supabase
    .from("pet_listings")
    .update({
      status: status as "published" | "suspended" | "adopted" | "deleted",
      deleted_at: status === "deleted" ? new Date().toISOString() : null
    })
    .eq("id", listingId);
  if (error) return { error: error.message };
  await audit(admin.user.id, "moderate_listing", { status }, undefined, listingId);
  revalidatePath("/super-admin/listings");
  revalidatePath("/explore");
  return { ok: true };
}

export async function deleteListingPermanentlyAction(formData: FormData) {
  const admin = await requireSuperAdmin();
  if (!admin) return { error: "No autorizado." };

  const listingId = String(formData.get("listingId") ?? "");
  if (!listingId) return { error: "ID de publicación requerido." };

  const [{ data: listing }, { data: images }] = await Promise.all([
    admin.supabase.from("pet_listings").select("id,slug").eq("id", listingId).maybeSingle(),
    admin.supabase.from("pet_images").select("id,storage_path").eq("listing_id", listingId)
  ]);

  if (!listing) return { error: "Publicación no encontrada." };

  const storagePaths = (images ?? []).map((image) => image.storage_path).filter(Boolean);
  const adminClient = createAdminClient();
  if (adminClient && storagePaths.length) {
    await adminClient.storage.from("pet-images").remove(storagePaths);
  }

  await admin.supabase.from("admin_actions").update({ target_listing_id: null }).eq("target_listing_id", listingId);
  const { error } = await admin.supabase.from("pet_listings").delete().eq("id", listingId);

  if (error) return { error: error.message };

  await audit(admin.user.id, "delete_listing_permanently", { listingId, slug: listing.slug });
  revalidatePath("/super-admin/listings");
  revalidatePath("/dashboard");
  revalidatePath("/explore");
  return { ok: true };
}

export async function changeListingOwnerAction(formData: FormData) {
  const admin = await requireSuperAdmin();
  if (!admin) return { error: "No autorizado." };

  const listingId = String(formData.get("listingId") ?? "");
  const ownerId = String(formData.get("ownerId") ?? "");

  if (!listingId || !ownerId) return { error: "Datos requeridos faltantes." };

  const { error } = await admin.supabase
    .from("pet_listings")
    .update({ owner_id: ownerId })
    .eq("id", listingId);

  if (error) return { error: "Error al cambiar dueño." };

  await audit(admin.user.id, "change_listing_owner", { ownerId }, undefined, listingId);
  revalidatePath("/super-admin/listings");
  return { ok: true };
}

export async function deleteOrganizationAction(formData: FormData) {
  const admin = await requireSuperAdmin();
  if (!admin) return { error: "No autorizado." };

  const organizationId = String(formData.get("organizationId") ?? "");
  if (!organizationId) return { error: "ID de organización requerido." };

  const { data: organization } = await admin.supabase
    .from("organizations")
    .select("id, owner_id, name")
    .eq("id", organizationId)
    .maybeSingle();

  if (!organization) return { error: "Organización no encontrada." };

  const { error: deleteError } = await admin.supabase.from("organizations").delete().eq("id", organizationId);
  if (deleteError) return { error: deleteError.message };

  await admin.supabase
    .from("profiles")
    .update({
      role: "user",
      organization_name: null,
      organization_type: null
    })
    .eq("id", organization.owner_id)
    .eq("role", "organization");

  const adminClient = createAdminClient();
  if (adminClient) {
    const { data: authUser } = await adminClient.auth.admin.getUserById(organization.owner_id);
    const currentMetadata = (authUser.user?.user_metadata ?? {}) as Record<string, unknown>;
    await adminClient.auth.admin.updateUserById(organization.owner_id, {
      user_metadata: {
        ...currentMetadata,
        wants_to_be_organization: false,
        organization_name: null,
        organization_type: null
      }
    });
  }

  await audit(admin.user.id, "delete_organization", { organizationId, name: organization.name }, organization.owner_id);
  revalidatePath("/super-admin/organizations");
  revalidatePath("/super-admin/users");
  revalidatePath("/dashboard");
  revalidatePath("/explore");
  return { ok: true };
}

export async function updateAppSettingsAction(formData: FormData) {
  const admin = await requireSuperAdmin();
  if (!admin) return { error: "No autorizado." };

  const keys = [
    "regular_listing_limit",
    "max_images_per_listing",
    "admin_contact_whatsapp",
    "admin_contact_email",
    "admin_contact_phone",
    "social_instagram",
    "social_facebook",
    "social_tiktok",
    "social_youtube",
    "social_x"
  ];
  
  for (const key of keys) {
    const value = formData.get(key);
    if (value !== null) {
      let finalValue: Json = String(value);
      if (key.includes("limit") || key.includes("images")) {
        finalValue = parseInt(String(value), 10);
      }
      
      await admin.supabase.from("app_settings").upsert({ 
        key, 
        value: finalValue,
        updated_by: admin.user.id,
        updated_at: new Date().toISOString()
      });
    }
  }

  await audit(admin.user.id, "update_app_settings", { keys });
  revalidatePath("/super-admin/settings");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function toggleCategoryAction(formData: FormData) {
  const admin = await requireSuperAdmin();
  if (!admin) return { error: "No autorizado." };

  const categoryId = String(formData.get("categoryId") ?? "");
  const isActive = formData.get("isActive") === "true";

  if (!categoryId) return { error: "ID de categoría requerido." };

  await admin.supabase.from("categories").update({ is_active: isActive }).eq("id", categoryId);
  
  await audit(admin.user.id, "toggle_category", { categoryId, isActive });
  revalidatePath("/super-admin/settings");
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/explore");
  return { ok: true };
}

export async function createCategoryAction(formData: FormData) {
  const admin = await requireSuperAdmin();
  if (!admin) return { error: "No autorizado." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Nombre requerido." };

  const icon = normalizeCategoryIcon(formData.get("icon"));
  if (icon === undefined) return { error: "Icono inválido." };

  const slug = slugify(name);
  if (!slug) return { error: "No se pudo generar un slug válido." };

  const { error } = await admin.supabase.from("categories").insert({
    name,
    slug,
    icon,
    is_active: true
  });

  if (error) {
    if (error.code === "23505") return { error: "Esta categoría ya existe." };
    return { error: "Error al crear categoría." };
  }

  await audit(admin.user.id, "create_category", { name, slug, icon });
  revalidatePath("/super-admin/settings");
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/explore");
  return { ok: true };
}

export async function updateCategoryIconAction(formData: FormData) {
  const admin = await requireSuperAdmin();
  if (!admin) return { error: "No autorizado." };

  const categoryId = String(formData.get("categoryId") ?? "");
  const icon = normalizeCategoryIcon(formData.get("icon"));

  if (!categoryId) return { error: "ID de categoría requerido." };
  if (icon === undefined) return { error: "Icono inválido." };

  const { error } = await admin.supabase.from("categories").update({ icon }).eq("id", categoryId);
  if (error) return { error: "No se pudo actualizar el icono." };

  await audit(admin.user.id, "update_category_icon", { categoryId, icon });
  revalidatePath("/super-admin/settings");
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/explore");
  return { ok: true };
}
export async function adminResetPasswordAction(formData: FormData) {
  const admin = await requireSuperAdmin();
  const userId = String(formData.get("userId") ?? "");

  if (!admin) return { error: "No autorizado." };
  if (!userId) return { error: "ID de usuario requerido." };

  const supabase = createAdminClient();
  if (!supabase) return { error: "Cliente administrativo no disponible." };
  const newPassword = generateTemporaryPassword();

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) return { error: error.message };

  return { ok: true, message: `Contraseña reseteada a: ${newPassword}` };
}

export async function deleteUserAction(formData: FormData) {
  const admin = await requireSuperAdmin();
  if (!admin) return { error: "No autorizado." };

  const userId = String(formData.get("userId") ?? "");
  if (!userId) return { error: "ID de usuario requerido." };
  if (userId === admin.user.id) return { error: "No puedes eliminar tu propia cuenta desde aquí." };

  const { data: targetProfile } = await admin.supabase
    .from("profiles")
    .select("id, role, email")
    .eq("id", userId)
    .maybeSingle();

  if (!targetProfile) return { error: "Usuario no encontrado." };
  if (targetProfile.role === "super_admin") return { error: "No se puede eliminar otro super admin desde este panel." };

  const { data: userListings } = await admin.supabase.from("pet_listings").select("id").eq("owner_id", userId);
  const listingIds = (userListings ?? []).map((listing) => listing.id);
  const { data: listingImages } = listingIds.length
    ? await admin.supabase.from("pet_images").select("storage_path, listing_id").in("listing_id", listingIds)
    : { data: [] as Array<{ storage_path: string; listing_id: string }> };

  const storagePaths = (listingImages ?? []).map((image) => image.storage_path).filter(Boolean);
  const adminClient = createAdminClient();
  if (!adminClient) return { error: "Cliente administrativo no disponible." };
  if (storagePaths.length) {
    await adminClient.storage.from("pet-images").remove(storagePaths);
  }

  await admin.supabase.from("admin_actions").update({ target_user_id: null }).eq("target_user_id", userId);
  await admin.supabase.from("app_settings").update({ updated_by: null }).eq("updated_by", userId);
  await admin.supabase.from("reports").update({ resolved_by: null }).eq("resolved_by", userId);

  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  await audit(admin.user.id, "delete_user", { userId, email: targetProfile.email });
  revalidatePath("/super-admin/users");
  revalidatePath("/super-admin/listings");
  revalidatePath("/super-admin/organizations");
  revalidatePath("/dashboard");
  revalidatePath("/explore");
  return { ok: true };
}
