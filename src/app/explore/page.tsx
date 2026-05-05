import type { Metadata } from "next";

import { ExploreFilters } from "@/components/pets/explore-filters";
import { EmptyState } from "@/components/pets/empty-state";
import { PetCard } from "@/components/pets/pet-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/permissions";
import { getExploreListings, getFavoriteListingIds } from "@/server/queries/listings";
import type { ExploreFilters as Filters } from "@/types/app";
import { ViewToggle } from "@/components/pets/view-toggle";
import { ExploreMap } from "@/components/pets/explore-map";

export const metadata: Metadata = {
  title: "Explorar mascotas",
  description: "Catálogo principal de mascotas en adopción en Panamá."
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseFilters(searchParams: Record<string, string | string[] | undefined>): Filters {
  const page = Number(one(searchParams.page) ?? "1");

  return {
    category: one(searchParams.category) || undefined,
    province: one(searchParams.province) || undefined,
    district: one(searchParams.district) || undefined,
    sex: one(searchParams.sex) || undefined,
    age: one(searchParams.age) || undefined,
    size: one(searchParams.size) || undefined,
    status: one(searchParams.status) || undefined,
    verified: one(searchParams.verified) || undefined,
    q: one(searchParams.q) || undefined,
    location: one(searchParams.location) === "nearby" ? "nearby" : undefined,
    lat: one(searchParams.lat) || undefined,
    lng: one(searchParams.lng) || undefined,
    radius: one(searchParams.radius) || undefined,
    sort: (one(searchParams.sort) as Filters["sort"]) || "recent",
    page: Number.isFinite(page) && page > 0 ? page : 1
  };
}

function pageHref(filters: Filters, page: number, view?: string) {
  const params = new URLSearchParams();

  Object.entries({ ...filters, page: String(page) }).forEach(([key, value]) => {
    if (value) params.set(key, String(value));
  });
  
  if (view) params.set("view", view);

  return `/explore?${params.toString()}`;
}

export default async function ExplorePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const view = one(params.view) || "grid";
  
  const [{ user }, result] = await Promise.all([getCurrentUser(), getExploreListings(filters)]);
  const favoriteIds = await getFavoriteListingIds(user?.id);
  const totalPages = Math.max(Math.ceil(result.count / result.pageSize), 1);

  return (
    <section className="container-shell py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase text-primary">Catálogo</p>
          <h1 className="mt-2 text-4xl font-black">Explorar mascotas</h1>
          <p className="mt-2 text-muted-foreground">
            {result.count} resultado{result.count === 1 ? "" : "s"} encontrado{result.count === 1 ? "" : "s"}
          </p>
        </div>
        <ViewToggle />
      </div>
      
      <ExploreFilters filters={filters} />
      
      {result.error ? (
        <Alert className="mt-6 border-destructive/30">
          <AlertTitle>No pudimos cargar el catálogo</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="mt-8">
        {result.listings.length ? (
          view === "map" ? (
            <ExploreMap listings={result.listings} />
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {result.listings.map((pet) => (
                  <PetCard canFavorite={Boolean(user)} isFavorited={favoriteIds.has(pet.id)} key={pet.id} pet={pet} />
                ))}
              </div>
              <div className="mt-8 flex justify-center gap-3">
                {result.page > 1 ? (
                  <Button asChild variant="outline">
                    <a href={pageHref(filters, result.page - 1, view)}>Anterior</a>
                  </Button>
                ) : null}
                {result.page < totalPages ? (
                  <Button asChild variant="outline">
                    <a href={pageHref(filters, result.page + 1, view)}>Siguiente</a>
                  </Button>
                ) : null}
              </div>
            </>
          )
        ) : (
          <EmptyState
            description="Prueba limpiar filtros o vuelve más tarde. Las publicaciones aparecerán aquí con Supabase conectado."
            title="No hay mascotas para esos filtros"
          />
        )}
      </div>
    </section>
  );
}
