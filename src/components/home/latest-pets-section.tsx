"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

import { EmptyState } from "@/components/pets/empty-state";
import { HorizontalScroller } from "@/components/home/horizontal-scroller";
import { PetCard } from "@/components/pets/pet-card";
import { Button } from "@/components/ui/button";
import type { PetCardListing } from "@/types/app";

export function LatestPetsSection({
  pets,
  error,
  canFavorite = false,
  favoriteIds = new Set<string>()
}: {
  pets: PetCardListing[];
  error?: string | null;
  canFavorite?: boolean;
  favoriteIds?: Set<string>;
}) {
  const { t } = useLanguage();
  return (
    <section className="container-shell py-14">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase text-primary">{t("home.latestPets")}</p>
          <h2 className="mt-2 text-3xl font-black">{t("home.recentlyPosted")}</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {t("home.recentlyPostedDesc")}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/explore">{t("home.viewAllPets")}</Link>
        </Button>
      </div>
      {error ? (
        <EmptyState description={error} title={t("home.errorLoading")} />
      ) : pets.length ? (
        <HorizontalScroller ariaLabel="mascotas recién publicadas" itemClassName="w-[82vw] sm:w-[360px] lg:w-[340px]">
          {pets.map((pet) => (
            <PetCard canFavorite={canFavorite} isFavorited={favoriteIds.has(pet.id)} key={pet.id} pet={pet} />
          ))}
        </HorizontalScroller>
      ) : (
        <EmptyState
          description={t("home.noPetsYetDesc")}
          title={t("home.noPetsYet")}
        />
      )}
    </section>
  );
}
