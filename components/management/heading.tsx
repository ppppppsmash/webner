/** Page title with a left-to-right clip reveal and an underline that slides in (CSS only). */
export function Heading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-1">
      <div className="inline-block overflow-hidden">
        <h1 className="page-title text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        <div className="page-title-rule mt-1 h-px bg-foreground/25" />
      </div>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}
