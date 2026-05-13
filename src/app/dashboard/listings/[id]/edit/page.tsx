import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ListingForm } from "@/components/dashboard/listing-form";
import { getListingForEdit } from "@/server/queries/listings";
import { getProfilesForSelect } from "@/server/queries/profiles";
import { getMaxImagesPerListing } from "@/server/queries/settings";
import { getCurrentUser } from "@/lib/permissions";

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = await params;
  const { user, profile } = await getCurrentUser();
  
  if (!user) return notFound();

  // El "id" en el params es en realidad el slug según nuestro Link de edición
  const [listing, allUsers, maxImages] = await Promise.all([
    getListingForEdit(slug),
    profile?.role === "super_admin" ? getProfilesForSelect() : Promise.resolve([]),
    getMaxImagesPerListing()
  ]);
  
  if (!listing) return notFound();

  // Seguridad: Solo el dueño o un admin pueden editar
  const isAdmin = profile?.role === "super_admin";
  if (listing.ownerId !== user.id && !isAdmin) {
    return (
      <section className="container-shell py-20 text-center">
        <h1 className="text-2xl font-bold">No tienes permiso para editar esta publicación.</h1>
        <Button asChild className="mt-4" variant="ghost">
          <Link href="/dashboard">Volver al panel</Link>
        </Button>
      </section>
    );
  }

  // Mapear para que coincida con el esquema del formulario
  const initialData = {
    name: listing.name,
    categorySlug: listing.category?.slug,
    species: "",
    breed: listing.breed ?? "",
    ageValue: listing.ageValue ?? undefined,
    ageUnit: listing.ageUnit as any,
    sex: listing.sex as any,
    size: listing.size as any,
    province: listing.province,
    district: listing.district ?? "",
    sector: listing.sector ?? "",
    description: listing.description,
    story: listing.story ?? "",
    healthNotes: listing.healthNotes ?? "",
    adoptionRequirements: listing.adoptionRequirements ?? "",
    contactName: listing.contactName ?? "",
    contactPhone: listing.contactPhone ?? "",
    contactWhatsapp: listing.contactWhatsapp ?? "",
    contactEmail: listing.contactEmail ?? "",
    status: listing.status as any,
    ownerId: listing.ownerId,
    badges: listing.badges ?? [],
    images: listing.images ?? []
  };

  return (
    <div className="bg-muted/30 min-h-screen">
      <section className="container-shell py-10">
        <div className="mb-8">
          <Button asChild variant="ghost" className="-ml-4 text-muted-foreground hover:text-foreground">
            <Link href={`/pets/${listing.slug}`}>
              <ChevronLeft className="mr-2 size-4" />
              Volver a la publicación
            </Link>
          </Button>
          <div className="mt-4">
            <h1 className="text-3xl font-black tracking-tight">Editar Mascota</h1>
            <p className="text-muted-foreground mt-1">Estás editando la publicación de <span className="font-bold text-foreground">{listing.name}</span></p>
          </div>
        </div>

        <div className="max-w-4xl">
          <ListingForm 
            initialData={initialData} 
            listingId={listing.id} 
            isAdmin={isAdmin} 
            allUsers={allUsers}
            maxImages={maxImages}
          />
        </div>
      </section>
    </div>
  );
}
