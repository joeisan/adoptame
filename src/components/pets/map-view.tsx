"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { PetCardListing } from "@/types/app";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { formatAge } from "@/lib/utils";
import { LocateFixed } from "lucide-react";

// Component to handle map centering
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapView({ listings }: { listings: PetCardListing[] }) {
  const [L, setL] = useState<any>(null);
  const [mapView, setMapView] = useState<{ center: [number, number]; zoom: number }>({
    center: [8.9824, -79.5199], // Panama City
    zoom: 8
  });

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet);
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });
  }, []);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    document.getElementById("mapa")?.scrollIntoView({ behavior: "smooth", block: "start" });
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMapView({
          center: [position.coords.latitude, position.coords.longitude],
          zoom: 12
        });
      },
      (error) => {
        console.error("Error finding location:", error);
      }
    );
  }, []);

  const categoryIcons: Record<string, string> = {
    perros: "🐶",
    gatos: "🐱",
    conejos: "🐰",
    aves: "🦜",
    reptiles: "🐢",
    roedores: "🐹",
    peces: "🐠",
    otros: "🐾"
  };

  const getCustomIcon = (categorySlug: string = "otros") => {
    if (!L) return null;
    const emoji = categoryIcons[categorySlug] || "🐾";
    return L.divIcon({
      html: `
        <div class="relative flex flex-col items-center group">
          <div class="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-xl border-4 border-primary text-2xl transition-all group-hover:scale-110 z-10 overflow-hidden">
            ${emoji}
          </div>
          <div class="w-4 h-4 bg-primary rotate-45 -mt-2 shadow-lg z-0"></div>
        </div>
      `,
      className: "custom-pin-icon",
      iconSize: [48, 56],
      iconAnchor: [24, 52],
      popupAnchor: [0, -48]
    });
  };

  if (!L) return null;

  return (
    <div className="relative h-full w-full">
      <div className="absolute right-4 top-4 z-[400]">
        <Button 
          size="icon" 
          variant="secondary" 
          className="shadow-md bg-white hover:bg-gray-100"
          onClick={handleLocate}
        >
          <LocateFixed className="size-5 text-primary" />
        </Button>
      </div>

      <MapContainer 
        center={mapView.center} 
        zoom={mapView.zoom} 
        style={{ height: "100%", width: "100%" }}
        className="z-0 h-[360px] md:h-[600px]"
      >
        <MapController center={mapView.center} zoom={mapView.zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {listings.filter(p => p.latitude && p.longitude).map((pet) => (
          <Marker 
            key={pet.id} 
            position={[pet.latitude!, pet.longitude!]}
            icon={getCustomIcon(pet.category?.slug)}
          >
            <Popup>
              <div className="w-48 overflow-hidden rounded-lg">
                <div className="relative aspect-video w-full">
                  <Image 
                    src={pet.image?.publicUrl ?? "/reference/hero-adoptame-panama.png"} 
                    alt={pet.name} 
                    fill 
                    className="object-cover"
                  />
                </div>
                <div className="p-2">
                  <h4 className="font-bold">{pet.name}</h4>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-[10px] px-1 h-4">
                      {formatAge(pet.ageValue, pet.ageUnit)}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1 h-4">
                      {pet.province}
                    </Badge>
                  </div>
                  <Link 
                    href={`/pets/${pet.slug}`} 
                    className="mt-2 block text-center text-xs font-bold text-primary hover:underline"
                  >
                    Ver detalles
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
