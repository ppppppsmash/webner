import { z } from "zod";
import { PRODUCT_BADGES } from "@/lib/product-badges";
import { PRODUCT_VISIBILITIES } from "@/lib/product-visibility";
import { t } from "@/lib/i18n/admin";
import { SLUG_PATTERN } from "@/lib/slug";
import { hasAnyText, localizedRichTextSchema, localizedTextSchema, localizedTextSchemaWithMax } from "./localized";

export const productImageSchema = z.object({
  url: z.string().min(1).max(2000),
  alt: z.string().trim().max(200).default(""),
});

export const productVideoSchema = z.object({
  kind: z.enum(["file", "embed"]),
  url: z.string().trim().min(1).max(2000),
  title: z.string().trim().max(200).default(""),
});

/** Character limits shown as counters in the form */
export const PRODUCT_LIMITS = { summary: 300, seoTitle: 60, seoDescription: 160 } as const;
const SUMMARY_MAX = PRODUCT_LIMITS.summary;

export const productFormSchema = z.object({
  id: z.uuid().optional(),
  name: localizedTextSchema.refine(hasAnyText, { message: t.products.nameRequired }),
  summary: localizedTextSchemaWithMax(SUMMARY_MAX),
  seoTitle: localizedTextSchemaWithMax(PRODUCT_LIMITS.seoTitle),
  seoDescription: localizedTextSchemaWithMax(PRODUCT_LIMITS.seoDescription),
  description: localizedRichTextSchema,
  slug: z
    .string()
    .trim()
    .max(80)
    .refine((v) => v === "" || SLUG_PATTERN.test(v), { message: t.common.slugHint })
    .default(""),
  categoryId: z.uuid().nullable().default(null),
  volume: z.string().trim().max(100).default(""),
  externalUrl: z
    .string()
    .trim()
    .max(2000)
    .refine((v) => v === "" || /^https?:\/\//.test(v), { message: "URL" })
    .default(""),
  visibility: z.enum(PRODUCT_VISIBILITIES).default("draft"),
  /** datetime-local string from the form ("" = none) */
  publishAt: z
    .string()
    .trim()
    .refine((v) => v === "" || !Number.isNaN(new Date(v).getTime()), { message: t.products.publishAtInvalid })
    .default(""),
  isFeatured: z.boolean().default(false),
  badge: z.enum(PRODUCT_BADGES).nullable().default(null),
  sortOrder: z.number().int().min(0).max(100000).default(0),
  /** Ordered; first = main image */
  images: z.array(productImageSchema).max(30).default([]),
  videos: z.array(productVideoSchema).max(10).default([]),
  /** Manually chosen related products (ordered). Empty = automatic. */
  relatedIds: z.array(z.uuid()).max(4).default([]),
});

export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormValues = z.output<typeof productFormSchema>;
