import { sql } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { isLocale } from "@/lib/i18n/locales";
import { STAT_KINDS, STATS_TIME_ZONE, type StatKind } from "@/lib/view-stats";

/**
 * Counts one visit of the public site. Called by the browser (components/site/view-tracker.tsx) because the
 * pages themselves are cached and do not run on the server for every visitor.
 * Nothing about the visitor is stored: no cookie, no IP address, only a counter per day / kind / product / language.
 * Not counted: crawlers, and anyone logged in to the management panel (also covers the theme preview there).
 */

const BOT = /bot|crawl|spider|slurp|preview|monitor|headless|lighthouse|curl|wget|python|scrapy|httpclient|facebookexternalhit|whatsapp|telegram/i;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const done = () => new Response(null, { status: 204 });

export async function POST(req: Request) {
  const agent = req.headers.get("user-agent") ?? "";
  if (!agent || BOT.test(agent)) return done();

  let body: { kind?: unknown; locale?: unknown; productId?: unknown };
  try {
    const text = await req.text();
    if (text.length > 500) return done();
    body = JSON.parse(text);
  } catch {
    return done();
  }
  const kind = STAT_KINDS.find((k) => k === body.kind) as StatKind | undefined;
  const locale = typeof body.locale === "string" && isLocale(body.locale) ? body.locale : null;
  const productId = typeof body.productId === "string" && UUID.test(body.productId) ? body.productId.toLowerCase() : "";
  if (!kind || !locale || (kind === "product" && !productId)) return done();

  if ((await auth())?.user) return done();

  const day = sql`(now() at time zone ${STATS_TIME_ZONE})::date`;
  // A product id that does not exist is not counted, so the table cannot be filled with made-up ids.
  const known = productId ? sql`where exists (select 1 from products where id = ${productId}::uuid)` : sql``;
  await db.execute(sql`
    insert into view_stats (day, kind, ref, locale, count)
    select ${day}, ${kind}, ${productId}, ${locale}, 1 ${known}
    on conflict (day, kind, ref, locale) do update set count = view_stats.count + 1
  `);
  return done();
}
