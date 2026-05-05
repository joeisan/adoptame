import Link from "next/link";
import { Heart, Home, Search } from "lucide-react";

import { getCurrentUser } from "@/lib/permissions";

const guestItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explora", icon: Search }
];

const userItems = [...guestItems, { href: "/favorites", label: "Favoritos", icon: Heart }];

export async function MobileBottomNav() {
  const { user } = await getCurrentUser();
  const items = user ? userItems : guestItems;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-card/95 px-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-sm" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-xs font-bold text-muted-foreground transition hover:bg-muted hover:text-primary"
              href={item.href}
              key={item.href}
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
