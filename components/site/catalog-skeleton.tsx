/** Static fallback while a product or category page streams in (keeps the shell instant). */
export function CatalogSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-6 pt-12 md:pt-16" aria-hidden>
      <div className="h-3 w-24 rounded bg-paper-2" />
      <div className="mt-4 h-10 w-72 max-w-full rounded bg-paper-2" />
      <div className="mt-10 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
        <div className="hidden space-y-3 lg:block">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 w-32 rounded bg-paper-2" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-6 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] rounded-2xl bg-paper-2" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-6 pt-8 md:pt-12" aria-hidden>
      <div className="h-3 w-40 rounded bg-paper-2" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="aspect-[4/5] rounded-3xl bg-paper-2" />
        <div className="space-y-4 lg:pt-6">
          <div className="h-3 w-24 rounded bg-paper-2" />
          <div className="h-10 w-3/4 rounded bg-paper-2" />
          <div className="h-5 w-full rounded bg-paper-2" />
          <div className="h-24 w-full rounded bg-paper-2" />
        </div>
      </div>
    </div>
  );
}
