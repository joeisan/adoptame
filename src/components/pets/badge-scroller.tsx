"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function BadgeScroller({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [children]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 150;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative mt-6 group/scroller">
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute -left-1 top-1/2 -translate-y-1/2 z-10 size-7 rounded-full bg-white border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors md:hidden"
          aria-label="Deslizar izquierda"
          type="button"
        >
          <ChevronLeft className="size-4" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex flex-nowrap gap-2 overflow-x-auto pb-1 no-scrollbar px-2 md:px-0 md:flex-wrap"
      >
        {children}
      </div>

      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute -right-1 top-1/2 -translate-y-1/2 z-10 size-7 rounded-full bg-white border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors md:hidden"
          aria-label="Deslizar derecha"
          type="button"
        >
          <ChevronRight className="size-4" />
        </button>
      )}
    </div>
  );
}
