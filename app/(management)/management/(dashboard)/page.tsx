import { ArrowRightIcon, FolderTreeIcon, PackageCheckIcon, PackageIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { PageSuspense } from "@/components/management/page-suspense";
import { Heading } from "@/components/management/heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDateTime } from "@/lib/format";
import { t } from "@/lib/i18n/admin";
import { pickText } from "@/lib/i18n/locales";
import { LOCALE_LABELS, isLocale } from "@/lib/i18n/locales";
import { getDashboardStats, getRecentProducts } from "@/lib/queries/dashboard";
import { getViewStats, STATS_DAYS } from "@/lib/queries/stats";

async function DashboardContent() {
  const [stats, recent, views] = await Promise.all([getDashboardStats(), getRecentProducts(), getViewStats()]);
  const peak = Math.max(1, ...views.daily.map((d) => d.views));
  const localeTotal = views.locales.reduce((sum, l) => sum + l.views, 0);
  const number = new Intl.NumberFormat("zh-TW");
  const visitCards = [
    { label: t.dashboard.visitsToday, value: views.totals.today },
    { label: t.dashboard.visitsWeek, value: views.totals.week },
    { label: t.dashboard.visitsMonth(STATS_DAYS), value: views.totals.month },
    { label: t.dashboard.shopClicks, value: views.totals.shop },
  ];

  const cards = [
    { label: t.dashboard.products, value: stats.products, icon: PackageIcon, href: "/management/products" },
    { label: t.dashboard.published, value: stats.published, icon: PackageCheckIcon, href: "/management/products" },
    { label: t.dashboard.categories, value: stats.categories, icon: FolderTreeIcon, href: "/management/categories" },
    { label: t.dashboard.admins, value: stats.admins, icon: UsersIcon, href: "/management/admins" },
  ];

  return (
    <>
      <Heading title={t.dashboard.title} description={t.dashboard.description} />
      <Separator />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="group">
            <Card className="transition-colors group-hover:bg-muted/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                <card.icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tracking-tight">{card.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.dashboard.visits}</CardTitle>
          <CardDescription>{t.dashboard.visitsHint(STATS_DAYS)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {visitCards.map((card) => (
              <div key={card.label} className="rounded-lg border px-4 py-3">
                <dt className="text-sm text-muted-foreground">{card.label}</dt>
                <dd className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{number.format(card.value)}</dd>
              </div>
            ))}
          </dl>

          <div>
            <h3 className="mb-2 text-sm font-medium">{t.dashboard.dailyViews}</h3>
            {/* One bar per day; the exact number is in the tooltip and read out by screen readers. */}
            <ol className="flex h-28 items-end gap-0.5" aria-label={t.dashboard.dailyViews}>
              {views.daily.map((d) => (
                <li key={d.day} className="group relative flex h-full flex-1 items-end" title={t.dashboard.dailyViewsLabel(d.day, d.views)}>
                  <span className="sr-only">{t.dashboard.dailyViewsLabel(d.day, d.views)}</span>
                  <span
                    aria-hidden
                    className="w-full rounded-t-sm bg-primary/70 transition-colors group-hover:bg-primary"
                    style={{ height: d.views ? `${Math.max(4, (d.views / peak) * 100)}%` : "2px", opacity: d.views ? undefined : 0.25 }}
                  />
                </li>
              ))}
            </ol>
            <div className="mt-1 flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>{views.daily[0]?.day.slice(5).replace("-", "/")}</span>
              <span>{views.daily.at(-1)?.day.slice(5).replace("-", "/")}</span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div>
              <h3 className="text-sm font-medium">{t.dashboard.productRanking}</h3>
              <p className="mb-2 text-xs text-muted-foreground">{t.dashboard.productRankingHint}</p>
              {views.products.length ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th scope="col" className="w-8 py-1.5 text-left font-normal">
                        #
                      </th>
                      <th scope="col" className="py-1.5 text-left font-normal">
                        {t.dashboard.rankProduct}
                      </th>
                      <th scope="col" className="py-1.5 text-right font-normal">
                        {t.dashboard.rankViews}
                      </th>
                      <th scope="col" className="py-1.5 pl-4 text-right font-normal">
                        {t.dashboard.rankShopClicks}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {views.products.map((p, i) => (
                      <tr key={p.id}>
                        <td className="py-2 text-muted-foreground tabular-nums">{i + 1}</td>
                        <td className="max-w-0 py-2">
                          <Link href={`/management/products/${p.id}`} className="block truncate font-medium hover:underline">
                            {pickText(p.name, "zh-TW") || p.slug}
                          </Link>
                        </td>
                        <td className="py-2 text-right tabular-nums">{number.format(p.views)}</td>
                        <td className="py-2 pl-4 text-right tabular-nums">{number.format(p.shopClicks)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-muted-foreground">{t.dashboard.noVisits}</p>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium">{t.dashboard.byLocale}</h3>
              {views.locales.length ? (
                <ul className="space-y-2.5 text-sm">
                  {views.locales.map((l) => (
                    <li key={l.locale}>
                      <div className="flex justify-between gap-2">
                        <span>{isLocale(l.locale) ? LOCALE_LABELS[l.locale] : l.locale}</span>
                        <span className="text-muted-foreground tabular-nums">
                          {number.format(l.views)}（{Math.round((l.views / localeTotal) * 100)}%）
                        </span>
                      </div>
                      <div aria-hidden className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary/70" style={{ width: `${(l.views / localeTotal) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">{t.dashboard.noVisits}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t.dashboard.recentProducts}</CardTitle>
          <Link href="/management/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            {t.dashboard.viewAll}
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {recent.length ? (
            <ul className="divide-y">
              {recent.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                  <div className="flex min-w-0 flex-col">
                    <Link href={`/management/products/${p.id}`} className="truncate font-medium hover:underline">
                      {pickText(p.name, "zh-TW") || p.slug}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {[p.categories[0] ? pickText(p.categories[0].category.name, "zh-TW") : null, formatDateTime(p.updatedAt)]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </div>
                  <Badge variant={p.visibility === "published" ? "default" : p.visibility === "hidden" ? "secondary" : "outline"}>
                    {t.products.visibilityLabels[p.visibility]}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{t.common.noResults}</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default function DashboardPage() {
  return (
    <PageSuspense>
      <DashboardContent />
    </PageSuspense>
  );
}
