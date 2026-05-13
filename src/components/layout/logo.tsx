import Link from "next/link";
import Image from "next/image";

import { SITE_CONFIG } from "@/lib/constants";

export function Logo() {
  return (
    <Link className="flex items-center gap-2 text-primary" href="/">
      <Image src="/logo_huellas.png" alt={SITE_CONFIG.name} width={40} height={40} className="object-contain" />
      <span className="text-lg font-bold text-foreground">{SITE_CONFIG.name}</span>
    </Link>
  );
}
