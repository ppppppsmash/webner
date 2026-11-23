"use client";

import { useEffect, useRef } from "react";

/** Horizontal chip row that brings the selected chip (aria-current="page") into view. */
export function ChipScroller({ activeKey, className, children }: { activeKey: string | null; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = ref.current;
    const active = row?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!row || !active) return;
    const r = row.getBoundingClientRect();
    const a = active.getBoundingClientRect();
    // Centre it by scrolling the row only (scrollIntoView would also move the page).
    row.scrollLeft += a.left - r.left - (r.width - a.width) / 2;
  }, [activeKey]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
