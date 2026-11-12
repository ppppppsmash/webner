import { z } from "zod";

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
});

export type SiteSettings = z.output<typeof siteSettingsSchema>;
export type SiteSettingsInput = z.input<typeof siteSettingsSchema>;
