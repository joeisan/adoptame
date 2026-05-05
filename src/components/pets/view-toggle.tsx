"use client";

import { LayoutGrid, Map as MapIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";

export function ViewToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "grid";

  const handleViewChange = (view: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (view === "map") {
      params.set("view", "map");
    } else {
      params.delete("view");
    }
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <Tabs defaultValue={currentView} onValueChange={handleViewChange} className="w-full sm:w-auto">
      <TabsList className="grid w-full grid-cols-2 sm:w-[200px]">
        <TabsTrigger value="grid" className="flex items-center gap-2">
          <LayoutGrid className="size-4" />
          <span>Grilla</span>
        </TabsTrigger>
        <TabsTrigger value="map" className="flex items-center gap-2">
          <MapIcon className="size-4" />
          <span>Mapa</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
