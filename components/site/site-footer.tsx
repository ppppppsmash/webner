import Link from "next/link";
import { Suspense } from "react";
import { LocaleSwitcher } from "@/components/site/locale-switcher";
import { Wordmark } from "@/components/site/wordmark";
import type { Locale } from "@/lib/i18n/locales";
import { pickText } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";
import { getDictionary } from "@/lib/i18n/public";
import { getCategoryTree, getPublicSettings } from "@/lib/queries/public";
import { getCurrentYear } from "@/lib/year";

export async function SiteFooter({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const [settings, tree, year] = await Promise.all([getPublicSettings(), getCategoryTree(), getCurrentYear()]);

  return (
    <footer className="mt-24 border-t border-line bg-paper-2">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="space-y-4">
          <Wordmark />
          <p className="max-w-xs text-sm leading-relaxed text-ink-2">{d.footer.about}</p>
        </div>

        <div>
          <h2 className="footer-title">{d.footer.categories}</h2>
          <ul className="space-y-2 text-sm">
            {tree.map((c) => (
              <li key={c.id}>
                <Link href={localePath(locale, `/categories/${c.slug}`)} className="footer-link">
                  {pickText(c.name, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="footer-title">{d.footer.links}</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href={localePath(locale, "/products")} className="footer-link">
                {d.nav.products}
              </Link>
            </li>
            <li>
              <Link href={localePath(locale, "/about")} className="footer-link">
                {d.nav.about}
              </Link>
            </li>
            {settings.showShopLink && settings.shopUrl ? (
              <li>
                <a href={settings.shopUrl} target="_blank" rel="noreferrer" className="footer-link">
                  {d.nav.shop} ↗
                </a>
              </li>
            ) : null}
          </ul>
        </div>

        <div>
          <h2 className="footer-title">{d.footer.distributor}</h2>
          <p className="text-sm leading-relaxed text-ink-2">{d.footer.distributorBody}</p>
          {settings.showShopLink && settings.shopUrl ? (
            <a href={settings.shopUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-moss underline underline-offset-4">
              japanaceshop.com
            </a>
          ) : null}
        </div>
      </div>

      <div className="border-t border-line/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-5 text-xs text-ink-2 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} webner · {d.footer.rights}
          </p>
          <div className="flex items-center gap-6">
            <Suspense fallback={null}>
              <LocaleSwitcher current={locale} label={d.nav.language} />
            </Suspense>
            <Link href="/management" className="hover:text-ink">
              {d.footer.management}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
