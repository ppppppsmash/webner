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
  children?: { href: string; label: string }[];
}

export function MobileMenu({
  items,
  openLabel,
  closeLabel,
  children,
}: {
  items: MenuItem[];
  openLabel: string;
  closeLabel: string;
  children?: React.ReactNode;
}) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        className="inline-flex size-10 items-center justify-center text-brand lg:hidden"
      >
        <MenuIcon className="size-6" />
      </button>

      <div
        id={id}
        role="dialog"
        aria-modal="true"
        hidden={!open}
        className={cn("fixed inset-0 z-50 flex flex-col overflow-y-auto bg-paper text-ink", !open && "hidden")}
      >
        <div className="flex h-14 items-center justify-end border-b border-line px-4">
          <button
            ref={closeRef}
            type="button"
            aria-label={closeLabel}
            onClick={() => setOpen(false)}
            className="inline-flex size-10 items-center justify-center text-brand"
          >
            <XIcon className="size-6" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col px-6 pt-2">
          {items.map((item) => (
            <div key={item.href} className="border-b border-line py-3">
              <Link
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
                className={cn("font-display block text-2xl", item.accent ? "text-brand" : "text-ink")}
              >
                {item.label}
              </Link>
              {item.children?.length ? (
                <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 pl-1">
                  {item.children.map((c) => (
                    <li key={c.href}>
                      <Link href={c.href} className="text-sm text-ink-2 hover:text-brand">
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </nav>
        <div className="px-6 py-8">{children}</div>
      </div>
    </>
  );
}
