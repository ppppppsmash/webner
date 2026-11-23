import { Suspense } from "react";
import { NotFoundContent } from "@/components/site/not-found-content";

/** Rendered inside the locale layout, in the language of the URL. */
export default function SiteNotFound() {
  return (
    <Suspense fallback={null}>
      <NotFoundContent />
    </Suspense>
  );
}
