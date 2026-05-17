"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HeartHandshake, Search } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/constants";

export function HomeHero({
  isLoggedIn,
  stats,
  settings
}: {
  isLoggedIn: boolean;
  stats: { adoptions: number; volunteers: number; totalListings: number };
  settings?: { hero_title?: string | null; hero_subtitle?: string | null; hero_image_url?: string | null } | null;
}) {
  const { t } = useLanguage();
  const title = settings?.hero_title || t("hero.defaultTitle");
  const subtitle = settings?.hero_subtitle || `${SITE_CONFIG.name} ${t("hero.defaultSubtitle")}`;
  const bgImage = settings?.hero_image_url || "/home-img.webp";

  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden py-20 lg:min-h-screen">
      <div className="absolute inset-0 z-0 bg-black/10">
        <Image
          alt="Referencia visual cálida de adopción"
          className="h-full w-full object-cover brightness-[0.85] lg:brightness-100"
          fill
          priority
          src={bgImage}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/78 via-background/42 to-transparent sm:from-background/84 sm:via-background/56 lg:from-background lg:via-background/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/84 via-background/30 to-transparent lg:hidden" />
      </div>

      <div className="container-shell relative z-10">
        <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/50 backdrop-blur-md px-4 py-2 text-sm font-semibold text-primary shadow-sm border-primary/20">
            <HeartHandshake className="size-4" />
            {t("hero.badge")}
          </div>
          <div className="space-y-5">
            <h1 className="text-4xl font-black leading-[1.05] text-foreground drop-shadow-sm sm:text-6xl lg:text-7xl">{title}</h1>
            <p className="max-w-xl text-lg font-medium leading-8 text-muted-foreground drop-shadow-sm">{subtitle}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row pt-2">
            <Button asChild size="lg" className="rounded-full shadow-lg shadow-primary/20 px-8 h-14">
              <Link href="/explore">
                <Search className="size-5 mr-2" />
                {t("hero.searchPets")}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full bg-background/70 backdrop-blur-md border-primary/20 px-8 h-14 hover:bg-background/90">
              <Link href={isLoggedIn ? "/dashboard/listings/new" : "/register"}>
                {t("hero.postAdoption")}
                <ArrowRight className="size-5 ml-2" />
              </Link>
            </Button>
          </div>
          <dl className="grid max-w-lg grid-cols-3 gap-3 pt-4">
            {[
              [stats.adoptions, t("hero.adoptions")],
              [stats.volunteers, t("hero.volunteers")],
              [stats.totalListings, t("hero.listings")]
            ].map(([value, label]) => (
              <div className="rounded-2xl border border-primary/10 bg-background/60 p-4 text-center shadow-sm backdrop-blur-md transition-transform hover:scale-105" key={label}>
                <dt className="text-2xl font-black text-primary drop-shadow-sm">{value}</dt>
                <dd className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground drop-shadow-sm">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
