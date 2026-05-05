"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, LocateFixed, Search, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";

import { CATEGORY_OPTIONS, PANAMA_PROVINCES, PET_SEX_OPTIONS, PET_SIZE_OPTIONS, PET_STATUS_OPTIONS } from "@/lib/constants";
import { nearestProvince } from "@/lib/panama-location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { ExploreFilters } from "@/types/app";

const preservedMainFilterKeys = ["district", "sex", "age", "size", "status", "verified", "sort", "location", "lat", "lng"] as const;

function activeExtraFilters(filters: ExploreFilters) {
  return [filters.district, filters.sex, filters.age, filters.size, filters.status, filters.verified, filters.sort && filters.sort !== "recent"]
    .filter(Boolean)
    .length;
}

function HiddenPreservedFilters({ filters }: { filters: ExploreFilters }) {
  return (
    <>
      {preservedMainFilterKeys.map((key) =>
        filters[key] ? <input key={key} name={key} type="hidden" value={String(filters[key])} /> : null
      )}
    </>
  );
}

function FieldGrid({ filters, includeMainFields = false }: { filters: ExploreFilters; includeMainFields?: boolean }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {includeMainFields ? (
        <>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="modal-q">Búsqueda</Label>
            <Input defaultValue={filters.q ?? ""} id="modal-q" name="q" placeholder="Nombre, raza, descripción o ubicación" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal-category">Categoría</Label>
            <Select defaultValue={filters.category ?? ""} id="modal-category" name="category">
              <option value="">Todas</option>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal-province">Provincia</Label>
            <Select defaultValue={filters.province ?? ""} id="modal-province" name="province">
              <option value="">Todas</option>
              {PANAMA_PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </Select>
          </div>
        </>
      ) : (
        <>
          {filters.q ? <input name="q" type="hidden" value={filters.q} /> : null}
          {filters.category ? <input name="category" type="hidden" value={filters.category} /> : null}
          {filters.province ? <input name="province" type="hidden" value={filters.province} /> : null}
        </>
      )}
      <div className="space-y-2">
        <Label htmlFor="district">Distrito</Label>
        <Input defaultValue={filters.district ?? ""} id="district" name="district" placeholder="Ej. San Miguelito" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sex">Sexo</Label>
        <Select defaultValue={filters.sex ?? ""} id="sex" name="sex">
          <option value="">Todos</option>
          {PET_SEX_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="age">Edad</Label>
        <Select defaultValue={filters.age ?? ""} id="age" name="age">
          <option value="">Todas</option>
          <option value="baby">Bebé o cachorro</option>
          <option value="adult">Adulto</option>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="size">Tamaño</Label>
        <Select defaultValue={filters.size ?? ""} id="size" name="size">
          <option value="">Todos</option>
          {PET_SIZE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Estado</Label>
        <Select defaultValue={filters.status ?? ""} id="status" name="status">
          <option value="">Todos</option>
          {PET_STATUS_OPTIONS.slice(0, 3).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="verified">Organización</Label>
        <Select defaultValue={filters.verified ?? ""} id="verified" name="verified">
          <option value="">Todas</option>
          <option value="true">Solo verificadas</option>
        </Select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="sort">Ordenar</Label>
        <Select defaultValue={filters.sort ?? "recent"} id="sort" name="sort">
          <option value="recent">Más recientes</option>
          <option value="oldest">Más antiguos</option>
          <option value="az">Nombre A-Z</option>
          <option value="za">Nombre Z-A</option>
        </Select>
      </div>
      {filters.location ? <input name="location" type="hidden" value={filters.location} /> : null}
      {filters.lat ? <input name="lat" type="hidden" value={filters.lat} /> : null}
      {filters.lng ? <input name="lng" type="hidden" value={filters.lng} /> : null}
    </div>
  );
}

export function ExploreFilters({ filters }: { filters: ExploreFilters }) {
  const [open, setOpen] = useState(false);
  const [pendingLocation, startLocationTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const extraCount = activeExtraFilters(filters);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      toast.error("Tu navegador no permite detectar ubicación.");
      return;
    }

    startLocationTransition(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const nearest = nearestProvince(latitude, longitude);
          const params = new URLSearchParams(searchParams.toString());

          params.set("province", nearest.province);
          params.set("location", "nearby");
          params.set("lat", latitude.toFixed(5));
          params.set("lng", longitude.toFixed(5));
          params.delete("page");

          router.push(`/explore?${params.toString()}`);
          toast.success(`Mostrando mascotas cerca de ${nearest.province}.`);
        },
        () => {
          toast.error("No pude obtener tu ubicación. Revisa permisos del navegador.");
        },
        { enableHighAccuracy: false, maximumAge: 300000, timeout: 10000 }
      );
    });
  }

  return (
    <>
      <div className="rounded-xl border bg-card p-4 ambient-card md:p-5">
        <form action="/explore" className="grid gap-3 md:grid-cols-[minmax(260px,1fr)_220px_220px_auto_auto]" method="get">
          <div className="relative">
            <Label className="sr-only" htmlFor="q">
              Búsqueda
            </Label>
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-12 rounded-full bg-muted pl-9"
              defaultValue={filters.q ?? ""}
              id="q"
              name="q"
              placeholder="Buscar por nombre, raza o lugar"
            />
          </div>
          <div className="hidden md:block">
            <Label className="sr-only" htmlFor="province">
              Provincia
            </Label>
            <Select className="h-12 rounded-full bg-muted" defaultValue={filters.province ?? ""} id="province" name="province">
              <option value="">Provincia</option>
              {PANAMA_PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </Select>
          </div>
          <div className="hidden md:block">
            <Label className="sr-only" htmlFor="category">
              Categoría
            </Label>
            <Select className="h-12 rounded-full bg-muted" defaultValue={filters.category ?? ""} id="category" name="category">
              <option value="">Categoría</option>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
          <HiddenPreservedFilters filters={filters} />
          <Button className="h-12" type="submit">
            <Search className="size-4" />
            Buscar
          </Button>
          <Button className="h-12" disabled={pendingLocation} onClick={useCurrentLocation} type="button" variant="outline">
            <LocateFixed className="size-4" />
            {pendingLocation ? "Ubicando..." : "Mi ubicación"}
          </Button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button className="h-10" onClick={() => setOpen(true)} type="button" variant="outline">
            <SlidersHorizontal className="size-4" />
            Más filtros{extraCount ? ` (${extraCount})` : ""}
          </Button>
          <Button asChild className="h-10" variant="ghost">
            <Link href="/explore">
              <X className="size-4" />
              Limpiar
            </Link>
          </Button>
          {filters.location === "nearby" && filters.province ? (
            <span className="inline-flex h-10 items-center rounded-full bg-accent px-4 text-sm font-semibold text-accent-foreground">
              Cerca de {filters.province}
            </span>
          ) : null}
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[80] bg-black/35 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="mx-auto flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <div className="flex items-center gap-2">
                <Filter className="size-5 text-primary" />
                <h2 className="text-lg font-bold">Filtros de exploración</h2>
              </div>
              <Button aria-label="Cerrar filtros" onClick={() => setOpen(false)} size="icon" type="button" variant="ghost">
                <X className="size-5" />
              </Button>
            </div>
            <form action="/explore" className="overflow-y-auto p-5" method="get">
              <FieldGrid filters={filters} includeMainFields />
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button type="submit">Aplicar filtros</Button>
                <Button asChild variant="outline">
                  <Link href="/explore">
                    <X className="size-4" />
                    Limpiar filtros
                  </Link>
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
