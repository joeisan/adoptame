"use client";

import { Globe } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "es" ? "en" : "es")}
      className="inline-flex items-center gap-1 rounded-full border bg-card p-1 text-xs font-bold transition-all hover:border-primary active:scale-95"
      aria-label="Switch language"
    >
      <Globe className="size-3.5 ml-1.5 text-muted-foreground" />
      <span
        className={`rounded-full px-2 py-1 transition-all duration-200 ${
          locale === "es"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        ES
      </span>
      <span
        className={`rounded-full px-2 py-1 transition-all duration-200 ${
          locale === "en"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </span>
    </button>
  );
}
