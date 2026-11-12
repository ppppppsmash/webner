import { cn } from "@/lib/utils";

/** webner wordmark: lowercase bold sans like the packaging, with a small "Germany" line. */
export function Wordmark({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span
        className={cn("text-[1.9rem] font-extrabold tracking-[-0.03em]", light ? "text-paper" : "text-brand")}
        style={{ fontFamily: "var(--font-body)" }}
      >
        webner
      </span>
      <span className={cn("mt-0.5 text-[0.58rem] font-semibold tracking-[0.32em] uppercase", light ? "text-paper/70" : "text-ink-2")}>
        Germany
      </span>
    </span>
  );
}
