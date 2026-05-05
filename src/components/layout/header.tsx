import Link from "next/link";
import { Menu, Plus, UserRound, Heart, ShieldCheck } from "lucide-react";

import { signOutAction } from "@/server/actions/auth";
import { getCurrentUser } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { MobileMenuShell } from "@/components/layout/mobile-menu-shell";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/explore", label: "Explorar" },
  { href: "/categories", label: "Categorías" }
];

export async function SiteHeader() {
  const { user, profile } = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/88 backdrop-blur-xl">
      <div className="container-shell flex h-20 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex" aria-label="Navegación principal">
          {links.map((link) => (
            <Link className="text-sm font-semibold text-muted-foreground hover:text-foreground" href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
          <Link className="text-sm font-semibold text-muted-foreground hover:text-foreground" href="/dashboard/listings/new">
            Publicar
          </Link>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Button asChild variant="ghost">
                <Link href="/dashboard">
                  <UserRound className="size-4" />
                  {profile?.displayName ?? "Dashboard"}
                </Link>
              </Button>
              {profile?.role === "super_admin" ? (
                <Button asChild variant="outline">
                  <Link href="/super-admin">Super admin</Link>
                </Button>
              ) : null}
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="icon" className="rounded-full border-2 bg-white text-destructive shadow-sm transition-all hover:bg-destructive hover:text-white active:scale-95">
                  <Link href="/favorites">
                    <Heart className="size-5 fill-current" />
                  </Link>
                </Button>
                <form action={signOutAction}>
                  <Button type="submit" variant="outline" className="rounded-full px-5">
                    Salir
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Iniciar sesión</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Registrarse</Link>
              </Button>
            </>
          )}
        </div>
        <MobileMenuShell>
          <summary className="flex size-11 list-none items-center justify-center rounded-full border bg-card">
            <Menu className="size-5" />
          </summary>
          <div className="absolute right-0 mt-3 w-72 rounded-xl border bg-card p-3 shadow-xl">
            {links.map((link) => (
              <Link className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-muted" href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
            <Link className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-muted" href="/dashboard/listings/new">
              <Plus className="size-4" />
              Publicar
            </Link>
            <div className="mt-3 grid gap-2 border-t pt-3">
              {user ? (
                <>
                  <Button asChild variant="outline" className="justify-start gap-2">
                    <Link href="/favorites">
                      <Heart className="size-4 text-destructive fill-current" />
                      Favoritos
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="justify-start gap-2">
                    <Link href="/dashboard">
                      <UserRound className="size-4" />
                      Dashboard
                    </Link>
                  </Button>
                  {profile?.role === "super_admin" ? (
                    <Button asChild variant="secondary" className="justify-start gap-2">
                      <Link href="/super-admin">
                        <ShieldCheck className="size-4" />
                        Super admin
                      </Link>
                    </Button>
                  ) : null}
                  <form action={signOutAction}>
                    <Button className="w-full" type="submit" variant="outline">
                      Salir
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Button asChild variant="outline">
                    <Link href="/login">Iniciar sesión</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">Registrarse</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </MobileMenuShell>
      </div>
    </header>
  );
}
