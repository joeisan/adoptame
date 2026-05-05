"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";

export function MobileMenuShell({ children }: { children: ReactNode }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  function closeOnAction(event: MouseEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    if (target.closest("a,button")) {
      detailsRef.current?.removeAttribute("open");
    }
  }

  return (
    <details className="group relative md:hidden" onClickCapture={closeOnAction} ref={detailsRef}>
      {children}
    </details>
  );
}
