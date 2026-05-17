import { SITE_CONFIG } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { FooterClient } from "@/components/layout/footer-client";

const SOCIAL_SETTINGS = [
  ["social_instagram", "Instagram"],
  ["social_facebook", "Facebook"],
  ["social_tiktok", "TikTok"],
  ["social_youtube", "YouTube"],
  ["social_x", "X"]
] as const;

function stringSetting(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export async function SiteFooter() {
  const supabase = await createClient();
  const { data: settings } = supabase
    ? await supabase.from("app_settings").select("key, value").in("key", [
        "admin_contact_email",
        "admin_contact_phone",
        ...SOCIAL_SETTINGS.map(([key]) => key)
      ])
    : { data: null };

  const getSetting = (key: string, fallback = "") => {
    const setting = settings?.find((item) => item.key === key);
    return stringSetting(setting?.value, fallback);
  };
  const contactEmail = getSetting("admin_contact_email", SITE_CONFIG.supportEmail);
  const contactPhone = getSetting("admin_contact_phone", SITE_CONFIG.supportPhone);
  const socialLinks = SOCIAL_SETTINGS.map(([key, label]) => ({
    label,
    href: getSetting(key)
  })).filter((item) => item.href);

  return (
    <FooterClient 
      contactEmail={contactEmail} 
      contactPhone={contactPhone} 
      socialLinks={socialLinks} 
    />
  );
}
