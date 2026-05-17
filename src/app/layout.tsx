import type { Metadata } from "next";
import { Toaster } from "sonner";

import "@/app/globals.css";
import { SiteFooter } from "@/components/layout/footer";
import { SiteHeader } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SITE_CONFIG } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site-url";
import { LanguageProvider } from "@/lib/language-context";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_CONFIG.name} | Adopción animal en Panamá`,
    template: `%s | ${SITE_CONFIG.name}`
  },
  description: SITE_CONFIG.description,
  openGraph: {
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    type: "website",
    locale: "es_PA"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-PA">
      <body className="pb-16 md:pb-0">
        <LanguageProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <MobileBottomNav />
          <Toaster richColors position="top-right" />
        </LanguageProvider>
      </body>
    </html>
  );
}
