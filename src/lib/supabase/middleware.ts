import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { getSupabaseBrowserConfig } from "./config";
import type { Database } from "../../types/database";

export async function updateSession(request: NextRequest) {
  const config = getSupabaseBrowserConfig();
  let response = NextResponse.next({ request });

  if (!config) {
    return response;
  }

  const supabase = createServerClient<Database>(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/super-admin");
  const isFavorites = pathname.startsWith("/favorites");

  if ((isDashboard || isAdmin || isFavorites) && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAdmin && user) {
    const { data: profileData } = await supabase.from("profiles").select("role,status").eq("id", user.id).maybeSingle();
    const profile = profileData as unknown as { role: string; status: string } | null;

    if (profile?.role !== "super_admin" || profile.status !== "active") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (user && (isDashboard || isFavorites) && pathname !== "/dashboard/profile") {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name,display_name,phone,whatsapp")
      .eq("id", user.id)
      .maybeSingle();
    const profile = profileData as unknown as {
      full_name: string | null;
      display_name: string | null;
      phone: string | null;
      whatsapp: string | null;
    } | null;
    const hasName = Boolean((profile?.display_name || profile?.full_name)?.trim());
    const hasContact = Boolean(profile?.phone?.trim() && profile?.whatsapp?.trim());

    if (!hasName || !hasContact) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard/profile";
      redirectUrl.searchParams.set("onboarding", "1");
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}
