"use client";

import dynamic from "next/dynamic";
import type { PetCardListing } from "@/types/app";
import { Card } from "@/components/ui/card";

const MapView = dynamic(() => import("./map-view"), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full animate-pulse rounded-xl bg-muted" />
});

export function ExploreMap({ listings }: { listings: PetCardListing[] }) {
  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <MapView listings={listings} />
    </Card>
  );
}
