"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfileAction } from "@/server/actions/profile";

import { PANAMA_PROVINCES } from "@/lib/constants";
import { Select } from "@/components/ui/select";
import type { Database } from "@/types/database";

type ProfileRow = Partial<Database["public"]["Tables"]["profiles"]["Row"]>;

export function ProfileForm({ profile, redirectTo }: { profile: ProfileRow; redirectTo?: string }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateProfileAction(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Perfil actualizado");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {redirectTo ? <input type="hidden" name="redirect" value={redirectTo} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="displayName">Nombre a mostrar</Label>
          <Input id="displayName" name="displayName" defaultValue={profile?.display_name || profile?.full_name || ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico (contacto)</Label>
          <Input id="email" name="email" type="email" defaultValue={profile?.email || ""} />
        </div>
      </div>

      {profile?.role === "organization" || profile?.organization_type ? (
        <div className="space-y-2">
          <Label htmlFor="organizationType">Tipo de Organización</Label>
          <select
            id="organizationType"
            name="organizationType"
            defaultValue={profile?.organization_type || "Organización"}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="Fundación">Fundación</option>
            <option value="ONG">ONG</option>
            <option value="Organización">Organización / Grupo</option>
          </select>
          <p className="text-xs text-muted-foreground">Define cómo aparecerás en el directorio y publicaciones.</p>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="description">Descripción / Biografía</Label>
        <Textarea id="description" name="description" defaultValue={profile?.description || ""} className="h-32" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="province">Provincia</Label>
          <Select name="province" defaultValue={profile?.province || ""}>
            <option value="">Selecciona provincia</option>
            {PANAMA_PROVINCES.map((prov) => (
              <option key={prov} value={prov}>{prov}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="district">Distrito / Ciudad</Label>
          <Input id="district" name="district" defaultValue={profile?.district || ""} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono de Contacto</Label>
          <Input id="phone" name="phone" defaultValue={profile?.phone || ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" name="whatsapp" defaultValue={profile?.whatsapp || ""} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Redes Sociales</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="website">Sitio web</Label>
            <Input id="website" name="website" type="url" placeholder="https://" defaultValue={profile?.website_url || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" name="instagram" type="url" placeholder="https://instagram.com/..." defaultValue={profile?.instagram_url || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input id="facebook" name="facebook" type="url" placeholder="https://facebook.com/..." defaultValue={profile?.facebook_url || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtube">YouTube</Label>
            <Input id="youtube" name="youtube" type="url" placeholder="https://youtube.com/..." defaultValue={profile?.youtube_url || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input id="linkedin" name="linkedin" type="url" placeholder="https://linkedin.com/in/..." defaultValue={profile?.linkedin_url || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telegram">Telegram</Label>
            <Input id="telegram" name="telegram" type="url" placeholder="https://t.me/..." defaultValue={profile?.telegram_url || ""} />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full md:w-auto">
        {isPending ? "Guardando..." : "Guardar Cambios"}
        <Save className="ml-2 size-4" />
      </Button>
    </form>
  );
}
