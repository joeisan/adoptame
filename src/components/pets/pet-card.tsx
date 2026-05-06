import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Mars, Venus, ArrowUpNarrowWide, User } from "lucide-react";
import { getBadgeIcon } from "@/components/pets/badge-icon";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatAge, formatDate } from "@/lib/utils";
import type { PetCardListing } from "@/types/app";
import { StatusBadge } from "@/components/pets/status-badge";
import { VerifiedBadge } from "@/components/pets/verified-badge";
import { FavoriteButton } from "@/components/pets/favorite-button";
import { CATEGORY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";



export function PetCard({
  pet,
  canFavorite = false,
  isFavorited = false
}: {
  pet: PetCardListing;
  canFavorite?: boolean;
  isFavorited?: boolean;
}) {
  const categoryColorClass = pet.category?.slug ? CATEGORY_COLORS[pet.category.slug] : "";

  return (
    <Card className="group relative flex flex-col transition-shadow hover:shadow-md h-full bg-card border rounded-[var(--radius)]">
      {/* Main card link */}
      <Link 
        href={`/pets/${pet.slug}`} 
        className="absolute inset-0 z-10" 
        aria-label={`Ver detalles de ${pet.name}`} 
      />
      
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-[calc(var(--radius)-1px)]">
        <Image
          alt={pet.image?.altText ?? `${pet.name} en adopción`}
          className="object-cover transition duration-500 group-hover:scale-105"
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          src={pet.image?.publicUrl ?? "/reference/hero-adoptame-panama.png"}
        />
        <div className="absolute left-3 top-3 right-3 flex flex-nowrap gap-2 overflow-hidden z-20">
          <StatusBadge status={pet.status} />
          {pet.category?.name ? (
            <Badge className={cn("shrink-0 whitespace-nowrap text-primary-foreground", categoryColorClass || "bg-primary")}>
              {pet.category.name}
            </Badge>
          ) : null}
        </div>
        {canFavorite ? (
          <div className="absolute right-3 top-3 z-30">
            <FavoriteButton isFavorited={isFavorited} listingId={pet.id} />
          </div>
        ) : null}
        {pet.status === "adopted" && (
          <div className="absolute bottom-0 right-0 z-30 h-16 w-16 overflow-hidden rounded-br-[calc(var(--radius)-1px)]">
            <div className="absolute bottom-[10px] right-[-18px] w-[80px] -rotate-45 bg-secondary px-1 py-0.5 text-center text-[9px] font-black uppercase tracking-tighter text-secondary-foreground shadow-sm">
              Adoptado
            </div>
          </div>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col gap-4 p-5 rounded-b-[var(--radius)]">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-2xl font-black flex items-center gap-2 truncate">
              {pet.name}
              <span className="shrink-0 text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-full flex items-center">
                <Calendar className="mr-1 size-3.5" />
                Edad:{" "}
                {formatAge(pet.ageValue, pet.ageUnit)}
              </span>
            </h3>
            <div className="z-20 shrink-0">
              {pet.sex === "female" ? (
                <div className="group/sex relative">
                  <Venus className="size-6 text-sage" />
                  <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 w-max -translate-x-1/2 rounded bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-md transition-opacity group-hover/sex:opacity-100">
                    Hembra
                  </span>
                </div>
              ) : pet.sex === "male" ? (
                <div className="group/sex relative">
                  <Mars className="size-6 text-primary" />
                  <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 w-max -translate-x-1/2 rounded bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-md transition-opacity group-hover/sex:opacity-100">
                    Macho
                  </span>
                </div>
              ) : null}
            </div>
          </div>
          <p className="text-base font-medium text-muted-foreground truncate">{pet.breed || pet.category?.name || "Mascota"}</p>
        </div>

        {pet.ownerSlug ? (
          <Link 
            href={`/perfil/${pet.ownerSlug}`} 
            className="z-20 flex w-max items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <User className="size-3.5" />
            {pet.ownerName || "Publicante"}
            {pet.organization?.isVerified ? <VerifiedBadge /> : null}
          </Link>
        ) : null}

        <div className="flex flex-nowrap gap-1 py-0.5">
          <Badge variant="outline" className="flex shrink-0 items-center gap-1 whitespace-nowrap px-2 text-[10px] h-6 leading-none">
            <ArrowUpNarrowWide className="size-3.5 text-primary" />
            {pet.size === "small" ? "Pequeño" : pet.size === "medium" ? "Mediano" : pet.size === "large" ? "Grande" : "Cnf."}
          </Badge>
          {pet.badges?.slice(0, 2).map((badge) => (
            <Badge key={badge} variant="outline" className="flex shrink-0 items-center whitespace-nowrap px-2 text-[10px] h-6 leading-none">
              {getBadgeIcon(badge, "mr-1 size-2.5 shrink-0")}
              <span>{badge}</span>
            </Badge>
          ))}
          {pet.badges && pet.badges.length > 2 ? (
            <div className="group/tooltip relative z-20 shrink-0">
              <Badge variant="outline" className="whitespace-nowrap px-2 text-primary text-[10px] h-6 cursor-default leading-none border-primary/30 bg-primary/5">
                +{pet.badges.length - 2}
              </Badge>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-max max-w-[200px] -translate-x-1/2 rounded-lg bg-white p-2 text-[11px] text-foreground opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-all duration-200 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-[-4px] z-50 border">
                <div className="flex flex-col gap-1">
                  {pet.badges.slice(2).map((b) => (
                    <div key={b} className="flex items-center gap-1.5 py-0.5 border-b last:border-0 border-muted/50">
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-[6px] border-transparent border-t-white" />
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-auto pt-2 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Calendar className="size-4" />
            <span>Publicado: {formatDate(pet.publishedAt ?? pet.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <MapPin className="size-4" />
            <span className="truncate">{pet.province}{pet.district ? `, ${pet.district}` : ""}</span>
          </div>
          <Button asChild className="w-full z-20 h-10 text-sm font-bold" variant="outline">
            <Link href={`/pets/${pet.slug}`}>Ver detalles</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
