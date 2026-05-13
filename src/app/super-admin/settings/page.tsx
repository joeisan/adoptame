import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE_CONFIG } from "@/lib/constants";
import { getCurrentUser } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CATEGORY_ICON_OPTIONS, getCategoryIcon } from "@/lib/category-icons";
import { updateAppSettingsAction, createCategoryAction, updateCategoryIconAction } from "@/server/actions/admin";

import { CategoryToggle } from "@/components/admin/category-toggle";

function formAction(action: (formData: FormData) => Promise<unknown>) {
  return action as unknown as (formData: FormData) => void;
}

export default async function AdminSettingsPage() {
  const { profile } = await getCurrentUser();
  if (profile?.role !== "super_admin") redirect("/dashboard");

  const supabase = await createClient();
  if (!supabase) return null;

  const [{ data: appSettings }, { data: categories }] = await Promise.all([
    supabase.from("app_settings").select("*"),
    supabase.from("categories").select("*").order("name")
  ]);

  const getSetting = (key: string, defaultValue: string | number) => {
    const s = appSettings?.find(s => s.key === key);
    return typeof s?.value === "string" || typeof s?.value === "number" ? s.value : defaultValue;
  };

  return (
    <AdminShell title="Configuración">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="ambient-card">
          <CardHeader>
            <CardTitle>Límites del Sistema</CardTitle>
            <CardDescription>Valores globales para todos los usuarios.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction(updateAppSettingsAction)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="regular_listing_limit">Límite de publicaciones (Regulares)</Label>
                <Input 
                  id="regular_listing_limit" 
                  name="regular_listing_limit" 
                  type="number" 
                  defaultValue={getSetting("regular_listing_limit", SITE_CONFIG.defaultListingLimit)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_images_per_listing">Máximo de imágenes por mascota</Label>
                <Input 
                  id="max_images_per_listing" 
                  name="max_images_per_listing" 
                  type="number" 
                  defaultValue={getSetting("max_images_per_listing", SITE_CONFIG.defaultMaxImages)} 
                />
              </div>
              <div className="pt-4">
                <Button type="submit" className="w-full font-bold">Guardar Cambios</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="ambient-card">
          <CardHeader>
            <CardTitle>Contacto Administrativo</CardTitle>
            <CardDescription>Datos para solicitudes de organizaciones y soporte.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction(updateAppSettingsAction)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin_contact_whatsapp">WhatsApp de contacto</Label>
                <Input 
                  id="admin_contact_whatsapp" 
                  name="admin_contact_whatsapp" 
                  placeholder="+507 ..." 
                  defaultValue={getSetting("admin_contact_whatsapp", "")} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin_contact_email">Email de contacto</Label>
                <Input 
                  id="admin_contact_email" 
                  name="admin_contact_email" 
                  type="email" 
                  placeholder="admin@ejemplo.com" 
                  defaultValue={getSetting("admin_contact_email", "")} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin_contact_phone">Teléfono de contacto</Label>
                <Input
                  id="admin_contact_phone"
                  name="admin_contact_phone"
                  placeholder="+507 6000-0000"
                  defaultValue={getSetting("admin_contact_phone", SITE_CONFIG.supportPhone)}
                />
              </div>
              <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="social_instagram">Instagram</Label>
                  <Input id="social_instagram" name="social_instagram" type="url" placeholder="https://instagram.com/..." defaultValue={getSetting("social_instagram", "")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social_facebook">Facebook</Label>
                  <Input id="social_facebook" name="social_facebook" type="url" placeholder="https://facebook.com/..." defaultValue={getSetting("social_facebook", "")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social_tiktok">TikTok</Label>
                  <Input id="social_tiktok" name="social_tiktok" type="url" placeholder="https://tiktok.com/@..." defaultValue={getSetting("social_tiktok", "")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social_youtube">YouTube</Label>
                  <Input id="social_youtube" name="social_youtube" type="url" placeholder="https://youtube.com/..." defaultValue={getSetting("social_youtube", "")} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="social_x">X</Label>
                  <Input id="social_x" name="social_x" type="url" placeholder="https://x.com/..." defaultValue={getSetting("social_x", "")} />
                </div>
              </div>
              <div className="pt-4">
                <Button type="submit" className="w-full font-bold" variant="secondary">Actualizar Contacto</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 ambient-card">
          <CardHeader className="flex flex-col gap-4 space-y-0 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle>Categorías Disponibles</CardTitle>
              <CardDescription>Activa categorías y asigna el icono visible en la página pública.</CardDescription>
            </div>
            <form action={formAction(createCategoryAction)} className="grid gap-2 sm:grid-cols-[minmax(180px,1fr)_160px_auto] lg:w-[520px]">
              <Input name="name" placeholder="Nueva categoría..." className="h-9" required aria-label="Nombre de nueva categoría" />
              <Select name="icon" className="h-9" defaultValue="paw" aria-label="Icono de nueva categoría">
                {CATEGORY_ICON_OPTIONS.map((icon) => (
                  <option key={icon.value} value={icon.value}>
                    {icon.label}
                  </option>
                ))}
              </Select>
              <Button size="sm" type="submit">Agregar</Button>
            </form>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {categories?.map((cat) => {
                const Icon = getCategoryIcon(cat.icon, cat.slug);

                return (
                  <div key={cat.id} className="grid gap-3 rounded-lg border bg-muted/30 p-3 md:grid-cols-[1fr_minmax(240px,360px)_auto] md:items-center">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                        <Icon className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">{cat.icon ?? "Icono por defecto"}</p>
                      </div>
                    </div>
                    <form action={formAction(updateCategoryIconAction)} className="grid gap-2 sm:grid-cols-[1fr_auto]">
                      <input name="categoryId" type="hidden" value={cat.id} />
                      <Select name="icon" defaultValue={cat.icon ?? ""} aria-label={`Icono de ${cat.name}`} className="h-9">
                        <option value="">Icono por defecto</option>
                        {CATEGORY_ICON_OPTIONS.map((icon) => (
                          <option key={icon.value} value={icon.value}>
                            {icon.label}
                          </option>
                        ))}
                      </Select>
                      <Button size="sm" type="submit" variant="secondary">Guardar</Button>
                    </form>
                    <div className="flex items-center justify-between gap-3 md:justify-end">
                      <span className="text-xs font-bold uppercase text-muted-foreground">
                        {cat.is_active ? "Activa" : "Oculta"}
                      </span>
                      <CategoryToggle
                        categoryId={cat.id}
                        isActive={cat.is_active}
                        name={cat.name}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
