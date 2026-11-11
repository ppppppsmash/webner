import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="space-y-3">
        <Skeleton className="h-9 w-full max-w-sm" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

/**
 * Each management page streams its database-backed content behind this
 * boundary. A boundary inside the page segment (not only `loading.tsx` on the
 * shared layout) keeps client navigations between sibling pages instant.
 */
export function PageSuspense({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>;
}
