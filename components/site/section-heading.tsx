import { cn } from "@/lib/utils";

/** Centered serif section title with an optional lead, in the style of German brand shops. */
export function SectionHeading({ title, lead, className }: { title: string; lead?: string; className?: string }) {
  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      <h2 className="section-title">{title}</h2>
      {lead ? <p className="mt-3 text-base text-ink-2">{lead}</p> : null}
      <span aria-hidden className="mx-auto mt-4 block h-px w-12 bg-tint" />
    </div>
  );
}
