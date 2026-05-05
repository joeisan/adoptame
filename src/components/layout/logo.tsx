import Link from "next/link";
import { PawPrint } from "lucide-react";

import { SITE_CONFIG } from "@/lib/constants";

export function Logo() {
  return (
    <Link className="flex items-center gap-2 text-primary" href="/">
      <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <PawPrint className="size-5" fill="currentColor" />
      </span>
      <span className="text-lg font-bold text-foreground">{SITE_CONFIG.name}</span>
    </Link>
  );
}
