import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Registro"
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function RegisterPage({ searchParams }: { searchParams: SearchParams }) {
  const { user } = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const redirectTo = Array.isArray(params.redirect) ? params.redirect[0] : params.redirect;

  return (
    <section className="container-shell grid min-h-[70vh] place-items-center py-12">
      <div className="w-full space-y-5">
        <AuthForm mode="register" redirectTo={redirectTo} />
        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link className="font-semibold text-primary" href={`/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </section>
  );
}
