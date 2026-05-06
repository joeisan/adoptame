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
  const { data: profileData } = await supabase?.from("profiles").select("*").eq("id", user.id).maybeSingle() ?? {};
  const profile = profileData as Database["public"]["Tables"]["profiles"]["Row"] | null;
  const profileWithAuthEmail = profile
    ? { ...profile, email: profile.email || user.email || null }
    : { email: user.email || null };
  const slug = profile?.slug;

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
