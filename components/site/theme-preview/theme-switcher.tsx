"use client";

import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, PaletteIcon, XIcon } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "./themes";

export interface SwitcherTheme {
  id: string;
  group: string;
  name: string;
  /** Resolved swatch colours (the definitions may use color-mix) */
  brand: string;
  deep: string;
  soft: string;
}

// The applied theme lives on <html data-theme>, set before paint by the inline script in ThemePreview.
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => void listeners.delete(cb);
};
const readTheme = () => document.documentElement.dataset.theme ?? "";

function applyTheme(id: string) {
  if (id) document.documentElement.dataset.theme = id;
  else delete document.documentElement.dataset.theme;
  try {
    if (id) localStorage.setItem(THEME_STORAGE_KEY, id);
    else localStorage.removeItem(THEME_STORAGE_KEY);
  } catch {
    // private mode: the choice simply lasts for this page view
  }
  for (const l of listeners) l();
}

/**
 * Inline script that restores the saved palette. It must execute only from the server-rendered HTML:
 * React never runs scripts it creates on the client and warns about them, so there it is rendered as
 * an inert data block (the differing `type` is why the hydration warning is suppressed).
 */
export function RestoreScript({ code }: { code: string }) {
  return <script type={typeof window === "undefined" ? "text/javascript" : "application/json"} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: code }} />;
}

/** TEMPORARY review tool: floating palette picker. UI text is Traditional Chinese like the management panel. */
export function ThemeSwitcher({ themes }: { themes: SwitcherTheme[] }) {
  const current = useSyncExternalStore(subscribe, readTheme, () => "");
  const [open, setOpen] = useState(false);

  const order = ["", ...themes.map((t) => t.id)];
  const index = Math.max(0, order.indexOf(current));
  const step = (d: number) => applyTheme(order[(index + d + order.length) % order.length]);
  const active = themes.find((t) => t.id === current);
  const groups = [...new Set(themes.map((t) => t.group))];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const swatch = (a: string, b: string) => (
    <span aria-hidden className="flex shrink-0 overflow-hidden border border-black/15">
      <span className="block size-4" style={{ background: a }} />
      <span className="block size-4" style={{ background: b }} />
    </span>
  );

  const option = (id: string, name: string, a: string, b: string) => (
    <li key={id || "default"}>
      <button
        type="button"
        aria-pressed={current === id}
        onClick={() => applyTheme(id)}
        className="flex min-h-9 w-full items-center gap-2.5 px-3 py-1.5 text-left text-[13px] text-neutral-800 hover:bg-neutral-100 aria-pressed:bg-neutral-100 aria-pressed:font-semibold"
      >
        {swatch(a, b)}
        <span className="min-w-0 flex-1">{name}</span>
        {current === id ? <CheckIcon aria-hidden className="size-4 shrink-0" /> : null}
      </button>
    </li>
  );

  return (
    <div className="fixed right-3 bottom-3 z-40 flex flex-col items-end gap-2 font-sans" style={{ "--focus": "#111" } as React.CSSProperties}>
      {open ? (
        <div role="dialog" aria-label="配色預覽" className="flex max-h-[min(34rem,calc(100svh-6rem))] w-[17.5rem] flex-col border border-neutral-300 bg-white shadow-[0_18px_40px_-16px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between border-b border-neutral-200 py-1.5 pr-1.5 pl-3">
            <p className="text-[13px] font-semibold text-neutral-900">配色預覽（審閱用，暫時）</p>
            <button type="button" aria-label="關閉" onClick={() => setOpen(false)} className="flex size-9 items-center justify-center text-neutral-700 hover:bg-neutral-100">
              <XIcon className="size-4" />
            </button>
          </div>
          <div className="overflow-y-auto overscroll-contain py-1">
            <ul>{option("", "現行（深藍）", "#252d51", "#e1eff9")}</ul>
            {groups.map((g) => (
              <section key={g}>
                <h2 className="px-3 pt-3 pb-1 text-[11px] font-semibold tracking-wider text-neutral-500" style={{ fontFamily: "inherit" }}>
                  {g}
                </h2>
                <ul>{themes.filter((t) => t.group === g).map((t) => option(t.id, t.name, t.deep, t.soft))}</ul>
              </section>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex items-stretch border border-neutral-300 bg-white text-neutral-900 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.45)]">
        <button type="button" aria-label="上一個配色" onClick={() => step(-1)} className="flex size-10 items-center justify-center hover:bg-neutral-100">
          <ChevronLeftIcon className="size-4" />
        </button>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="flex max-w-[12.5rem] items-center gap-2 border-x border-neutral-300 px-3 text-[13px] font-medium hover:bg-neutral-100"
        >
          <PaletteIcon aria-hidden className="size-4 shrink-0" />
          <span className="truncate">{active ? active.name : "現行（深藍）"}</span>
          <span className="shrink-0 text-neutral-500 tabular-nums">
            {index + 1}/{order.length}
          </span>
        </button>
        <button type="button" aria-label="下一個配色" onClick={() => step(1)} className="flex size-10 items-center justify-center hover:bg-neutral-100">
          <ChevronRightIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
