import Link from "next/link";

import { SITE_CONFIG } from "@/lib/constants";
import { Logo } from "@/components/layout/logo";
import { createClient } from "@/lib/supabase/server";

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
    <footer className="mt-24 border-t bg-card/70">
      <div className="container-shell grid gap-10 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            {SITE_CONFIG.description} Plataforma enfocada en Panamá.
          </p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold">Enlaces</h2>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <Link href="/explore">Explorar</Link>
            <Link href="/dashboard/listings/new">Publicar</Link>
            <Link href="/register">Registro</Link>
            <Link href="/login">Iniciar sesión</Link>
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold">Contacto</h2>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            <a href={`tel:${contactPhone.replace(/\s/g, "")}`}>{contactPhone}</a>
          </div>
          {socialLinks.length ? (
            <div className="mt-5">
              <h2 className="mb-3 text-sm font-bold">Redes</h2>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                {socialLinks.map((item) => (
                  <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="rounded-full border px-3 py-1.5 transition hover:border-primary hover:text-primary">
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
