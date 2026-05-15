import Image from "next/image";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser } from "@/lib/permissions";
import { getBanners } from "@/server/actions/banners";

export default async function AdminBannersPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const { profile } = await getCurrentUser();
  if (profile?.role !== "super_admin") redirect("/dashboard");

  const params = await searchParams;
  const banners = await getBanners();

  return (
    <AdminShell title="Gestión de Banners">
      <div className="grid gap-6">
        {params?.error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {params.error}
          </div>
        ) : null}
        {params?.success ? (
          <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
            {params.success}
          </div>
        ) : null}

        <Card className="ambient-card">
          <CardHeader>
            <CardTitle>Añadir Nuevo Banner</CardTitle>
            <CardDescription>Configura la imagen, el enlace y el orden del slider de inicio.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/api/admin/banners" className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_140px_150px_auto] xl:items-end" encType="multipart/form-data" method="post">
              <div className="space-y-2">
                <Label htmlFor="image_file">Imagen</Label>
                <Input accept="image/*" id="image_file" name="image_file" required type="file" />
                <p className="text-xs text-muted-foreground">Se recomienda una imagen vertical o cuadrada con buena legibilidad.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" name="title" placeholder="Ej. Jornada de adopción" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link_url">Enlace</Label>
                <Input id="link_url" name="link_url" placeholder="https://..." type="url" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order">Orden</Label>
                <Input defaultValue={0} id="display_order" name="display_order" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="is_active">Estado</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue="true"
                  id="is_active"
                  name="is_active"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
              <Button className="font-bold" type="submit">Añadir Banner</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="ambient-card">
          <CardHeader>
            <CardTitle>Banners Actuales</CardTitle>
            <CardDescription>Actualiza contenido, reemplaza imágenes, cambia el orden o desactiva banners sin borrarlos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 xl:grid-cols-2">
              {banners.map((banner) => (
                <div className="grid gap-4 rounded-2xl border bg-muted/30 p-4 lg:grid-cols-[220px_1fr]" key={banner.id}>
                  <div className="space-y-3">
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                      <Image alt={banner.title ?? "Banner"} className="object-cover" fill sizes="220px" src={banner.image_url} />
                    </div>
                    <div className="rounded-xl border bg-background/80 p-3 text-xs text-muted-foreground">
                      <p className="font-semibold text-foreground">{banner.is_active ? "Visible en home" : "Oculto"}</p>
                      <p>Orden actual: {banner.display_order}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <form action="/api/admin/banners" className="grid gap-4" encType="multipart/form-data" method="post">
                      <input name="id" type="hidden" value={banner.id} />
                      <input name="image_url" type="hidden" value={banner.image_url} />

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`title-${banner.id}`}>Título</Label>
                          <Input defaultValue={banner.title ?? ""} id={`title-${banner.id}`} name="title" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`link-${banner.id}`}>Enlace</Label>
                          <Input defaultValue={banner.link_url ?? ""} id={`link-${banner.id}`} name="link_url" type="url" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`order-${banner.id}`}>Orden</Label>
                          <Input defaultValue={banner.display_order} id={`order-${banner.id}`} name="display_order" type="number" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`active-${banner.id}`}>Estado</Label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            defaultValue={banner.is_active ? "true" : "false"}
                            id={`active-${banner.id}`}
                            name="is_active"
                          >
                            <option value="true">Activo</option>
                            <option value="false">Inactivo</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`image-${banner.id}`}>Reemplazar imagen</Label>
                        <Input accept="image/*" id={`image-${banner.id}`} name="image_file" type="file" />
                      </div>

                      <div>
                        <Button type="submit" variant="secondary">Guardar cambios</Button>
                      </div>
                    </form>

                    <div className="flex flex-wrap gap-2">
                      <form action="/api/admin/banners" method="post">
                        <input name="intent" type="hidden" value="toggle" />
                        <input name="id" type="hidden" value={banner.id} />
                        <input name="is_active" type="hidden" value={banner.is_active ? "false" : "true"} />
                        <Button type="submit" variant="outline">
                          {banner.is_active ? "Desactivar" : "Activar"}
                        </Button>
                      </form>
                      <form action="/api/admin/banners" method="post">
                        <input name="intent" type="hidden" value="delete" />
                        <input name="id" type="hidden" value={banner.id} />
                        <Button type="submit" variant="destructive">Eliminar</Button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}

              {banners.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed py-10 text-center text-muted-foreground">
                  No hay banners agregados todavía.
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
