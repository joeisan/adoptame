import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/permissions";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { PasswordForm } from "@/components/dashboard/password-form";
import type { Database } from "@/types/database";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ProfilePage({ searchParams }: { searchParams: SearchParams }) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard/profile");

  const params = await searchParams;
  const isOnboarding = params.onboarding === "1";
  const redirectTo = Array.isArray(params.redirect) ? params.redirect[0] : params.redirect;
  const supabase = await createClient();
  const [{ data: profileData }, { data: organizationData }] = await Promise.all([
    supabase?.from("profiles").select("*").eq("id", user.id).maybeSingle() ?? Promise.resolve({ data: null }),
    supabase?.from("organizations").select("name,type,slug").eq("owner_id", user.id).maybeSingle() ?? Promise.resolve({ data: null })
  ]);
  const profile = profileData as Database["public"]["Tables"]["profiles"]["Row"] | null;
  const organization = organizationData as { name: string | null; type: string | null; slug: string | null } | null;
  const profileWithAuthEmail = profile
    ? {
        ...profile,
        email: profile.email || user.email || null,
        wants_to_be_organization: user.user_metadata?.wants_to_be_organization === true,
        organization_name:
          profile.organization_name ||
          organization?.name ||
          (typeof user.user_metadata?.organization_name === "string" ? user.user_metadata.organization_name : null),
        organization_type:
          profile.organization_type ||
          organization?.type ||
          (typeof user.user_metadata?.organization_type === "string" ? user.user_metadata.organization_type : null),
        contact_name:
          profile.display_name && profile.display_name !== profile.organization_name
            ? profile.display_name
            : profile.full_name || profile.display_name || null
      }
    : {
        email: user.email || null,
        wants_to_be_organization: user.user_metadata?.wants_to_be_organization === true,
        organization_name:
          organization?.name ||
          (typeof user.user_metadata?.organization_name === "string" ? user.user_metadata.organization_name : null),
        organization_type:
          organization?.type ||
          (typeof user.user_metadata?.organization_type === "string" ? user.user_metadata.organization_type : null),
        contact_name:
          typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null
      };
  const slug = profile?.role === "organization" ? organization?.slug || profile?.slug : profile?.slug;

  return (
    <section className="container-shell py-10">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>{isOnboarding ? "Completa tu perfil" : "Perfil Público"}</CardTitle>
            <CardDescription>
              {isOnboarding
                ? "Antes de publicar o contactar, necesitamos tu nombre y datos de contacto."
                : "Estos datos serán visibles para los usuarios que visiten tus publicaciones."}
            </CardDescription>
          </div>
          {slug ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/perfil/${slug}`}>
                <ExternalLink className="size-4 mr-1.5" />
                Ver mi perfil
              </Link>
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profileWithAuthEmail} redirectTo={redirectTo} />
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Seguridad</CardTitle>
          <CardDescription>
            Actualiza tu contraseña para mantener tu cuenta segura.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>
    </section>
  );
}
