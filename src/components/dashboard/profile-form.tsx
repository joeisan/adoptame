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
import { useLanguage } from "@/lib/language-context";

type ProfileRow = Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
type ProfileFormProfile = ProfileRow & { wants_to_be_organization?: boolean; contact_name?: string | null };

export function ProfileForm({ profile, redirectTo }: { profile: ProfileFormProfile; redirectTo?: string }) {
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const showsOrganizationFields = Boolean(
    profile?.role === "organization" ||
    profile?.wants_to_be_organization ||
    profile?.organization_type ||
    profile?.organization_name
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateProfileAction(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(t("profile.updated"));
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {redirectTo ? <input type="hidden" name="redirect" value={redirectTo} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="displayName">{showsOrganizationFields ? t("profile.contactName") : t("profile.displayName")}</Label>
          <Input id="displayName" name="displayName" defaultValue={profile?.contact_name || profile?.display_name || profile?.full_name || ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t("profile.contactEmail")}</Label>
          <Input id="email" name="email" type="email" defaultValue={profile?.email || ""} />
        </div>
      </div>

      {showsOrganizationFields ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="organizationName">{t("profile.orgNameLabel")}</Label>
            <Input
              id="organizationName"
              name="organizationName"
              defaultValue={profile?.organization_name || profile?.display_name || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organizationType">{t("profile.orgTypeLabel")}</Label>
            <select
              id="organizationType"
              name="organizationType"
              defaultValue={profile?.organization_type || "Organización"}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="Fundación">{t("auth.orgFoundation")}</option>
              <option value="ONG">{t("auth.orgNgo")}</option>
              <option value="Organización">{t("auth.orgGroup")}</option>
            </select>
          </div>
          <p className="text-xs text-muted-foreground md:col-span-2">{t("profile.orgDirectoryNote")}</p>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="description">{t("profile.bio")}</Label>
        <Textarea id="description" name="description" defaultValue={profile?.description || ""} className="h-32" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="province">{t("filter.province")}</Label>
          <Select name="province" defaultValue={profile?.province || ""}>
            <option value="">{t("filter.selectProvince")}</option>
            {PANAMA_PROVINCES.map((prov) => (
              <option key={prov} value={prov}>{prov}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="district">{t("filter.district")}</Label>
          <Input id="district" name="district" defaultValue={profile?.district || ""} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">{t("profile.phone")}</Label>
          <Input id="phone" name="phone" defaultValue={profile?.phone || ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp">{t("profile.whatsapp")}</Label>
          <Input id="whatsapp" name="whatsapp" defaultValue={profile?.whatsapp || ""} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">{t("profile.socialMedia")}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="website">{t("profile.website")}</Label>
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
        {isPending ? t("profile.saving") : t("profile.saveChanges")}
        <Save className="ml-2 size-4" />
      </Button>
    </form>
  );
}
