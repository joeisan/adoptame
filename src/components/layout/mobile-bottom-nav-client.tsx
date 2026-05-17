"use client";

import Link from "next/link";
import { Heart, Home, Search, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function MobileBottomNavClient({
  isLoggedIn,
  role
}: {
  isLoggedIn: boolean;
  role?: string | null;
}) {
  const { t } = useLanguage();

  const guestItems = [
    { href: "/", label: t("nav.home"), icon: Home },
    { href: "/explore", label: t("nav.explore"), icon: Search }
  ];

  const userItems = [...guestItems, { href: "/favorites", label: t("fav.favorites"), icon: Heart }];

  const items = role === "super_admin"
    ? [...userItems, { href: "/super-admin", label: "Admin", icon: ShieldCheck }]
    : isLoggedIn
      ? userItems
      : guestItems;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-card/95 px-2 pb-[max(0.45rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_22px_rgba(0,0,0,0.08)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-sm" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              className="flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-lg text-[10px] font-bold leading-none text-muted-foreground transition hover:bg-muted hover:text-primary"
              href={item.href}
              key={item.href}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
