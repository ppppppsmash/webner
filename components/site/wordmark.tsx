import { cn } from "@/lib/utils";

/** webner wordmark: a drop-shaped leaf glyph and the lowercase serif name. */
export function Wordmark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg viewBox="0 0 32 32" aria-hidden className="size-7 shrink-0">
        <path
          d="M16 2.5c5.4 6.3 9.5 12 9.5 17.6a9.5 9.5 0 1 1-19 0C6.5 14.5 10.6 8.8 16 2.5Z"
          fill="var(--moss)"
        />
        <path d="M16 11.5v15M16 18.5c2.3-1.2 4-3.2 4.6-5.7M16 22c-2.6-1-4.4-3-5-5.6" stroke="var(--paper)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      </svg>
      {!compact ? (
        <span className="font-display text-[1.65rem] leading-none tracking-tight text-ink" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 60' }}>
          webner
        </span>
      ) : null}
    </span>
  );
}
