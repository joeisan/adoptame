import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { EmptyState } from "@/components/pets/empty-state";
import { PetCard } from "@/components/pets/pet-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getCurrentUser } from "@/lib/permissions";
import { getFavoriteListings } from "@/server/queries/listings";

export const metadata: Metadata = {
  title: "Favoritos"
};

export default async function FavoritesPage() {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login?redirect=/favorites");

  const result = await getFavoriteListings(user.id);

  return (
    <section className="container-shell py-10">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase text-primary">Favoritos</p>
        <h1 className="mt-2 text-4xl font-black">Mascotas guardadas</h1>
        <p className="mt-2 text-muted-foreground">Tus publicaciones favoritas para volver a revisarlas con calma.</p>
      </div>
      {result.error ? (
        <Alert className="mb-6 border-destructive/30">
          <AlertTitle>No pudimos cargar tus favoritos</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      ) : null}
      {result.listings.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {result.listings.map((pet) => (
            <PetCard canFavorite isFavorited={result.favoriteIds.has(pet.id)} key={pet.id} pet={pet} />
          ))}
        </div>
      ) : (
        <EmptyState
          actionHref="/explore"
          description="Cuando guardes una mascota desde Explorar, aparecerá aquí."
          title="Aún no tienes favoritos"
        />
      )}
    </section>
  );
}
