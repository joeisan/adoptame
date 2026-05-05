"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseBrowserConfig } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

export function createClient() {
  const config = getSupabaseBrowserConfig();

  if (!config) {
    throw new Error("Supabase no está configurado. Revisa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  }

  return createBrowserClient<Database>(config.url, config.publishableKey);
}
