"use client";

import { CheckIcon, ChevronDownIcon, GlobeIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { LOCALE_LABELS, PUBLIC_LOCALES, type Locale } from "@/lib/i18n/locales";
import { switchLocalePath } from "@/lib/i18n/paths";
import { cn } from "@/lib/utils";

type Props = {
  current: Locale;
  label: string;
  className?: string;
  /** dark: on white · light: on navy · tint: on the light-blue footer (needs the darker ink to stay readable) */
  tone?: "dark" | "light" | "tint";
  /** dropdown: a button that opens the list · inline: all languages side by side (inside the mobile menu, which is already a menu) */
  variant?: "dropdown" | "inline";
  /** Where the list opens. The footer sits at the bottom of the page, so it opens upwards there. */
  side?: "down" | "up";
  /** Which edge of the button the list lines up with. */
  align?: "start" | "end";
};

export function LocaleSwitcher(props: Props) {
  return props.variant === "inline" ? <InlineSwitcher {...props} /> : <DropdownSwitcher {...props} />;
}

function DropdownSwitcher({ current, label, className, tone = "dark", side = "down", align = "end" }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={root}
      className={cn("relative", className)}
      // Tabbing past the last language closes the list.
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "-mx-1.5 flex min-h-9 items-center gap-1.5 px-1.5 tracking-wide transition-colors duration-150",
          tone === "light" ? "text-paper/85 hover:text-paper" : tone === "tint" ? "text-ink hover:text-brand" : "text-ink-2 hover:text-ink",
        )}
      >
        <GlobeIcon aria-hidden className="size-3.5" />
        <span className="sr-only">{label}: </span>
        <span>{LOCALE_LABELS[current]}</span>
        <ChevronDownIcon aria-hidden className={cn("size-3.5 transition-transform duration-150 motion-reduce:transition-none", open && "rotate-180")} />
      </button>

      <nav
        id={listId}
        aria-label={label}
        hidden={!open}
        className={cn(
          // --focus is reset: the list is white even where the button sits on navy.
          "absolute z-[60] min-w-40 rounded-[2px] border border-line bg-paper py-1 text-[0.8125rem] tracking-normal text-ink shadow-[0_1px_2px_rgb(0_0_0/0.06),0_8px_24px_rgb(0_0_0/0.12)] [--focus:var(--brand)]",
          side === "up" ? "bottom-full mb-1" : "top-full mt-1",
          align === "end" ? "right-0" : "left-0",
        )}
      >
        <ul>
          {PUBLIC_LOCALES.map((locale) => (
            <li key={locale}>
              <Link
                href={switchLocalePath(pathname, locale)}
                hrefLang={locale}
                lang={locale}
                aria-current={locale === current ? "true" : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex min-h-11 items-center justify-between gap-4 px-3.5 transition-colors duration-150 hover:bg-tint-soft",
                  locale === current ? "font-semibold text-brand" : "text-ink",
                )}
              >
                {LOCALE_LABELS[locale]}
                {locale === current ? <CheckIcon aria-hidden className="size-4" /> : null}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function InlineSwitcher({ current, label, className }: Props) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className={cn("-mx-2 flex flex-wrap items-center text-[0.75rem] tracking-wide", className)}>
      {PUBLIC_LOCALES.map((locale, i) => (
        <span key={locale} className="flex items-center">
          {i > 0 ? (
            <span aria-hidden className="text-line">
              |
            </span>
          ) : null}
          <Link
            href={switchLocalePath(pathname, locale)}
            hrefLang={locale}
            lang={locale}
            aria-current={locale === current ? "true" : undefined}
            className={cn(
              "px-2 py-2.5 transition-colors",
              locale === current ? "font-semibold text-brand underline underline-offset-4" : "text-ink-2 hover:text-ink",
            )}
          >
            {LOCALE_LABELS[locale]}
          </Link>
        </span>
      ))}
    </nav>
  );
}
