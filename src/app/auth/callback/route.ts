import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

function safeNext(value: string | null) {
  return value?.startsWith("/") ? value : "/dashboard";
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNext(requestUrl.searchParams.get("next"));
  const redirectUrl = new URL(next, requestUrl.origin);

  if (!code) {
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("error", "oauth");
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = await createClient();
  if (!supabase) {
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("error", "config");
    return NextResponse.redirect(redirectUrl);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("error", "oauth");
    return NextResponse.redirect(redirectUrl);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    const fullName = typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name : null;
    const displayName =
      fullName ??
      (typeof user.user_metadata.name === "string" ? user.user_metadata.name : null) ??
      user.email?.split("@")[0] ??
      null;
    const avatarUrl = typeof user.user_metadata.avatar_url === "string" ? user.user_metadata.avatar_url : null;

    await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      display_name: displayName,
      avatar_url: avatarUrl,
      email: user.email ?? null
    });
  }

  return NextResponse.redirect(redirectUrl);
}
