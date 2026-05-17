"use client";

import Link from "next/link";
import { LockKeyhole, Mail, Phone } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { panamaWhatsappUrl } from "@/lib/utils";
import type { PetContact } from "@/types/app";

function formAction(action: (formData: FormData) => Promise<unknown>) {
  return action as unknown as (formData: FormData) => void;
}

export function ContactLock({ slug }: { slug: string }) {
  const { t } = useLanguage();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LockKeyhole className="size-5 text-primary" />
          {t("contact.protected")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">
          {t("contact.protectedDesc")}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button asChild variant="outline">
            <Link href={`/login?redirect=/pets/${slug}`}>{t("contact.signIn")}</Link>
          </Button>
          <Button asChild>
            <Link href={`/register?redirect=/pets/${slug}`}>{t("contact.signUp")}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ContactPanel({ contact, listingId, slug }: { contact: PetContact; listingId: string; slug: string }) {
  const { t } = useLanguage();
  const message = encodeURIComponent(`${t("contact.interested")} ${typeof window !== "undefined" ? window.location.href : ""}`);
  let whatsapp = panamaWhatsappUrl(contact.contactWhatsapp ?? contact.contactPhone);
  if (whatsapp) whatsapp += `?text=${message}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("contact.data")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2 text-sm">
          <p className="font-semibold">{contact.contactName ?? t("pet.publisher")}</p>
          {contact.contactPhone ? (
            <p className="flex items-center gap-2">
              <Phone className="size-4 text-primary" />
              {contact.contactPhone}
            </p>
          ) : null}
          {contact.contactEmail ? (
            <p className="flex items-center gap-2">
              <Mail className="size-4 text-primary" />
              {contact.contactEmail}
            </p>
          ) : null}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {whatsapp ? (
            <Button asChild>
              <a href={whatsapp} rel="noreferrer" target="_blank">
                WhatsApp
              </a>
            </Button>
          ) : null}
          {contact.contactEmail ? (
            <Button asChild variant="outline">
              <a href={`mailto:${contact.contactEmail}`}>Email</a>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
