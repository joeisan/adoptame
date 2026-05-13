"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";

export async function toggleFavoriteAction(formData: FormData) {
  const listingId = String(formData.get("listingId") ?? "");
  const nextState = String(formData.get("nextState") ?? "favorite");
  const { user } = await getCurrentUser();

  if (!listingId || !user) return { error: "Inicia sesión para guardar favoritos." };
  if (listingId.startsWith("dummy-")) return { ok: true }; // Silent ignore for dummies
  const supabase = await createClient();
  if (!supabase) return { error: "Configura Supabase para guardar favoritos." };

  if (nextState === "remove") {
    const { error } = await supabase.from("user_favorites").delete().eq("user_id", user.id).eq("listing_id", listingId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("user_favorites").insert({ user_id: user.id, listing_id: listingId });
    if (error && error.code !== "23505") return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath("/favorites");
  revalidatePath("/pets/[slug]", "layout");
  return { ok: true };
}
