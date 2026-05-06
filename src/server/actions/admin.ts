"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";
import { banSchema, organizationLimitSchema, roleSchema } from "@/lib/validations/admin";
import type { Json } from "@/types/database";

async function requireSuperAdmin() {
  const { user, profile } = await getCurrentUser();
  const supabase = await createClient();

  if (!user || !profile || profile.role !== "super_admin" || profile.status !== "active" || !supabase) {
    return null;
  }

  return { user, supabase };
}

async function audit(adminId: string, action: string, metadata: Record<string, unknown>, targetUserId?: string, targetListingId?: string) {
  const supabase = await createClient();
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

  await admin.supabase.from("profiles").update({ role: parsed.data.role }).eq("id", parsed.data.userId);
  await audit(admin.user.id, "change_role", { role: parsed.data.role }, parsed.data.userId);
  revalidatePath("/super-admin/users");
  return { ok: true };
}

export async function banUserAction(formData: FormData) {
  const parsed = banSchema.safeParse({
    userId: formData.get("userId"),
    reason: formData.get("reason") ?? "",
    until: formData.get("until") ?? "",
    permanent: formData.get("permanent") === "on"
  });
  const admin = await requireSuperAdmin();

  if (!parsed.success || !admin) return { error: "No autorizado." };

  await admin.supabase
    .from("profiles")
    .update({
      status: "banned",
      banned_until: parsed.data.permanent || !parsed.data.until ? null : new Date(parsed.data.until).toISOString(),
      ban_reason: parsed.data.reason || null
    })
    .eq("id", parsed.data.userId);

  await audit(admin.user.id, "ban_user", parsed.data, parsed.data.userId);
  revalidatePath("/super-admin/users");
  return { ok: true };
}

export async function unbanUserAction(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const admin = await requireSuperAdmin();

  if (!userId || !admin) return { error: "No autorizado." };

  await admin.supabase.from("profiles").update({ status: "active", banned_until: null, ban_reason: null }).eq("id", userId);
  await audit(admin.user.id, "unban_user", {}, userId);
  revalidatePath("/super-admin/users");
  return { ok: true };
}

export async function setOrganizationVerificationAction(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");
  const isVerified = formData.get("isVerified") === "true";
  const admin = await requireSuperAdmin();

  if (!organizationId || !admin) return { error: "No autorizado." };

  await admin.supabase.from("organizations").update({ is_verified: isVerified }).eq("id", organizationId);
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

  await admin.supabase
    .from("organizations")
    .update({ listing_limit: parsed.data.listingLimit })
    .eq("id", parsed.data.organizationId);
  await audit(admin.user.id, "set_organization_limit", parsed.data);
  revalidatePath("/super-admin/organizations");
  return { ok: true };
}

export async function moderateListingAction(formData: FormData) {
  const listingId = String(formData.get("listingId") ?? "");
  const status = String(formData.get("status") ?? "");
  const admin = await requireSuperAdmin();

  if (!listingId || !admin || !["published", "suspended", "adopted", "deleted"].includes(status)) {
    return { error: "No autorizado." };
  }

  await admin.supabase
    .from("pet_listings")
    .update({
      status: status as "published" | "suspended" | "adopted" | "deleted",
      deleted_at: status === "deleted" ? new Date().toISOString() : null
    })
    .eq("id", listingId);
  await audit(admin.user.id, "moderate_listing", { status }, undefined, listingId);
  revalidatePath("/super-admin/listings");
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
  revalidatePath("/explore");
  return { ok: true };
}

export async function createCategoryAction(formData: FormData) {
  const admin = await requireSuperAdmin();
  if (!admin) return { error: "No autorizado." };

  const name = String(formData.get("name") ?? "");
  if (!name) return { error: "Nombre requerido." };

  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

  const { error } = await admin.supabase.from("categories").insert({
    name,
    slug,
    is_active: true
  });

  if (error) {
    if (error.code === "23505") return { error: "Esta categoría ya existe." };
    return { error: "Error al crear categoría." };
  }

  await audit(admin.user.id, "create_category", { name, slug });
  revalidatePath("/super-admin/settings");
  revalidatePath("/explore");
  return { ok: true };
}
export async function adminResetPasswordAction(formData: FormData) {
  await requireSuperAdmin();
  const userId = String(formData.get("userId") ?? "");
  const newPassword = "Adoptame123!"; // Contraseña temporal por defecto

  if (!userId) return { error: "ID de usuario requerido." };

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) return { error: error.message };

  return { ok: true, message: `Contraseña reseteada a: ${newPassword}` };
}
