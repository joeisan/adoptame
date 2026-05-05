"use server";

import { redirect } from "next/navigation";

import { registerSchema, loginSchema } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/server";

function redirectTarget(value: unknown) {
  const target = typeof value === "string" && value.startsWith("/") ? value : "/dashboard";
  return target;
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
    isOrganization: formData.get("isOrganization") === "on",
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
        wants_to_be_organization: parsed.data.isOrganization === true
      }
    }
  });

  if (error) return { error: error.message };

  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      full_name: parsed.data.fullName,
      display_name: parsed.data.fullName,
      role: "user",
      status: "active"
    });
  }

  redirect(redirectTarget(parsed.data.redirect));
}

export async function signOutAction() {
  const supabase = await createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}
