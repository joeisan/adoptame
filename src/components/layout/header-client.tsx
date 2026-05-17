"use client";

import Link from "next/link";
import { Menu, Plus, UserRound, Heart, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/language-context";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { MobileMenuShell } from "@/components/layout/mobile-menu-shell";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

type HeaderClientProps = {
  isLoggedIn: boolean;
  profileName: string;
  role?: string | null;
  signOutAction: (payload: FormData) => void;
};

export function HeaderClient({ isLoggedIn, profileName, role, signOutAction }: HeaderClientProps) {
  const { t } = useLanguage();
  const pathname = usePathname();

  const handleLinkClick = (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href === "/" && pathname === "/") {
      e.preventDefault();
      window.location.href = "/";
    }
  };

  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/explore", label: t("nav.explore") },
    { href: "/categories", label: t("nav.categories") }
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/88 backdrop-blur-xl">
      <div className="container-shell flex h-20 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex" aria-label={t("nav.mainNav")}>
          {links.map((link) => (
            <Link className="text-sm font-semibold text-muted-foreground hover:text-foreground" href={link.href} key={link.href} onClick={handleLinkClick(link.href)}>
              {link.label}
            </Link>
          ))}
          <Link className="text-sm font-semibold text-muted-foreground hover:text-foreground" href="/dashboard/listings/new">
            {t("nav.post")}
          </Link>
        </nav>
        
        {/* Desktop Right Side */}
        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          {isLoggedIn ? (
            <>
              <Button asChild variant="ghost">
                <Link href="/dashboard">
                  <UserRound className="size-4 mr-2" />
                  {profileName}
                </Link>
              </Button>
              {role === "super_admin" ? (
                <Button asChild variant="outline">
                  <Link href="/super-admin">{t("common.superAdmin")}</Link>
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
                    {t("auth.signOut")}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">{t("auth.signIn")}</Link>
              </Button>
              <Button asChild>
                <Link href="/register">{t("auth.signUp")}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Right Side */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          {isLoggedIn && (
            <Link 
              href="/dashboard" 
              className="flex size-11 items-center justify-center rounded-full border bg-card text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
            >
              <UserRound className="size-5" />
            </Link>
          )}
          <MobileMenuShell>
            <summary className="flex size-11 list-none items-center justify-center rounded-full border bg-card cursor-pointer">
              <Menu className="size-5" />
            </summary>
            <div className="absolute right-0 mt-3 w-72 z-50 rounded-xl border bg-card p-3 shadow-xl">
              {links.map((link) => (
                <Link className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-muted" href={link.href} key={link.href} onClick={handleLinkClick(link.href)}>
                  {link.label}
                </Link>
              ))}
              <Link className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-muted" href="/dashboard/listings/new">
                <Plus className="size-4" />
                {t("nav.post")}
              </Link>
              <div className="mt-3 grid gap-2 border-t pt-3">
                {isLoggedIn ? (
                  <>
                    <Button asChild variant="outline" className="justify-start gap-2">
                      <Link href="/favorites">
                        <Heart className="size-4 text-destructive fill-current" />
                        {t("fav.favorites")}
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start gap-2">
                      <Link href="/dashboard">
                        <UserRound className="size-4" />
                        {t("dash.dashboard")}
                      </Link>
                    </Button>
                    {role === "super_admin" ? (
                      <Button asChild variant="secondary" className="justify-start gap-2">
                        <Link href="/super-admin">
                          <ShieldCheck className="size-4" />
                          {t("common.superAdmin")}
                        </Link>
                      </Button>
                    ) : null}
                    <form action={signOutAction}>
                      <Button className="w-full" type="submit" variant="outline">
                        {t("auth.signOut")}
                      </Button>
                    </form>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline">
                      <Link href="/login">{t("auth.signIn")}</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/register">{t("auth.signUp")}</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </MobileMenuShell>
        </div>
      </div>
    </header>
  );
}
