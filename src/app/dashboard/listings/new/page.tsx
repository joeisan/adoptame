import { redirect } from "next/navigation";

import { ListingForm } from "@/components/dashboard/listing-form";
import { getCurrentUser } from "@/lib/permissions";
import { getMaxImagesPerListing } from "@/server/queries/settings";

export default async function NewListingPage() {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard/listings/new");
  const maxImages = await getMaxImagesPerListing();

  return (
    <section className="container-shell py-10">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase text-primary">Nueva publicación</p>
        <h1 className="mt-2 text-4xl font-black">Publicar mascota en adopción</h1>
      </div>
      <ListingForm maxImages={maxImages} />
    </section>
  );
}
