/** Static fallback while a product or category page streams in (keeps the shell instant). */
export function CatalogSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-6 pt-10 md:pt-14" aria-hidden>
      <div className="mx-auto h-3 w-24 bg-paper-2" />
      <div className="mx-auto mt-4 h-9 w-64 max-w-full bg-paper-2" />
      <div className="mt-10 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
        <div className="hidden space-y-3 lg:block">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 w-32 bg-paper-2" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-6 md:gap-x-4 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-paper-2" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-6 pt-8 md:pt-10" aria-hidden>
      <div className="h-3 w-40 bg-paper-2" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="aspect-square bg-paper-2" />
        <div className="space-y-4 lg:pt-4">
          <div className="h-3 w-24 bg-paper-2" />
          <div className="h-9 w-3/4 bg-paper-2" />
          <div className="h-5 w-full bg-paper-2" />
          <div className="h-24 w-full bg-paper-2" />
        </div>
      </div>
    </div>
  );
}
