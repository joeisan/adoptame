"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { registerSchema, loginSchema } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/server";

function redirectTarget(value: unknown) {
  const target = typeof value === "string" && value.startsWith("/") ? value : "/dashboard";
  return target;
}

async function siteOrigin() {
  // En desarrollo, forzamos el uso de localhost para evitar que Supabase use el Site URL de producción
  if (process.env.NODE_ENV === "development") {
    return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const proto = requestHeaders.get("x-forwarded-proto") ?? "https";

  if (host) {
    return `${proto}://${host}`;
  }

  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function signInAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    redirect: formData.get("redirect") ?? undefined
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  if (!supabase) return { error: "Configura Supabase para iniciar sesión." };

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password
  });

  if (error) return { error: error.message };

  redirect(redirectTarget(parsed.data.redirect));
}

export async function signUpAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp"),
    isOrganization: formData.get("isOrganization") === "on",
    organizationType: formData.get("organizationType") ?? undefined,
    redirect: formData.get("redirect") ?? undefined
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  if (!supabase) return { error: "Configura Supabase para registrarte." };

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        wants_to_be_organization: parsed.data.isOrganization === true,
        organization_type: parsed.data.organizationType
      }
    }
  });

  if (error) return { error: error.message };

  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      full_name: parsed.data.fullName,
      display_name: parsed.data.fullName,
      phone: parsed.data.phone,
      whatsapp: parsed.data.whatsapp,
      organization_type: parsed.data.organizationType || null,
      role: "user",
      status: "active"
    });
  }

  redirect(redirectTarget(parsed.data.redirect));
}

export async function signInWithGoogleAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "Configura Supabase para iniciar sesión con Google." };

  const redirectTo = redirectTarget(formData.get("redirect"));
  const origin = await siteOrigin();
  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("next", redirectTo);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
      queryParams: {
        access_type: "offline",
        prompt: "consent"
      }
    }
  });

  if (error || !data.url) return { error: error?.message ?? "No se pudo iniciar sesión con Google." };

  return { url: data.url };
}

export async function signOutAction() {
  const supabase = await createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}

export async function updatePasswordAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!password || password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden." };
  }

  const supabase = await createClient();
  if (!supabase) return { error: "Error de conexión." };

  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) return { error: error.message };

  return { ok: true };
}
