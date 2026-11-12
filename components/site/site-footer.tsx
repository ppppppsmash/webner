import Link from "next/link";
import { Suspense } from "react";
import { LocaleSwitcher } from "@/components/site/locale-switcher";
import { Wordmark } from "@/components/site/wordmark";
import { type Locale, pickText } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";
import { getDictionary } from "@/lib/i18n/public";
import { getCategoryTree, getPublicSettings } from "@/lib/queries/public";
import { getCurrentYear } from "@/lib/year";

export async function SiteFooter({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const [settings, tree, year] = await Promise.all([getPublicSettings(), getCategoryTree(), getCurrentYear()]);
  const shopUrl = settings.showShopLink && settings.shopUrl ? settings.shopUrl : null;

  return (
    <footer className="mt-20 bg-tint text-ink">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        <div className="space-y-4">
          <Wordmark />
          <p className="max-w-xs text-sm leading-relaxed">{d.footer.about}</p>
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
            {shopUrl ? (
              <li>
                <a href={shopUrl} target="_blank" rel="noreferrer" className="footer-link">
                  {d.nav.shop} ↗
                </a>
              </li>
            ) : null}
          </ul>
        </div>

        <div>
          <h2 className="footer-title">{d.footer.distributor}</h2>
          <p className="text-sm leading-relaxed">{d.footer.distributorBody}</p>
          {shopUrl ? (
            <a href={shopUrl} target="_blank" rel="noreferrer" className="btn-primary mt-4">
              {d.nav.shop}
            </a>
          ) : null}
        </div>
      </div>

      <div className="border-t border-brand/15">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-5 text-xs md:flex-row md:items-center md:justify-between">
          <p>
            © {year} webner · {d.footer.rights}
          </p>
          <div className="flex items-center gap-6">
            <Suspense fallback={null}>
              <LocaleSwitcher current={locale} label={d.nav.language} />
            </Suspense>
            <Link href="/management" className="hover:text-brand">
              {d.footer.management}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
