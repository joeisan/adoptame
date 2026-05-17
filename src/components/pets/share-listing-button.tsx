"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ShareListingButtonProps = {
  title: string;
  url: string;
};

function facebookUrl(url: string) {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

function xUrl(title: string, url: string) {
  return `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
}

function linkedInUrl(url: string) {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

function whatsappUrl(title: string, url: string) {
  return `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
}

function telegramUrl(title: string, url: string) {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
}

function emailUrl(title: string, url: string) {
  return `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${title}\n\n${url}`)}`;
}

const shareTargets = [
  { label: "Facebook", buildHref: (_title: string, url: string) => facebookUrl(url), className: "hover:border-[#1877F2]/40 hover:text-[#1877F2]" },
  { label: "X", buildHref: (title: string, url: string) => xUrl(title, url), className: "hover:border-foreground/40 hover:text-foreground" },
  { label: "LinkedIn", buildHref: (_title: string, url: string) => linkedInUrl(url), className: "hover:border-[#0A66C2]/40 hover:text-[#0A66C2]" },
  { label: "WhatsApp", buildHref: (title: string, url: string) => whatsappUrl(title, url), className: "hover:border-[#25D366]/40 hover:text-[#25D366]" },
  { label: "Telegram", buildHref: (title: string, url: string) => telegramUrl(title, url), className: "hover:border-[#26A5E4]/40 hover:text-[#26A5E4]" },
  { label: "Email", buildHref: (title: string, url: string) => emailUrl(title, url), className: "hover:border-primary/40 hover:text-primary" }
] as const;

export function ShareListingButton({ title, url }: ShareListingButtonProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

    async function copyLink() {
      try {
        await navigator.clipboard.writeText(url);
        toast.success(t("share.linkCopied"));
      } catch {
        toast.error(t("share.copyFail"));
      }
    }

  return (
    <div className="relative" ref={ref}>
      <Button onClick={() => setOpen((current) => !current)} type="button" variant="outline">
        <Share2 className="size-4 mr-2" />
        {t("share.share")}
      </Button>
      {open ? (
        <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-xl border bg-card p-3 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold">{t("share.shareListing")}</p>
            <button className="rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground" onClick={() => setOpen(false)} type="button">
              <X className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {shareTargets.map((target) => {
              const href = target.buildHref(title, url);

              return (
                <a
                  className={cn("inline-flex items-center justify-center rounded-full border px-3 py-2 text-sm font-semibold transition", target.className)}
                  href={href}
                  key={target.label}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {target.label}
                </a>
              );
            })}
          </div>
          <Button className="mt-3 w-full" onClick={copyLink} type="button" variant="ghost">
            <Copy className="size-4 mr-2" />
            {t("share.copyLink")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
