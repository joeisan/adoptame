"use client";

import { useTransition, useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";

import { createListingAction, updateListingAction } from "@/server/actions/listings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_OPTIONS, PANAMA_PROVINCES, PET_SEX_OPTIONS, PET_SIZE_OPTIONS } from "@/lib/constants";
import { listingSchema } from "@/lib/validations/listing";

type ListingInputValues = z.input<typeof listingSchema>;
type ListingInitialData = Partial<ListingInputValues> & { badges?: string[] };

export function ListingForm({ 
  initialData, 
  listingId,
  isAdmin = false,
  allUsers = []
}: { 
  initialData?: ListingInitialData; 
  listingId?: string;
  isAdmin?: boolean;
  allUsers?: { id: string, label: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const [userSearch, setUserSearch] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = allUsers.filter(u => 
    u.label.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 50);

  const form = useForm<ListingInputValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      categorySlug: initialData?.categorySlug ?? "",
      species: "",
      breed: initialData?.breed ?? "",
      ageValue: initialData?.ageValue ?? undefined,
      ageUnit: (initialData?.ageUnit as any) ?? "unknown",
      sex: (initialData?.sex as any) ?? "unknown",
      size: (initialData?.size as any) ?? "unknown",
      province: initialData?.province ?? "",
      district: initialData?.district ?? "",
      sector: initialData?.sector ?? "",
      description: initialData?.description ?? "",
      story: initialData?.story ?? "",
      healthNotes: initialData?.healthNotes ?? "",
      adoptionRequirements: initialData?.adoptionRequirements ?? "",
      contactName: initialData?.contactName ?? "",
      contactPhone: initialData?.contactPhone ?? "",
      contactWhatsapp: initialData?.contactWhatsapp ?? "",
      contactEmail: initialData?.contactEmail ?? "",
      status: (initialData?.status as any) ?? "published",
      ownerId: initialData?.ownerId ?? undefined
    }
  });

  function onSubmit(_values: ListingInputValues, event?: BaseSyntheticEvent) {
    const node = event?.target instanceof HTMLFormElement ? event.target : null;
    if (!node) return;
    const formData = new FormData(node);

    startTransition(async () => {
      const action = listingId ? updateListingAction : createListingAction;
      const result = await action(formData);
      if (result?.error) {
        toast.error(result.error);
      } else if (listingId) {
        toast.success("Publicación actualizada con éxito.");
      }
    });
  }

  const error = (name: keyof ListingInputValues) => form.formState.errors[name]?.message;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{listingId ? "Editar publicación" : "Publicar mascota"}</CardTitle>
        <CardDescription>
          {listingId 
            ? "Modifica la información de tu publicación. Los cambios se reflejarán instantáneamente." 
            : "Completa la información pública y al menos un método de contacto privado."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5" encType="multipart/form-data" onSubmit={form.handleSubmit(onSubmit)}>
          {listingId && <input name="id" type="hidden" value={listingId} />}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de mascota</Label>
              <Input id="name" {...form.register("name")} />
              <p className="text-sm text-destructive">{error("name")}</p>
            </div>

            {listingId && (
              <div className="space-y-2">
                <Label htmlFor="status">Estado de la mascota</Label>
                <Select id="status" name="status" defaultValue={form.getValues("status")}>
                  <option value="published">Disponible para adopción</option>
                  <option value="adopted">Ya fue adoptado</option>
                </Select>
                <p className="text-[10px] text-muted-foreground italic">Cambiar a adoptado lo ocultará de los filtros principales.</p>
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="bg-primary/5 rounded-xl border border-primary/20 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <ShieldCheck className="size-4 text-primary" />
                </div>
                <h3 className="font-black text-primary uppercase text-xs tracking-widest">Control Admin: Dueño de la publicación</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase opacity-60">1. Filtrar Usuarios</Label>
                  <Input 
                    placeholder="Escribe nombre o email..." 
                    className="h-9"
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerId" className="text-[10px] uppercase opacity-60">2. Seleccionar nuevo dueño</Label>
                  <Select id="ownerId" name="ownerId" defaultValue={form.getValues("ownerId")}>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(u => (
                        <option key={u.id} value={u.id}>{u.label}</option>
                      ))
                    ) : (
                      <option disabled>No se encontraron usuarios</option>
                    )}
                  </Select>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">Esta acción reasignará la propiedad total de la publicación al usuario seleccionado.</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="categorySlug">Categoría</Label>
              <Select id="categorySlug" {...form.register("categorySlug")}>
                <option value="">Selecciona</option>
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </Select>
              <p className="text-sm text-destructive">{error("categorySlug")}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="breed">Raza/variedad</Label>
              <Input id="breed" placeholder="Ej. Mestizo" {...form.register("breed")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ageValue">Edad aproximada</Label>
              <Input id="ageValue" min="0" type="number" {...form.register("ageValue")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ageUnit">Unidad edad</Label>
              <Select id="ageUnit" {...form.register("ageUnit")}>
                <option value="unknown">Desconocida</option>
                <option value="months">Meses</option>
                <option value="years">Años</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex">Sexo</Label>
              <Select id="sex" {...form.register("sex")}>
                {PET_SEX_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Tamaño</Label>
              <Select id="size" {...form.register("size")}>
                {PET_SIZE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Provincia</Label>
              <Select id="province" {...form.register("province")}>
                <option value="">Selecciona</option>
                {PANAMA_PROVINCES.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </Select>
              <p className="text-sm text-destructive">{error("province")}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">Distrito</Label>
              <Input id="district" {...form.register("district")} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="sector">Corregimiento o sector</Label>
              <Input id="sector" {...form.register("sector")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" {...form.register("description")} />
            <p className="text-sm text-destructive">{error("description")}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="story">Historia</Label>
              <Textarea id="story" {...form.register("story")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="healthNotes">Salud, vacunas, esterilización</Label>
              <Textarea id="healthNotes" {...form.register("healthNotes")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Características / Badges (Mín 0, Máx 4)</Label>
            <div className="flex flex-wrap gap-3" id="badges-container">
              {["Vacunado", "Desparasitado", "Esterilizado"].map((badge) => (
                <div key={badge} className="relative">
                  <input 
                    type="checkbox" 
                    id={`badge-${badge}`}
                    name="badges" 
                    value={badge} 
                    className="peer hidden" 
                    defaultChecked={initialData?.badges?.includes(badge)}
                  />
                  <label 
                    htmlFor={`badge-${badge}`}
                    className="flex items-center gap-1.5 rounded-full border border-input px-3 py-1 text-sm font-bold cursor-pointer transition-all peer-checked:!bg-[#10b981] peer-checked:!text-white peer-checked:!border-[#059669] hover:bg-muted"
                    style={{ borderStyle: 'solid', borderWidth: '1px' }}
                  >
                    {badge}
                  </label>
                </div>
              ))}
              {/* Badges personalizados que ya existen (Azul Claro) */}
              {initialData?.badges?.filter(b => !["Vacunado", "Desparasitado", "Esterilizado"].includes(b)).map((badge) => (
                <div 
                  key={badge} 
                  className="relative flex items-center gap-1.5 rounded-full border border-[#0ea5e9] bg-[#38bdf8] text-white px-3 py-1 text-sm font-bold"
                  style={{ backgroundColor: '#38bdf8', borderColor: '#0ea5e9', color: 'white' }}
                >
                  <input 
                    type="checkbox" 
                    name="badges" 
                    value={badge} 
                    className="hidden" 
                    defaultChecked={true}
                  />
                  {badge}
                  <button 
                    type="button" 
                    onClick={(e) => (e.currentTarget.parentElement as HTMLElement).remove()}
                    className="ml-1 font-black hover:scale-125 transition-transform"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Input placeholder="Otra (ej. Juguetón, Sociable)" id="customBadge" className="max-w-[200px]" />
              <Button type="button" variant="secondary" onClick={(e) => {
                const input = document.getElementById("customBadge") as HTMLInputElement;
                const val = input.value.trim();
                if (!val) return;
                
                const container = document.getElementById("badges-container");
                if (!container || container.children.length >= 6) {
                  toast.error("Límite de etiquetas alcanzado.");
                  return;
                }
                
                const wrapper = document.createElement("div");
                wrapper.className = "relative flex items-center gap-1.5 rounded-full border border-[#0ea5e9] bg-[#38bdf8] text-white px-3 py-1 text-sm font-bold animate-in zoom-in-50 duration-200";
                wrapper.style.backgroundColor = "#38bdf8";
                wrapper.style.borderColor = "#0ea5e9";
                wrapper.style.color = "white";
                wrapper.innerHTML = `<input type="checkbox" name="badges" value="${val}" checked class="hidden" /> ${val}`;
                
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "ml-1 font-black hover:scale-125 transition-transform";
                btn.innerText = "×";
                btn.onclick = () => wrapper.remove();
                wrapper.appendChild(btn);
                
                container.appendChild(wrapper);
                input.value = "";
              }}>Añadir</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="adoptionRequirements">Requisitos de adopción</Label>
            <Textarea id="adoptionRequirements" {...form.register("adoptionRequirements")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactName">Nombre de contacto</Label>
              <Input id="contactName" {...form.register("contactName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Teléfono</Label>
              <Input id="contactPhone" placeholder="6000 0000" {...form.register("contactPhone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactWhatsapp">WhatsApp</Label>
              <Input id="contactWhatsapp" placeholder="6000 0000" {...form.register("contactWhatsapp")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email</Label>
              <Input id="contactEmail" type="email" {...form.register("contactEmail")} />
              <p className="text-sm text-destructive">{error("contactEmail")}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="images">Imágenes {listingId && "(Añadir nuevas)"}</Label>
            <Input accept="image/png,image/jpeg,image/webp" id="images" multiple name="images" type="file" />
            <p className="text-sm text-muted-foreground">
              {listingId 
                ? "Sube imágenes nuevas si deseas agregarlas a la galería actual." 
                : "Mínimo 1, máximo configurable desde super admin."}
            </p>
          </div>
          <Button className="w-full md:w-fit" disabled={pending} type="submit">
            {pending 
              ? (listingId ? "Guardando..." : "Publicando...") 
              : (listingId ? "Guardar cambios" : "Publicar mascota")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
