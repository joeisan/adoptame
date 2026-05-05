import Link from "next/link";

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
  return (
    <section className="container-shell py-14">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase text-primary">Últimas mascotas</p>
          <h2 className="mt-2 text-3xl font-black">Recién publicadas</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Publicaciones activas ordenadas por fecha, con las más recientes primero.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/explore">Ver todas las mascotas</Link>
        </Button>
      </div>
      {error ? (
        <EmptyState description={error} title="No pudimos cargar las últimas publicaciones" />
      ) : pets.length ? (
        <HorizontalScroller ariaLabel="mascotas recién publicadas" itemClassName="w-[82vw] sm:w-[360px] lg:w-[340px]">
          {pets.map((pet) => (
            <PetCard canFavorite={canFavorite} isFavorited={favoriteIds.has(pet.id)} key={pet.id} pet={pet} />
          ))}
        </HorizontalScroller>
      ) : (
        <EmptyState
          description="Cuando conectes Supabase y cargues el seed, aquí aparecerán las mascotas publicadas."
          title="Aún no hay mascotas publicadas"
        />
      )}
    </section>
  );
}
