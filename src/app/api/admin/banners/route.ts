import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { normalizeDisplayOrder, normalizeOptionalText, requireSuperAdmin, uploadBannerImage } from "@/server/actions/banners";

function redirectWithMessage(request: Request, type: "error" | "success", message: string) {
  const referer = request.headers.get("referer");
  const origin = request.headers.get("origin");
  const baseUrl = referer ?? origin ?? request.url;
  const url = new URL(baseUrl);

  url.pathname = "/super-admin/banners";
  url.search = "";
  url.searchParams.set(type, message);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const admin = await requireSuperAdmin();
  if (!admin) {
    return redirectWithMessage(request, "error", "No autorizado.");
  }

  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "save");
  const id = String(formData.get("id") ?? "").trim();

  if (intent === "delete") {
    if (!id) {
      return redirectWithMessage(request, "error", "ID de banner requerido.");
    }

    const { error } = await admin.supabase.from("home_banners").delete().eq("id", id);
    if (error) {
      console.error("Error deleting banner:", error);
      return redirectWithMessage(request, "error", error.message);
    }

    revalidatePath("/");
    revalidatePath("/super-admin/banners");
    return redirectWithMessage(request, "success", "Banner eliminado.");
  }

  if (intent === "toggle") {
    if (!id) {
      return redirectWithMessage(request, "error", "ID de banner requerido.");
    }

    const isActive = String(formData.get("is_active") ?? "false") === "true";
    const { error } = await admin.supabase.from("home_banners").update({ is_active: isActive }).eq("id", id);
    if (error) {
      console.error("Error toggling banner:", error);
      return redirectWithMessage(request, "error", error.message);
    }

    revalidatePath("/");
    revalidatePath("/super-admin/banners");
    return redirectWithMessage(request, "success", isActive ? "Banner activado." : "Banner desactivado.");
  }

  const imageFile = formData.get("image_file");
  let imageUrl = String(formData.get("image_url") ?? "").trim();

  if (!id && (!(imageFile instanceof File) || imageFile.size === 0)) {
    return redirectWithMessage(request, "error", "Se requiere una imagen.");
  }

  if (imageFile instanceof File && imageFile.size > 0) {
    const uploadResult = await uploadBannerImage(imageFile, "banners");
    if ("error" in uploadResult) {
      return redirectWithMessage(request, "error", uploadResult.error ?? "No se pudo subir la imagen.");
    }

    imageUrl = uploadResult.publicUrl;
  }

  if (!imageUrl) {
    return redirectWithMessage(request, "error", "Se requiere una imagen para el banner.");
  }

  const payload = {
    image_url: imageUrl,
    link_url: normalizeOptionalText(formData.get("link_url")),
    title: normalizeOptionalText(formData.get("title")),
    is_active: String(formData.get("is_active") ?? "true") === "true",
    display_order: normalizeDisplayOrder(formData.get("display_order"))
  };

  const { error } = id
    ? await admin.supabase.from("home_banners").update(payload).eq("id", id)
    : await admin.supabase.from("home_banners").insert(payload);

  if (error) {
    console.error("Error saving banner:", error);
    return redirectWithMessage(request, "error", error.message);
  }

  revalidatePath("/");
  revalidatePath("/super-admin/banners");
  return redirectWithMessage(request, "success", id ? "Banner actualizado." : "Banner creado.");
}
