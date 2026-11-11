import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { siteSettingsSchema, type SiteSettings } from "./schema";

export * from "./schema";

const KEY = "site";

export async function getSiteSettings(): Promise<SiteSettings> {
  const row = await db.query.siteSettings.findFirst({ where: eq(siteSettings.key, KEY) });
  const parsed = siteSettingsSchema.safeParse(row?.value ?? {});
  return parsed.success ? parsed.data : siteSettingsSchema.parse({});
}

export async function saveSiteSettings(value: SiteSettings): Promise<void> {
  await db
    .insert(siteSettings)
    .values({ key: KEY, value })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
}
