"use client";

import { CheckIcon, PipetteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n/admin";
import { DEFAULT_SITE_NAME_COLOR } from "@/lib/settings/schema";
import { cn } from "@/lib/utils";

/** Ready-made colours: greys first (the default is the first one), then dark tones that stay readable on white. */
const PALETTE = [
  "#333333", "#000000", "#555555", "#777777",
  "#1f4a3a", "#2f5d50", "#3f4a2a", "#6b5b2e",
  "#1e2a4a", "#2b4c7e", "#0f4c5c", "#5a3e6b",
  "#5b3a29", "#8a4b2a", "#a0522d", "#7a1f2b",
];

const isHex = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value);

/** Colour of the site name: a palette to click, a free picker, and the code itself. */
export function NameColorField({
  id,
  value,
  onChange,
  onBlur,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}) {
  // The colour well only understands a complete #rrggbb; while a code is being typed it keeps the default.
  const colour = isHex(value) ? value.toLowerCase() : DEFAULT_SITE_NAME_COLOR;

  return (
    <div className="space-y-3">
      <div role="radiogroup" aria-label={t.settings.siteNameColorPalette} className="grid w-fit grid-cols-8 gap-1.5">
        {PALETTE.map((preset) => {
          const selected = colour === preset;
          return (
            <button
              key={preset}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={preset}
              title={preset}
              disabled={disabled}
              onClick={() => onChange(preset)}
              className={cn(
                "flex size-8 items-center justify-center rounded-md border transition-transform duration-150 hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none",
                selected && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
              )}
              style={{ background: preset }}
            >
              {selected ? <CheckIcon aria-hidden className="size-4 text-white" /> : null}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* The native picker sits invisibly over the button, so a click opens the system colour wheel. */}
        <span className="relative">
          <Button type="button" variant="outline" size="sm" disabled={disabled} tabIndex={-1} aria-hidden>
            <PipetteIcon />
            {t.settings.siteNameColorCustom}
          </Button>
          <input
            type="color"
            aria-label={t.settings.siteNameColorCustom}
            value={colour}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          />
        </span>
        <span aria-hidden className="size-8 shrink-0 rounded-md border" style={{ background: colour }} />
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          maxLength={7}
          spellCheck={false}
          className="w-28 font-mono"
        />
        {colour !== DEFAULT_SITE_NAME_COLOR ? (
          <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => onChange(DEFAULT_SITE_NAME_COLOR)}>
            {t.settings.siteNameColorReset}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
