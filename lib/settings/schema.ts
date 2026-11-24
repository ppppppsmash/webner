import { z } from "zod";
import { DEFAULT_SITE_THEME, isSiteThemeId } from "@/lib/site-themes";

export const siteSettingsSchema = z.object({
  siteName: z.string().trim().max(100).default("webner"),
  /** Show "buy on japanaceshop.com" links on the gallery. Can be switched off later. */
  showShopLink: z.boolean().default(true),
  shopUrl: z
    .string()
    .trim()
    .max(2000)
    .refine((v) => v === "" || /^https?:\/\//.test(v), { message: "URL" })
    .default("https://www.japanaceshop.com/categories/webner"),
  /** Full-width photo behind the home hero (uploaded in the management panel). */
  heroImageUrl: z.string().trim().max(2000).default(""),
  /** Colour theme of the public site: an id from lib/site-themes.ts. An id that no longer exists falls back to the default. */
  siteTheme: z.string().refine(isSiteThemeId, { message: "theme" }).default(DEFAULT_SITE_THEME).catch(DEFAULT_SITE_THEME),
});

export type SiteSettings = z.output<typeof siteSettingsSchema>;
export type SiteSettingsInput = z.input<typeof siteSettingsSchema>;
