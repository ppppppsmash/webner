"use client";

import { MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface MenuItem {
  href: string;
  label: string;
  external?: boolean;
  accent?: boolean;
}

export function MobileMenu({ items, openLabel, closeLabel, children }: { items: MenuItem[]; openLabel: string; closeLabel: string; children?: React.ReactNode }) {
  const pathname = usePathname();
  // The menu is "open" only for the pathname it was opened on, so a navigation closes it.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;
  const setOpen = (next: boolean) => setOpenedAt(next ? pathname : null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      openRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={openRef}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={openLabel}
        onClick={() => setOpen(true)}
        className="inline-flex size-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-sage md:hidden"
      >
        <MenuIcon className="size-5" />
      </button>

      <div
        id={id}
        role="dialog"
        aria-modal="true"
        hidden={!open}
        className={cn("fixed inset-0 z-50 flex flex-col bg-paper text-ink", !open && "hidden")}
      >
        <div className="flex h-16 items-center justify-end px-4">
          <button
            ref={closeRef}
            type="button"
            aria-label={closeLabel}
            onClick={() => setOpen(false)}
            className="inline-flex size-10 items-center justify-center rounded-full hover:bg-sage"
          >
            <XIcon className="size-5" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-6 pt-4">
          {items.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noreferrer" : undefined}
              className={cn(
                "font-display border-b border-line py-4 text-3xl transition-colors hover:text-moss",
                item.accent && "text-moss",
              )}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-6 py-8">{children}</div>
      </div>
    </>
  );
}
