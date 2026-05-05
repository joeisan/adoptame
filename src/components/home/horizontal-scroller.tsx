"use client";

import { useRef, type ReactNode, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HorizontalScroller({
  children,
  className,
  itemClassName,
  ariaLabel
}: {
  children: ReactNode[];
  className?: string;
  itemClassName?: string;
  ariaLabel: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ active: false, moved: false, startX: 0, scrollLeft: 0 });

  function scrollByPage(direction: "left" | "right") {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollBy({
      left: direction === "left" ? -node.clientWidth * 0.9 : node.clientWidth * 0.9,
      behavior: "smooth"
    });
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    const node = scrollerRef.current;
    if (!node) return;
    dragState.current = { active: true, moved: false, startX: event.clientX, scrollLeft: node.scrollLeft };
    node.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const node = scrollerRef.current;
    if (!node || !dragState.current.active) return;
    const delta = event.clientX - dragState.current.startX;
    if (Math.abs(delta) > 5) dragState.current.moved = true;
    node.scrollLeft = dragState.current.scrollLeft - delta;
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    const node = scrollerRef.current;
    dragState.current.active = false;
    if (node?.hasPointerCapture(event.pointerId)) {
      node.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <div className="relative">
      <div className="mb-4 flex justify-end gap-2">
        <Button aria-label={`Anterior: ${ariaLabel}`} onClick={() => scrollByPage("left")} size="icon" type="button" variant="outline">
          <ChevronLeft className="size-4" />
        </Button>
        <Button aria-label={`Siguiente: ${ariaLabel}`} onClick={() => scrollByPage("right")} size="icon" type="button" variant="outline">
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <div
        className={cn("no-scrollbar flex cursor-grab snap-x gap-4 overflow-x-auto pb-3 active:cursor-grabbing", className)}
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
        {children.map((child, index) => (
          <div className={cn("shrink-0 snap-start", itemClassName)} key={index}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
