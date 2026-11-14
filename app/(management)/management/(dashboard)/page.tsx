import { ArrowRightIcon, FolderTreeIcon, PackageCheckIcon, PackageIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { PageSuspense } from "@/components/management/page-suspense";
import { Heading } from "@/components/management/heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDateTime } from "@/lib/format";
import { t } from "@/lib/i18n/admin";
import { pickText } from "@/lib/i18n/locales";
import { getDashboardStats, getRecentProducts } from "@/lib/queries/dashboard";

async function DashboardContent() {
  const [stats, recent] = await Promise.all([getDashboardStats(), getRecentProducts()]);

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
                      {[p.category ? pickText(p.category.name, "zh-TW") : null, formatDateTime(p.updatedAt)]
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
