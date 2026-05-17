import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, HeartPulse, MapPin, Mars, Venus, Calendar, ArrowUpNarrowWide, Mail, Phone, UserRound, ScrollText } from "lucide-react";
import { getBadgeIcon } from "@/components/pets/badge-icon";
import { BadgeScroller } from "@/components/pets/badge-scroller";

import { ContactPanel } from "@/components/pets/contact-panels";
import { OwnerListingActions } from "@/components/pets/owner-listing-actions";
import { PetGallery } from "@/components/pets/pet-gallery";
import { ShareListingButton } from "@/components/pets/share-listing-button";
import { StatusBadge } from "@/components/pets/status-badge";
import { VerifiedBadge } from "@/components/pets/verified-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/permissions";
import { formatAge, formatDate } from "@/lib/utils";
import { getFavoriteListingIds, getPublicPetContact, getPublicPetListing, requirePublicPetListing } from "@/server/queries/listings";
import { ReportListingPopup } from "@/components/pets/report-listing-popup";
import { CATEGORY_COLORS } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "@/components/pets/favorite-button";
import { Translate } from "@/components/layout/translate";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const pet = await getPublicPetListing(slug);

  if (!pet) {
    return { title: "Mascota no encontrada" };
  }

  return {
    title: `${pet.name} busca hogar`,
    description: pet.description.slice(0, 150),
    openGraph: {
      title: `${pet.name} en adopción`,
      description: pet.description.slice(0, 150),
      images: pet.image?.publicUrl ? [pet.image.publicUrl] : undefined
    }
  };
}

export default async function PetDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [pet, contact, { user }] = await Promise.all([
    requirePublicPetListing(slug),
    getPublicPetContact(slug),
    getCurrentUser()
  ]);
  
  const favoriteIds = user ? await getFavoriteListingIds(user.id) : new Set<string>();
  const isFavorited = favoriteIds.has(pet.id);
  const isOwner = user?.id === pet.ownerId;
  const isAdmin = user?.role === "super_admin";
  const categoryColorClass = pet.category?.slug ? CATEGORY_COLORS[pet.category.slug] : "";
  const siteUrl = getSiteUrl();
  const listingUrl = `${siteUrl.replace(/\/$/, "")}/pets/${pet.slug}`;

  return (
    <section className="container-shell py-6 md:py-10 overflow-hidden">
      <PetGallery images={pet.images} name={pet.name} isAdopted={pet.status === "adopted"} />
      <div className="mt-6 md:mt-8 grid gap-6 md:gap-8 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-6 md:space-y-8">
          <div className="rounded-xl border bg-card p-4 md:p-6 ambient-card">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div className="flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status={pet.status} />
                  {pet.category?.name ? (
                    <Badge className={cn("text-primary-foreground", categoryColorClass || "bg-primary hover:bg-primary")}>
                      {pet.category.name}
                    </Badge>
                  ) : null}
                  <Badge variant="secondary" className="flex items-center gap-1.5 font-bold px-3">
                    <Calendar className="size-3.5" />
                    <Translate id="pet.age" />:{" "}
                    {formatAge(pet.ageValue, pet.ageUnit)}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                  <h1 className="flex items-center gap-2 text-2xl md:text-4xl font-black">
                    {pet.name}
                    {pet.sex === "female" ? (
                      <div className="group/sex relative inline-flex">
                        <Venus className="size-6 md:size-8 text-sage" />
                        <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 rounded bg-popover px-2 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-opacity group-hover/sex:opacity-100">
                          <Translate id="pet.female" />
                        </span>
                      </div>
                    ) : pet.sex === "male" ? (
                      <div className="group/sex relative inline-flex">
                        <Mars className="size-6 md:size-8 text-primary" />
                        <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 rounded bg-popover px-2 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-opacity group-hover/sex:opacity-100">
                          <Translate id="pet.male" />
                        </span>
                      </div>
                    ) : null}
                  </h1>
                  {user && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 border-r pr-3">
                        <FavoriteButton isFavorited={isFavorited} listingId={pet.id} />
                        <span className="text-xs text-muted-foreground font-medium"><Translate id="pet.favorite" /></span>
                      </div>
                      <ReportListingPopup listingId={pet.id} listingName={pet.name} />
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <ShareListingButton title={`${pet.name} busca hogar en Adóptame Panamá`} url={listingUrl} />
                </div>
                <p className="mt-2 text-muted-foreground flex items-center gap-1.5 font-medium">
                  <MapPin className="size-4 text-primary" />
                  {pet.breed || pet.category?.name || <Translate id="pet.pet" />} <Translate id="pet.in" /> {pet.province}
                  {pet.district ? `, ${pet.district}` : ""}
                </p>
              </div>
              <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-1.5 bg-muted/50 p-3 rounded-lg border border-border">
                <Translate id="pet.publisher" />: 
                {pet.organization ? (
                  <Link 
                    href={`/perfil/${pet.organization.slug}`} 
                    className="font-semibold text-foreground hover:underline flex items-center gap-1.5"
                  >
                    {pet.organization.name}
                    {pet.organization.isVerified ? <VerifiedBadge /> : null}
                  </Link>
                ) : pet.ownerSlug ? (
                  <Link 
                    href={`/perfil/${pet.ownerSlug}`} 
                    className="font-semibold text-foreground hover:underline flex items-center gap-1.5"
                  >
                    {pet.ownerName ?? <Translate id="dash.rescuer" />}
                  </Link>
                ) : (
                  <span className="font-semibold text-foreground">{pet.ownerName ?? <Translate id="dash.rescuer" />}</span>
                )}
              </div>
            </div>
            
            {pet.badges && pet.badges.length > 0 ? (
              <BadgeScroller>
                {pet.badges.map((badge) => {
                  const isMain = ["Vacunado", "Desparasitado", "Esterilizado"].includes(badge);
                  return (
                    <Badge 
                      key={badge} 
                      variant="outline" 
                      className={cn(
                        "shrink-0 whitespace-nowrap px-3 py-1 text-sm font-bold flex items-center border-2",
                        isMain 
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                          : "border-sky-500 bg-sky-50 text-sky-700"
                      )}
                    >
                      {getBadgeIcon(badge, "mr-1.5 size-4")}
                      {badge}
                    </Badge>
                  );
                })}
              </BadgeScroller>
            ) : null}

            <div className="mt-6 grid gap-3 grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center justify-center p-4 rounded-xl border bg-muted/30 gap-2">
                <CalendarDays className="size-5 text-primary" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold"><Translate id="pet.age" /></span>
                <span className="font-bold">{formatAge(pet.ageValue, pet.ageUnit)}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-xl border bg-muted/30 gap-2">
                {pet.sex === "female" ? <Venus className="size-5 text-sage" /> : <Mars className="size-5 text-primary" />}
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold"><Translate id="pet.sex" /></span>
                <span className="font-bold">{pet.sex === "female" ? <Translate id="pet.female" /> : pet.sex === "male" ? <Translate id="pet.male" /> : <Translate id="pet.unknown" />}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-xl border bg-muted/30 gap-2">
                <ArrowUpNarrowWide className="size-5 text-primary" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold"><Translate id="pet.size" /></span>
                <span className="font-bold">{pet.size === "small" ? <Translate id="pet.small" /> : pet.size === "medium" ? <Translate id="pet.medium" /> : pet.size === "large" ? <Translate id="pet.large" /> : <Translate id="pet.unknown" />}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-xl border bg-muted/30 gap-2 text-center">
                <MapPin className="size-5 text-primary" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold"><Translate id="pet.zone" /></span>
                <span className="font-bold truncate max-w-full px-1 text-sm">{pet.sector ?? pet.district ?? pet.province}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl border bg-muted/30 px-4 py-3 text-sm font-semibold text-muted-foreground">
              <Calendar className="size-4 text-primary" />
              <Translate id="pet.published" />: {formatDate(pet.publishedAt ?? pet.createdAt)}
            </div>

            {contact && (
              <div className="mt-6 md:mt-8 grid gap-4 p-4 md:p-5 rounded-xl border border-primary/20 bg-primary/5">
                <h3 className="font-bold text-lg flex items-center gap-2 text-primary">
                  <UserRound className="size-5" />
                  <Translate id="pet.publisherContact" />
                </h3>
                <div className="flex flex-wrap gap-3 md:gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    {pet.ownerSlug || pet.organization ? (
                      <Link href={`/perfil/${pet.organization?.slug || pet.ownerSlug}`} className="font-semibold text-foreground hover:underline">
                        {contact.contactName || <Translate id="pet.publisher" />}
                      </Link>
                    ) : (
                      <span className="font-semibold text-foreground">{contact.contactName || <Translate id="pet.publisher" />}</span>
                    )}
                  </div>
                  {contact.contactPhone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="size-4 text-primary" />
                      {contact.contactPhone}
                    </div>
                  )}
                  {contact.contactEmail && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="size-4 text-primary" />
                      {contact.contactEmail}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <Card className="overflow-hidden border-none shadow-none bg-transparent">
            <CardHeader className="px-0">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                <ScrollText className="size-6 text-primary" />
                <Translate id="pet.description" />
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <p className="whitespace-pre-line leading-relaxed text-base md:text-lg text-muted-foreground break-words">{pet.description}</p>
            </CardContent>
          </Card>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="ambient-card border-primary/10">
              <CardHeader>
                <CardTitle className="text-xl font-bold"><Translate id="pet.story" /></CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                  {pet.story || <Translate id="pet.noStory" />}
                </p>
              </CardContent>
            </Card>
            <Card className="ambient-card border-coral/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <HeartPulse className="size-5 text-coral" />
                  <Translate id="pet.healthAndReqs" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                  {pet.healthNotes || <Translate id="pet.noHealth" />}
                </p>
                <div className="pt-4 border-t">
                  <h4 className="font-bold mb-2"><Translate id="pet.adoptionReqs" />:</h4>
                  <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                    {pet.adoptionRequirements || <Translate id="pet.noReqs" />}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <aside className="space-y-6">
          {(isOwner || isAdmin) ? (
            <OwnerListingActions 
              isAdopted={pet.status === "adopted"} 
              listingId={pet.id} 
              slug={pet.slug} 
              isAdmin={isAdmin && !isOwner}
            />
          ) : null}
          {contact && <ContactPanel contact={contact} listingId={pet.id} slug={pet.slug} />}
          <Card className="ambient-card">
            <CardHeader>
              <CardTitle className="text-lg font-bold"><Translate id="pet.approxLocation" /></CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><MapPin className="size-4 text-primary" /> {pet.province}</p>
              {pet.district ? <p className="ml-6">{pet.district}</p> : null}
              {pet.sector ? <p className="ml-6">{pet.sector}</p> : null}
              <div className="mt-4 pt-4 border-t text-xs italic">
                <Translate id="pet.exactLocationSharedLater" />
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  );
}
