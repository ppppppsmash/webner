import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { LocaleSwitcher } from "@/components/site/locale-switcher";
import { MobileMenu, type MenuItem } from "@/components/site/mobile-menu";
import { Wordmark } from "@/components/site/wordmark";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";
import { getDictionary } from "@/lib/i18n/public";
import { getPublicSettings } from "@/lib/queries/public";

export async function SiteHeader({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const settings = await getPublicSettings();

  const items: MenuItem[] = [
    { href: localePath(locale, "/products"), label: d.nav.products },
    { href: localePath(locale, "/about"), label: d.nav.about },
  ];
  if (settings.showShopLink && settings.shopUrl) {
    items.push({ href: settings.shopUrl, label: d.nav.shop, external: true, accent: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur supports-backdrop-filter:bg-paper/80">
      {/* utility strip */}
      <div className="hidden border-b border-line/70 md:block">
        <div className="mx-auto flex h-8 max-w-6xl items-center justify-between px-6 text-[0.72rem] tracking-wide text-ink-2">
          <span>{d.hero.eyebrow}</span>
          <Suspense fallback={null}>
            <LocaleSwitcher current={locale} label={d.nav.language} />
          </Suspense>
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href={localePath(locale)} aria-label={d.nav.home} className="rounded-md">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {items
            .filter((i) => !i.external)
            .map((item) => (
              <Link key={item.href} href={item.href} className="nav-link">
                {item.label}
              </Link>
            ))}
          {items
            .filter((i) => i.external)
            .map((item) => (
              <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className="btn-outline">
                {item.label}
                <ArrowUpRightIcon className="size-3.5" />
              </a>
            ))}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <MobileMenu items={items} openLabel={d.nav.menu} closeLabel={d.nav.close}>
            <Suspense fallback={null}>
              <LocaleSwitcher current={locale} label={d.nav.language} className="text-base" />
            </Suspense>
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}
