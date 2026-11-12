import { ArrowUpRightIcon, ChevronDownIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { LocaleSwitcher } from "@/components/site/locale-switcher";
import { MobileMenu, type MenuItem } from "@/components/site/mobile-menu";
import { SearchForm } from "@/components/site/search-form";
import { Wordmark } from "@/components/site/wordmark";
import { type Locale, pickText } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";
import { getDictionary } from "@/lib/i18n/public";
import { getCategoryTree, getPublicSettings } from "@/lib/queries/public";

/**
 * Three-tier header in the style of German brand shops:
 * brand-coloured utility bar → logo / search / shop → light-blue navigation strip.
 */
export async function SiteHeader({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const [settings, tree] = await Promise.all([getPublicSettings(), getCategoryTree()]);
  const shopUrl = settings.showShopLink && settings.shopUrl ? settings.shopUrl : null;

  const categoryItems = tree.map((c) => ({ href: localePath(locale, `/categories/${c.slug}`), label: pickText(c.name, locale), children: c.children }));

  const mobileItems: MenuItem[] = [
    { href: localePath(locale), label: d.nav.home },
    {
      href: localePath(locale, "/products"),
      label: d.nav.products,
      children: categoryItems.map((c) => ({ href: c.href, label: c.label })),
    },
    { href: localePath(locale, "/about"), label: d.nav.about },
    ...(shopUrl ? [{ href: shopUrl, label: d.nav.shop, external: true, accent: true }] : []),
  ];

  return (
    <header className="border-b border-line bg-paper">
      {/* tier 1: utility bar */}
      <div className="bg-brand text-paper">
        <div className="mx-auto flex h-9 max-w-6xl items-center justify-between px-4 text-[0.72rem] tracking-wide md:px-6">
          <span className="hidden truncate sm:inline">{d.hero.eyebrow}</span>
          <Suspense fallback={null}>
            <LocaleSwitcher current={locale} label={d.nav.language} tone="light" />
          </Suspense>
        </div>
      </div>

      {/* tier 2: logo, search, shop */}
      <div className="mx-auto flex h-20 max-w-6xl items-center gap-6 px-4 md:px-6">
        <Link href={localePath(locale)} aria-label={d.nav.home} className="shrink-0">
          <Wordmark />
        </Link>
        <SearchForm locale={locale} placeholder={d.products.searchPlaceholder} className="hidden flex-1 md:block md:max-w-md lg:mx-auto" />
        <div className="ml-auto flex items-center gap-3">
          {shopUrl ? (
            <a href={shopUrl} target="_blank" rel="noreferrer" className="btn-outline hidden md:inline-flex">
              {d.nav.shop}
              <ArrowUpRightIcon className="size-4" />
            </a>
          ) : null}
          <Suspense fallback={<span className="size-10 lg:hidden" />}>
            <MobileMenu items={mobileItems} openLabel={d.nav.menu} closeLabel={d.nav.close}>
              <SearchForm locale={locale} placeholder={d.products.searchPlaceholder} className="mb-6" />
              <LocaleSwitcher current={locale} label={d.nav.language} className="text-base" />
            </MobileMenu>
          </Suspense>
        </div>
      </div>

      {/* tier 3: navigation strip */}
      <nav aria-label="Main" className="hidden bg-tint-soft lg:block">
        <ul className="mx-auto flex h-12 max-w-6xl items-stretch justify-center gap-9 px-6">
          <li className="flex">
            <Link href={localePath(locale)} className="nav-link">
              {d.nav.home}
            </Link>
          </li>
          <li className="group/nav relative flex">
            <Link href={localePath(locale, "/products")} className="nav-link">
              {d.nav.products}
              <ChevronDownIcon className="size-3.5 text-ink-2" />
            </Link>
            {/* hover / focus dropdown with the category tree */}
            <div className="invisible absolute top-full left-1/2 z-40 w-[40rem] -translate-x-1/2 opacity-0 transition-opacity group-hover/nav:visible group-hover/nav:opacity-100 group-focus-within/nav:visible group-focus-within/nav:opacity-100">
              <div className="mt-px grid grid-cols-4 gap-6 border border-line bg-paper p-6 shadow-[0_18px_40px_-20px_rgba(20,30,60,0.35)]">
                {categoryItems.map((c) => (
                  <div key={c.href}>
                    <Link href={c.href} className="font-display block text-base text-brand hover:underline">
                      {c.label}
                    </Link>
                    <ul className="mt-2 space-y-1">
                      {c.children.map((ch) => (
                        <li key={ch.id}>
                          <Link href={localePath(locale, `/categories/${ch.slug}`)} className="text-sm text-ink-2 hover:text-brand">
                            {pickText(ch.name, locale)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </li>
          {categoryItems.slice(0, 4).map((c) => (
            <li key={c.href} className="flex">
              <Link href={c.href} className="nav-link">
                {c.label}
              </Link>
            </li>
          ))}
          <li className="flex">
            <Link href={localePath(locale, "/about")} className="nav-link">
              {d.nav.about}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
