"use client";

import { useLanguage } from "@/lib/language-context";
import type { TranslationKey } from "@/lib/translations";

export function Translate({ id }: { id: TranslationKey }) {
  const { t } = useLanguage();
  return <>{t(id)}</>;
}
