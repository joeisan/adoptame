import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser } from "@/lib/permissions";
import { Translate } from "@/components/layout/translate";

export const metadata: Metadata = {
  title: "Iniciar sesión"
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { user } = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const redirectTo = Array.isArray(params.redirect) ? params.redirect[0] : params.redirect;

  return (
    <section className="container-shell grid min-h-[70vh] place-items-center py-12">
      <div className="w-full space-y-5">
        <AuthForm mode="login" redirectTo={redirectTo} />
        <p className="text-center text-sm text-muted-foreground">
          <Translate id="auth.noAccount" />{" "}
          <Link className="font-semibold text-primary" href={`/register${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}>
            <Translate id="auth.register" />
          </Link>
        </p>
      </div>
    </section>
  );
}
