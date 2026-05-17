"use client";

import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { Logo } from "@/components/layout/logo";
import { useLanguage } from "@/lib/language-context";

type FooterClientProps = {
  contactEmail: string;
  contactPhone: string;
  socialLinks: { label: string; href: string }[];
};

export function FooterClient({ contactEmail, contactPhone, socialLinks }: FooterClientProps) {
  const { t } = useLanguage();

  return (
    <footer className="mt-24 border-t bg-card/70">
      <div className="container-shell grid gap-10 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            {SITE_CONFIG.description} {t("home.platformFocused")}
          </p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold">{t("footer.links")}</h2>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <Link href="/explore">{t("footer.explore")}</Link>
            <Link href="/dashboard/listings/new">{t("footer.post")}</Link>
            <Link href="/register">{t("footer.register")}</Link>
            <Link href="/login">{t("footer.signIn")}</Link>
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold">{t("footer.contact")}</h2>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            <a href={`tel:${contactPhone.replace(/\s/g, "")}`}>{contactPhone}</a>
          </div>
          {socialLinks.length ? (
            <div className="mt-5">
              <h2 className="mb-3 text-sm font-bold">{t("footer.social")}</h2>
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
