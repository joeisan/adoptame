"use client";

import { Globe } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "es" ? "en" : "es")}
      className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-bold transition-all hover:border-primary hover:text-primary active:scale-95"
      aria-label="Switch language"
    >
      <Globe className="size-3.5" />
      <span className={locale === "es" ? "text-primary" : "text-muted-foreground"}>ES</span>
      <span className="text-muted-foreground/50">|</span>
      <span className={locale === "en" ? "text-primary" : "text-muted-foreground"}>EN</span>
    </button>
  );
}
