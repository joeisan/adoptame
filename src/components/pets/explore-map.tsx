"use client";

import dynamic from "next/dynamic";
import type { PetCardListing } from "@/types/app";
import { Card } from "@/components/ui/card";

const MapView = dynamic(() => import("./map-view"), {
  ssr: false,
  loading: () => <div className="h-[360px] w-full animate-pulse rounded-xl bg-muted md:h-[600px]" />
});

export function ExploreMap({ listings }: { listings: PetCardListing[] }) {
  return (
    <Card className="overflow-hidden border-none shadow-lg" id="mapa">
      <MapView listings={listings} />
    </Card>
  );
}
