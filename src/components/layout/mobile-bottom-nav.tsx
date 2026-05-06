import Link from "next/link";
import { Heart, Home, Search, ShieldCheck } from "lucide-react";

import { getCurrentUser } from "@/lib/permissions";

const guestItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explora", icon: Search }
];

const userItems = [...guestItems, { href: "/favorites", label: "Favoritos", icon: Heart }];

export async function MobileBottomNav() {
  const { user, profile } = await getCurrentUser();
  const items = profile?.role === "super_admin"
    ? [...userItems, { href: "/super-admin", label: "Admin", icon: ShieldCheck }]
    : user
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
