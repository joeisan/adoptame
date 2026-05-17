"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

import { Button } from "@/components/ui/button";

export function HomeCTA() {
  const { t } = useLanguage();
  return (
    <section className="container-shell py-16">
      <div className="overflow-hidden rounded-[2rem] bg-primary p-8 text-primary-foreground ambient-card md:p-12">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-3xl font-black">{t("home.ctaTitle")}</h2>
            <p className="mt-3 max-w-2xl leading-7 text-primary-foreground/85">
              {t("home.ctaDesc")}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary">
              <Link href="/explore">
                <Search className="size-5 mr-2" />
                {t("home.ctaSearch")}
              </Link>
            </Button>
            <Button asChild className="bg-card text-foreground hover:bg-muted" size="lg">
              <Link href="/register">
                {t("home.ctaPublish")}
                <ArrowRight className="size-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
