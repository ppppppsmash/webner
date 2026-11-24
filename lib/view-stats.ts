/**
 * What the public site counts (see app/api/track/route.ts). Shared by the browser and the server:
 * no drizzle / server imports here.
 *   page    — any page of the public site was opened
 *   product — a product page was opened (once per browser session and product)
 *   shop    — a link to the shop was clicked (with the product it was clicked on, if any)
 */
export const STAT_KINDS = ["page", "product", "shop"] as const;
export type StatKind = (typeof STAT_KINDS)[number];

/** Days are counted in the client's time zone, so "today" in the management panel matches their calendar. */
export const STATS_TIME_ZONE = "Asia/Taipei";

export type TrackPayload = { kind: StatKind; locale: string; productId?: string };
