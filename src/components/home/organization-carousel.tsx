"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { HorizontalScroller } from "@/components/home/horizontal-scroller";
import type { OrganizationSummary } from "@/types/app";

export function OrganizationCarousel({ organizations }: { organizations: OrganizationSummary[] }) {
  return (
    <section className="container-shell py-8" id="organizaciones">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase text-primary">Nuestra Comunidad</p>
        <h2 className="mt-2 text-2xl font-black">Fundaciones / Organizaciones registradas</h2>
      </div>
      
      <HorizontalScroller 
        ariaLabel="organizaciones" 
        itemClassName="w-full sm:w-1/2 md:w-1/3"
      >
        {organizations.map((org) => (
          <Link
            key={org.id}
            href={`/perfil/${org.slug}`}
            className="flex h-12 items-center justify-center gap-2 rounded-full border bg-card px-6 shadow-sm transition hover:border-primary hover:bg-primary/5 active:scale-95"
          >
            <span className="font-bold truncate">{org.name}</span>
            {org.isVerified && (
              <ShieldCheck className="size-4 text-sky-500 fill-sky-50" />
            )}
          </Link>
        ))}
      </HorizontalScroller>
    </section>
  );
}
