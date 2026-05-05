import type { Metadata } from "next";
import { Toaster } from "sonner";

import "@/app/globals.css";
import { SiteFooter } from "@/components/layout/footer";
import { SiteHeader } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
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
      <body className="pb-24 md:pb-0">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <MobileBottomNav />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
