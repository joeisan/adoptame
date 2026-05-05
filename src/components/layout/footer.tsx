import Link from "next/link";

import { SITE_CONFIG } from "@/lib/constants";
import { Logo } from "@/components/layout/logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t bg-card/70">
      <div className="container-shell grid gap-10 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            {SITE_CONFIG.description} Plataforma enfocada en Panamá.
          </p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold">Enlaces</h2>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <Link href="/explore">Explorar</Link>
            <Link href="/dashboard/listings/new">Publicar</Link>
            <Link href="/register">Registro</Link>
            <Link href="/login">Iniciar sesión</Link>
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold">Legal</h2>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <span>Contacto: {SITE_CONFIG.supportEmail}</span>
            <span>Privacidad</span>
            <span>Términos</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
