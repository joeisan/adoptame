import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { saveSiteSettings } from "@/server/actions/settings";

function redirectWithMessage(request: Request, type: "hero_error" | "hero_success", message: string) {
  const referer = request.headers.get("referer");
  const origin = request.headers.get("origin");
  const baseUrl = referer ?? origin ?? request.url;
  const url = new URL(baseUrl);

  url.pathname = "/super-admin/settings";
  url.search = "";
  url.searchParams.set(type, message);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const result = await saveSiteSettings(formData);

  if (result.error) {
    return redirectWithMessage(request, "hero_error", result.error);
  }

  revalidatePath("/");
  revalidatePath("/super-admin/settings");
  return redirectWithMessage(request, "hero_success", "Configuración del inicio actualizada.");
}
