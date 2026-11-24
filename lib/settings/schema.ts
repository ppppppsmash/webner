import { z } from "zod";
import { DEFAULT_SITE_THEME, isSiteThemeId } from "@/lib/site-themes";

export const DEFAULT_SITE_NAME = "webner";

export const DEFAULT_SITE_NAME_COLOR = "#333333";

export const siteSettingsSchema = z.object({
  /** Shown on the public site: logo text, browser tab title, copyright line. Empty falls back to "webner". */
  siteName: z
    .string()
    .trim()
    .max(100)
    .default(DEFAULT_SITE_NAME)
    .transform((v) => v || DEFAULT_SITE_NAME),
  /** Colour of the site name in the logo (header and footer), as #rrggbb. */
  siteNameColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, { message: "請輸入 # 加 6 位數的色碼，例如 #333333" })
    .default(DEFAULT_SITE_NAME_COLOR),
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
