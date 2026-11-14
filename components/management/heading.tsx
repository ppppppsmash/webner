/** Page title with a short underline. */
export function Heading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-1">
      <div className="inline-block">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        <div className="mt-1 h-px bg-foreground/25" />
      </div>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}
