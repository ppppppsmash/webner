"use client";

import { MonitorIcon, PaletteIcon, SmartphoneIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { t } from "@/lib/i18n/admin";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { DEFAULT_SITE_THEME, SITE_THEMES, siteThemeCss, type SiteTheme } from "@/lib/site-themes";
import { cn } from "@/lib/utils";

/** Themes in the order of the list, grouped under their heading. */
const THEME_GROUPS = [...new Set(SITE_THEMES.map((theme) => theme.group))].map((group) => ({
  group,
  themes: SITE_THEMES.filter((theme) => theme.group === group),
}));

/** The page is laid out at a real screen width and scaled down to fit, so it looks like the site and not like its phone version. */
const SCREENS = { desktop: { width: 1280, height: 800 }, phone: { width: 390, height: 620 } } as const;
type Screen = keyof typeof SCREENS;

const PREVIEW_STYLE_ID = "site-theme-preview";

function Swatch({ theme, className }: { theme: SiteTheme; className?: string }) {
  return (
    <span aria-hidden className={cn("flex shrink-0 overflow-hidden rounded-sm border", className)}>
      <span className="size-5" style={{ background: theme.deep }} />
      <span className="size-5" style={{ background: theme.brand }} />
      <span className="size-5" style={{ background: theme.soft }} />
    </span>
  );
}

/**
 * Repaints the public site shown in the frame without saving anything: same origin, so the theme rules and
 * `data-theme` are written straight into its document (exactly what the site layout does with the saved theme).
 */
function paint(frame: HTMLIFrameElement | null, themeId: string) {
  const doc = frame?.contentDocument;
  if (!doc?.head) return;
  let style = doc.getElementById(PREVIEW_STYLE_ID);
  if (!style) {
    style = doc.createElement("style");
    style.id = PREVIEW_STYLE_ID;
    doc.head.appendChild(style);
  }
  style.textContent = siteThemeCss(themeId);
  doc.documentElement.dataset.theme = themeId;
}

function ThemeDialog({ value, onApply, onClose }: { value: string; onApply: (id: string) => void; onClose: () => void }) {
  const [candidate, setCandidate] = useState(value);
  const [screen, setScreen] = useState<Screen>("desktop");
  const [scale, setScale] = useState(0.5);
  const frame = useRef<HTMLIFrameElement>(null);
  const observer = useRef<ResizeObserver | null>(null);
  const size = SCREENS[screen];

  // Fit the frame to the space it is given.
  const stage = useCallback(
    (node: HTMLDivElement | null) => {
      observer.current?.disconnect();
      if (!node) return;
      observer.current = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / size.width)));
      observer.current.observe(node);
    },
    [size.width],
  );

  useEffect(() => paint(frame.current, candidate), [candidate]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>{t.settings.themeDialogTitle}</DialogTitle>
          <DialogDescription>{t.settings.themeDialogDescription}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <div role="radiogroup" aria-label={t.settings.theme} className="max-h-48 space-y-3 overflow-y-auto pr-1 lg:max-h-[60dvh]">
            {THEME_GROUPS.map(({ group, themes }) => (
              <div key={group}>
                <p className="mb-1 text-xs text-muted-foreground">{group}</p>
                <div className="space-y-1">
                  {themes.map((theme) => (
                    <label
                      key={theme.id}
                      className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md border border-transparent px-2 py-1.5 transition-colors hover:bg-muted/60 has-checked:border-primary has-checked:bg-muted has-focus-visible:ring-2 has-focus-visible:ring-ring"
                    >
                      <input
                        type="radio"
                        name="siteThemeCandidate"
                        value={theme.id}
                        checked={candidate === theme.id}
                        onChange={() => setCandidate(theme.id)}
                        className="sr-only"
                      />
                      <Swatch theme={theme} />
                      <span className="min-w-0 flex-1 leading-snug">{theme.name}</span>
                      {theme.id === DEFAULT_SITE_THEME ? <span className="shrink-0 text-xs text-muted-foreground">{t.settings.themeDefault}</span> : null}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="min-w-0">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">{t.settings.themePreviewNote}</p>
              <div className="flex shrink-0 gap-1">
                {(["desktop", "phone"] as const).map((s) => (
                  <Button key={s} type="button" size="sm" variant={screen === s ? "secondary" : "ghost"} aria-pressed={screen === s} onClick={() => setScreen(s)}>
                    {s === "desktop" ? <MonitorIcon /> : <SmartphoneIcon />}
                    {s === "desktop" ? t.settings.themeDesktop : t.settings.themePhone}
                  </Button>
                ))}
              </div>
            </div>
            <div ref={stage} className="flex justify-center overflow-hidden rounded-md border bg-muted/40">
              <div style={{ width: size.width * scale, height: size.height * scale }}>
                <iframe
                  ref={frame}
                  src={`/${DEFAULT_LOCALE}`}
                  title={t.settings.themePreviewTitle}
                  onLoad={() => paint(frame.current, candidate)}
                  style={{ width: size.width, height: size.height, transform: `scale(${scale})`, transformOrigin: "top left" }}
                  className="block border-0 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onApply(candidate);
              onClose();
            }}
          >
            {t.settings.themeApply}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** The chosen colour theme on one line; the full list and a live preview of the public site open in a dialog. */
export function ThemeField({ value, onChange, disabled }: { value: string; onChange: (id: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const current = SITE_THEMES.find((theme) => theme.id === value) ?? SITE_THEMES.find((theme) => theme.id === DEFAULT_SITE_THEME)!;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-md border px-3 py-2">
        <Swatch theme={current} />
        <span className="min-w-0 flex-1 text-sm">{current.name}</span>
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => setOpen(true)}>
          <PaletteIcon />
          {t.settings.themeChange}
        </Button>
      </div>
      {/* Mounted only while open, so every opening starts from the current choice. */}
      {open ? <ThemeDialog value={current.id} onApply={onChange} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
