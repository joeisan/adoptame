import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, Globe, Link2, Mail, Phone } from "lucide-react";

import { PetCard } from "@/components/pets/pet-card";
import { VerifiedBadge } from "@/components/pets/verified-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublicProfileBySlug, getProfileActiveListings } from "@/server/queries/profiles";
import { panamaWhatsappUrl } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPublicProfileBySlug(slug);

  if (!profile) return { title: "Perfil no encontrado" };

  return {
    title: `${profile.name} - Perfil`,
    description: profile.description?.slice(0, 150) ?? "Perfil de usuario en Adóptame Panamá",
  };
}

export default async function ProfilePage({ params }: { params: Params }) {
  const { slug } = await params;
  const profile = await getPublicProfileBySlug(slug);

  if (!profile) notFound();

  const listings = await getProfileActiveListings(profile);
  const whatsapp = panamaWhatsappUrl(profile.whatsapp ?? profile.phone);
  const message = encodeURIComponent(`Hola ${profile.name}, los contacto desde Adóptame Panamá.`);
  const waLink = whatsapp ? `${whatsapp}?text=${message}` : null;

  return (
    <section className="container-shell py-10">
      <div className="mb-10 rounded-2xl border bg-card p-6 md:p-10 ambient-card">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          <div className="flex-1 space-y-4">
            <div className="space-y-1">
              <h1 className="flex flex-wrap items-center gap-2 text-3xl font-black md:text-5xl">
                {profile.name}
                {profile.isVerified ? <VerifiedBadge /> : null}
              </h1>
              {profile.isOrganization ? (
                <Badge variant="outline" className="mt-2 text-primary border-primary/30">Organización</Badge>
              ) : (
                <Badge variant="outline" className="mt-2">Rescatista Independiente</Badge>
              )}
            </div>
            
            {profile.description ? (
              <p className="max-w-2xl text-muted-foreground whitespace-pre-line leading-relaxed">
                {profile.description}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-3 pt-4">
              {waLink ? (
                <Button asChild>
                  <a href={waLink} target="_blank" rel="noopener noreferrer">
                    Contactar por WhatsApp
                  </a>
                </Button>
              ) : null}
              {profile.email ? (
                <Button asChild variant="outline">
                  <a href={`mailto:${profile.email}`}>
                    <Mail className="size-4 mr-2" /> Email
                  </a>
                </Button>
              ) : null}
              {profile.phone && !whatsapp ? (
                <Button asChild variant="outline">
                  <a href={`tel:${profile.phone}`}>
                    <Phone className="size-4 mr-2" /> Llamar
                  </a>
                </Button>
              ) : null}
              {profile.website ? (
                <Button asChild variant="ghost" size="icon">
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" aria-label="Sitio web">
                    <ExternalLink className="size-5" />
                  </a>
                </Button>
              ) : null}
              {profile.facebook ? (
                <Button asChild variant="outline" size="sm">
                  <a href={profile.facebook} target="_blank" rel="noopener noreferrer">
                    <Globe className="size-4 mr-1" /> Facebook
                  </a>
                </Button>
              ) : null}
              {profile.instagram ? (
                <Button asChild variant="outline" size="sm">
                  <a href={profile.instagram} target="_blank" rel="noopener noreferrer">
                    <Link2 className="size-4 mr-1" /> Instagram
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Mascotas en adopción ({listings.length})</h2>
        </div>
        {listings.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <h3 className="text-lg font-semibold">No hay publicaciones activas</h3>
            <p className="mt-2 text-muted-foreground text-sm">
              {profile.name} actualmente no tiene mascotas listadas para adopción.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
