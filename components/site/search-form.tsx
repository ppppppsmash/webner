import { SearchIcon } from "lucide-react";
import { Suspense } from "react";
import { SearchInput } from "@/components/site/search-input";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";

const INPUT_CLASS =
  "h-10 w-full border border-line bg-paper pr-10 pl-3 text-base text-ink placeholder:text-ink-2 focus:border-brand focus:outline-none md:text-sm";

/** Plain GET form: /{locale}/products?q=… (filtered client-side on the listing page). */
export function SearchForm({ locale, placeholder, className }: { locale: Locale; placeholder: string; className?: string }) {
  return (
    <form action={localePath(locale, "/products")} role="search" className={className}>
      <label className="relative block">
        <span className="sr-only">{placeholder}</span>
        <Suspense fallback={<input type="search" name="q" placeholder={placeholder} className={INPUT_CLASS} />}>
          <SearchInput placeholder={placeholder} className={INPUT_CLASS} />
        </Suspense>
        <button type="submit" aria-label={placeholder} className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-brand">
          <SearchIcon className="size-4" />
        </button>
      </label>
    </form>
  );
}
