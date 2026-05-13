import { SITE_CONFIG } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export async function getMaxImagesPerListing() {
  const supabase = await createClient();
  if (!supabase) return SITE_CONFIG.defaultMaxImages;

  const { data } = await supabase.from("app_settings").select("value").eq("key", "max_images_per_listing").maybeSingle();
  return typeof data?.value === "number" ? data.value : SITE_CONFIG.defaultMaxImages;
}
