import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HeartHandshake, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/constants";

export function HomeHero({
  isLoggedIn,
  stats
}: {
  isLoggedIn: boolean;
  stats: { adoptions: number; volunteers: number; totalListings: number };
}) {
  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden py-20 lg:min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          alt="Referencia visual cálida de adopción"
          className="h-full w-full object-cover brightness-[0.8] lg:brightness-100"
          fill
          priority
          src="/home-img.webp"
        />
        {/* Gradients for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent lg:via-background/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent lg:hidden" />
      </div>

      <div className="container-shell relative z-10">
        <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/50 backdrop-blur-md px-4 py-2 text-sm font-semibold text-primary shadow-sm border-primary/20">
            <HeartHandshake className="size-4" />
            Red de adopción responsable en Panamá
          </div>
          <div className="space-y-5">
            <h1 className="text-4xl font-black leading-[1.05] sm:text-6xl lg:text-7xl drop-shadow-sm">
              Encuentra un nuevo hogar para quienes más lo necesitan.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-muted-foreground font-medium">
              {SITE_CONFIG.name} conecta personas, rescatistas y organizaciones con animales en adopción en todo Panamá.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row pt-2">
            <Button asChild size="lg" className="rounded-full shadow-lg shadow-primary/20 px-8 h-14">
              <Link href="/explore">
                <Search className="size-5 mr-2" />
                Buscar mascotas
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full bg-background/50 backdrop-blur-md px-8 h-14">
              <Link href={isLoggedIn ? "/dashboard/listings/new" : "/register"}>
                Publicar en adopción
                <ArrowRight className="size-5 ml-2" />
              </Link>
            </Button>
          </div>
          <dl className="grid max-w-lg grid-cols-3 gap-3 pt-4">
            {[
              [stats.adoptions, "adopciones"],
              [stats.volunteers, "voluntarios"],
              [stats.totalListings, "publicaciones"]
            ].map(([value, label]) => (
              <div className="rounded-2xl border border-primary/10 bg-background/40 backdrop-blur-md p-4 text-center transition-transform hover:scale-105" key={label}>
                <dt className="text-2xl font-black text-primary">{value}</dt>
                <dd className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
