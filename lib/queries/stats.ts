import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import type { LocalizedText } from "@/lib/i18n/locales";
import { STATS_TIME_ZONE } from "@/lib/view-stats";

/** Length of the period shown on the dashboard (today included). */
export const STATS_DAYS = 30;

const today = sql`(now() at time zone ${STATS_TIME_ZONE})::date`;

export type DailyViews = { day: string; views: number };
export type ProductRank = { id: string; slug: string; name: LocalizedText; views: number; shopClicks: number };

/** Visits of the public site for the management dashboard: totals, a bar per day, product ranking, languages. */
export async function getViewStats() {
  const [totals, daily, products, locales] = await Promise.all([
    db.execute<{ today: number; week: number; month: number; shop: number }>(sql`
      select
        coalesce(sum(count) filter (where kind = 'page' and day = ${today}), 0)::int as today,
        coalesce(sum(count) filter (where kind = 'page' and day > ${today} - 7), 0)::int as week,
        coalesce(sum(count) filter (where kind = 'page'), 0)::int as month,
        coalesce(sum(count) filter (where kind = 'shop'), 0)::int as shop
      from view_stats
      where day > ${today} - ${STATS_DAYS}::int
    `),
    // Every day of the period, also the ones without a visit.
    db.execute<DailyViews>(sql`
      select to_char(d.day, 'YYYY-MM-DD') as day, coalesce(sum(v.count), 0)::int as views
      from generate_series(${today} - (${STATS_DAYS}::int - 1), ${today}, interval '1 day') as d(day)
      left join view_stats v on v.day = d.day::date and v.kind = 'page'
      group by d.day
      order by d.day
    `),
    db.execute<ProductRank>(sql`
      select p.id, p.slug, p.name,
        coalesce(sum(v.count) filter (where v.kind = 'product'), 0)::int as views,
        coalesce(sum(v.count) filter (where v.kind = 'shop'), 0)::int as "shopClicks"
      from view_stats v
      join products p on p.id::text = v.ref
      where v.day > ${today} - ${STATS_DAYS}::int and v.kind in ('product', 'shop')
      group by p.id
      order by views desc, "shopClicks" desc, p.slug
      limit 10
    `),
    db.execute<{ locale: string; views: number }>(sql`
      select locale, sum(count)::int as views
      from view_stats
      where kind = 'page' and day > ${today} - ${STATS_DAYS}::int
      group by locale
      order by views desc
    `),
  ]);
  return {
    totals: totals[0] ?? { today: 0, week: 0, month: 0, shop: 0 },
    daily: [...daily],
    products: [...products],
    locales: [...locales],
  };
}
