import { cn } from "@/lib/utils";

/** Wordmark: the site name (management panel → 設定 → 網站名稱) in bold sans like the packaging, with a small "Germany" line. */
export function Wordmark({ name, className, light = false, onTint = false }: { name: string; className?: string; light?: boolean; onTint?: boolean }) {
  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span
        className={cn("text-[1.9rem] font-extrabold tracking-[-0.03em] whitespace-nowrap", light ? "text-paper" : "text-brand")}
        style={{ fontFamily: "var(--font-body)" }}
      >
        {name}
      </span>
      <span className={cn("mt-0.5 text-[0.58rem] font-semibold tracking-[0.32em] uppercase", light ? "text-paper/70" : onTint ? "text-ink" : "text-ink-2")}>
        Germany
      </span>
    </span>
  );
}
