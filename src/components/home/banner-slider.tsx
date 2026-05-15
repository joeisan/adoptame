"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

import { Button } from "@/components/ui/button";

type Banner = {
  id: string;
  image_url: string;
  link_url: string | null;
  title: string | null;
};

export function BannerSlider({ banners }: { banners: Banner[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ active: false, moved: false, startX: 0, scrollLeft: 0 });
  const [activeBanner, setActiveBanner] = useState<Banner | null>(null);

  function getScrollStep() {
    const node = scrollerRef.current;
    if (!node) return 0;

    const firstChild = node.firstElementChild as HTMLElement | null;
    if (firstChild) {
      const styles = window.getComputedStyle(node);
      const gap = Number.parseFloat(styles.columnGap || styles.gap || "0");
      return firstChild.offsetWidth + gap;
    }

    return node.clientWidth;
  }

  useEffect(() => {
    if (banners.length <= 3 || activeBanner) return;

    const interval = setInterval(() => {
      const node = scrollerRef.current;
      if (!node) return;

      const step = getScrollStep();
      if (!step) return;

      if (node.scrollLeft + node.clientWidth >= node.scrollWidth - step / 2) {
        node.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        node.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeBanner, banners.length]);

  if (!banners.length) return null;

  function scrollByPage(direction: "left" | "right") {
    const node = scrollerRef.current;
    if (!node) return;

    const step = getScrollStep();
    if (!step) return;

    node.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth"
    });
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    const node = scrollerRef.current;
    if (!node) return;
    dragState.current = { active: true, moved: false, startX: event.clientX, scrollLeft: node.scrollLeft };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const node = scrollerRef.current;
    if (!node || !dragState.current.active) return;

    const delta = event.clientX - dragState.current.startX;
    if (Math.abs(delta) > 5) {
      if (!dragState.current.moved) {
        dragState.current.moved = true;
        node.setPointerCapture(event.pointerId);
      }
    }

    if (dragState.current.moved) {
      node.scrollLeft = dragState.current.scrollLeft - delta;
    }
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    const node = scrollerRef.current;
    dragState.current.active = false;
    if (node?.hasPointerCapture(event.pointerId)) {
      node.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <section className="container-shell py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-primary">Destacados</p>
          <h2 className="mt-2 text-3xl font-black">Novedades y eventos</h2>
        </div>
        <div className="flex gap-2">
          <Button aria-label="Anterior banner" onClick={() => scrollByPage("left")} size="icon" type="button" variant="outline">
            <ChevronLeft className="size-4" />
          </Button>
          <Button aria-label="Siguiente banner" onClick={() => scrollByPage("right")} size="icon" type="button" variant="outline">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="relative">
        <div
          className="no-scrollbar flex cursor-grab snap-x gap-4 overflow-x-auto pb-4 active:cursor-grabbing"
          onClickCapture={(event) => {
            if (!dragState.current.moved) return;
            event.preventDefault();
            event.stopPropagation();
            dragState.current.moved = false;
          }}
          onPointerCancel={endDrag}
          onPointerDown={onPointerDown}
          onPointerLeave={endDrag}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          ref={scrollerRef}
        >
          {banners.map((banner) => (
            <div
              className="group relative aspect-[4/5] w-[82vw] shrink-0 snap-start overflow-hidden rounded-2xl bg-muted shadow-sm transition-transform hover:-translate-y-1 md:w-[calc(50%-8px)] lg:w-[calc((100%-32px)/3)]"
              key={banner.id}
              onClick={() => setActiveBanner(banner)}
            >
              <Image
                alt={banner.title ?? "Banner"}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 85vw"
                src={banner.image_url}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100" />

              {banner.title ? (
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="line-clamp-2 text-lg font-bold drop-shadow-md">{banner.title}</p>
                </div>
              ) : null}

              <div className="absolute right-4 top-4 cursor-pointer rounded-full bg-white/90 p-2.5 text-primary opacity-0 shadow-xl backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:opacity-100">
                <ZoomIn className="size-5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeBanner ? (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 animate-in fade-in duration-300 backdrop-blur-sm"
          onClick={() => setActiveBanner(null)}
        >
          <button
            aria-label="Cerrar"
            className="absolute right-4 top-4 z-[120] rounded-full bg-white/10 p-3 text-white transition-all hover:bg-white/20 active:scale-95 md:right-8 md:top-8"
            onClick={(event) => {
              event.stopPropagation();
              setActiveBanner(null);
            }}
          >
            <X className="size-8" />
          </button>

          <div className="relative flex h-[85vh] w-[90vw] flex-col items-center justify-center gap-4">
            <div className="relative h-full w-full max-h-[75vh]">
              <Image
                alt={activeBanner.title ?? "Banner"}
                className="pointer-events-none select-none object-contain"
                fill
                priority
                sizes="90vw"
                src={activeBanner.image_url}
              />
            </div>

            {activeBanner.title || activeBanner.link_url ? (
              <div className="flex flex-col items-center gap-2 text-center" onClick={(event) => event.stopPropagation()}>
                {activeBanner.title ? <h3 className="text-xl font-bold text-white drop-shadow-md">{activeBanner.title}</h3> : null}
                {activeBanner.link_url ? (
                  <Button asChild size="lg" className="rounded-full px-8 shadow-lg">
                    <Link href={activeBanner.link_url} rel="noopener noreferrer" target="_blank">
                      Ver más detalles
                    </Link>
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
