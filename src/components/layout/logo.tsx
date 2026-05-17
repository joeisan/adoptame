"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { SITE_CONFIG } from "@/lib/constants";

export function Logo() {
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      window.location.href = "/";
    }
  };

  return (
    <Link className="flex items-center gap-2 text-primary" href="/" onClick={handleClick}>
      <Image src="/logo_huellas.png" alt={SITE_CONFIG.name} width={40} height={40} className="object-contain" />
      <span className="text-lg font-bold text-foreground">{SITE_CONFIG.name}</span>
    </Link>
  );
}
